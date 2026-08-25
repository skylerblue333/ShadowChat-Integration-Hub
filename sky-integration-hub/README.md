# SkyIntegrationHub (#167)

Status: **engineering beta / integration catalog library**.

This isolated package adds a bounded integration metadata and compatibility catalog to the existing repository without claiming the surrounding historical application is a verified production integration platform.

## Implemented behavior

- bounded lowercase integration identifiers
- numeric semantic versions (`major.minor.patch`)
- 1–32 validated, deduplicated capability identifiers
- available/disabled state
- deterministic catalog ordering and defensive copies
- capability compatibility checks
- stable `sky.integration.catalog.v1` contract
- strict TypeScript typecheck/build, deterministic Node tests, formatting check, and production dependency audit

## SKYCOIN4444 integration

A future SkyAPIControlPlane, SkyServiceRegistry, or product-specific adapter can query `IntegrationCatalog.contract()` for versioned integration metadata and declared capability compatibility without coupling to provider credentials or transport code.

## Security and truth boundary

The catalog stores metadata only. It does **not** connect to providers, execute HTTP requests, perform OAuth, store secrets/tokens, verify provider availability, synchronize data, deliver webhooks, authenticate users, or prove external integrations are configured. `compatible: true` means only that the registered metadata advertises all requested capabilities while enabled.
