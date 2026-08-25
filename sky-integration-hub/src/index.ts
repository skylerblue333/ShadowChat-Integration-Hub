export type IntegrationStatus = 'available' | 'disabled';

export interface IntegrationDefinition {
  readonly id: string;
  readonly version: string;
  readonly capabilities: readonly string[];
  readonly status: IntegrationStatus;
}

export interface IntegrationContract {
  readonly schema: 'sky.integration.catalog.v1';
  readonly id: string;
  readonly version: string;
  readonly capabilities: readonly string[];
  readonly compatible: boolean;
}

const ID = /^[a-z][a-z0-9._-]{1,63}$/;
const VERSION = /^[0-9]+\.[0-9]+\.[0-9]+$/;
const CAPABILITY = /^[a-z][a-z0-9._:-]{0,63}$/;
const MAX_CAPABILITIES = 32;
const MAX_INTEGRATIONS = 200;

function normalizeDefinition(input: IntegrationDefinition): IntegrationDefinition {
  const id = input.id.trim().toLowerCase();
  const version = input.version.trim();
  if (!ID.test(id)) throw new TypeError('integration id must be a bounded lowercase identifier');
  if (!VERSION.test(version)) throw new TypeError('version must use numeric semver major.minor.patch');
  if (input.status !== 'available' && input.status !== 'disabled') throw new TypeError('invalid integration status');
  if (!Array.isArray(input.capabilities) || input.capabilities.length === 0 || input.capabilities.length > MAX_CAPABILITIES) {
    throw new TypeError(`capabilities must contain 1-${MAX_CAPABILITIES} items`);
  }
  const capabilities = [...new Set(input.capabilities.map((value) => value.trim().toLowerCase()))].sort();
  if (capabilities.some((value) => !CAPABILITY.test(value))) throw new TypeError('invalid capability identifier');
  return { id, version, capabilities, status: input.status };
}

export class IntegrationCatalog {
  private readonly records = new Map<string, IntegrationDefinition>();

  register(input: IntegrationDefinition): IntegrationDefinition {
    const definition = normalizeDefinition(input);
    if (!this.records.has(definition.id) && this.records.size >= MAX_INTEGRATIONS) {
      throw new RangeError('integration catalog capacity reached');
    }
    this.records.set(definition.id, definition);
    return this.get(definition.id)!;
  }

  get(id: string): IntegrationDefinition | undefined {
    const record = this.records.get(id.trim().toLowerCase());
    return record ? { ...record, capabilities: [...record.capabilities] } : undefined;
  }

  list(): IntegrationDefinition[] {
    return [...this.records.values()]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((record) => ({ ...record, capabilities: [...record.capabilities] }));
  }

  contract(id: string, requiredCapabilities: readonly string[] = []): IntegrationContract | null {
    const record = this.get(id);
    if (!record) return null;
    const required = [...new Set(requiredCapabilities.map((value) => value.trim().toLowerCase()))].sort();
    if (required.some((value) => !CAPABILITY.test(value))) throw new TypeError('invalid required capability');
    return {
      schema: 'sky.integration.catalog.v1',
      id: record.id,
      version: record.version,
      capabilities: [...record.capabilities],
      compatible: record.status === 'available' && required.every((item) => record.capabilities.includes(item)),
    };
  }
}

export const INTEGRATION_LIMITS = { MAX_CAPABILITIES, MAX_INTEGRATIONS } as const;
