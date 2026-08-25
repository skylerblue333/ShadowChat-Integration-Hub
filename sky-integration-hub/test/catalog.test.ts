import assert from 'node:assert/strict';
import test from 'node:test';

import { IntegrationCatalog } from '../src/index.js';

test('registers normalized integration metadata and sorts capabilities', () => {
  const catalog = new IntegrationCatalog();
  const record = catalog.register({
    id: ' Calendar.Adapter ',
    version: '1.2.3',
    capabilities: ['events.read', 'events.write', 'events.read'],
    status: 'available',
  });

  assert.deepEqual(record, {
    id: 'calendar.adapter',
    version: '1.2.3',
    capabilities: ['events.read', 'events.write'],
    status: 'available',
  });
});

test('compatibility requires declared capabilities and available status', () => {
  const catalog = new IntegrationCatalog();
  catalog.register({ id: 'calendar', version: '1.0.0', capabilities: ['events.read'], status: 'available' });
  catalog.register({ id: 'drive', version: '2.0.0', capabilities: ['files.read'], status: 'disabled' });

  assert.equal(catalog.contract('calendar', ['events.read'])?.compatible, true);
  assert.equal(catalog.contract('calendar', ['events.write'])?.compatible, false);
  assert.equal(catalog.contract('drive', ['files.read'])?.compatible, false);
  assert.equal(catalog.contract('missing'), null);
});

test('rejects unsafe identifiers versions and capabilities', () => {
  const catalog = new IntegrationCatalog();
  assert.throws(
    () => catalog.register({ id: '../bad', version: '1.0.0', capabilities: ['read'], status: 'available' }),
    TypeError,
  );
  assert.throws(
    () => catalog.register({ id: 'good', version: 'latest', capabilities: ['read'], status: 'available' }),
    TypeError,
  );
  assert.throws(
    () => catalog.register({ id: 'good', version: '1.0.0', capabilities: ['../secret'], status: 'available' }),
    TypeError,
  );
});

test('returns defensive copies instead of mutable catalog internals', () => {
  const catalog = new IntegrationCatalog();
  catalog.register({ id: 'chat', version: '1.0.0', capabilities: ['messages.read'], status: 'available' });
  const record = catalog.get('chat')!;
  (record.capabilities as string[]).push('messages.write');
  assert.deepEqual(catalog.get('chat')?.capabilities, ['messages.read']);
});
