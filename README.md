# @gentid/sdk

TypeScript SDK for [GentID](https://gentid.com) — cryptographic identity, permissions, and agent gateway infrastructure for AI agents.

[![npm version](https://img.shields.io/npm/v/@gentid/sdk.svg)](https://www.npmjs.com/package/@gentid/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Installation

```bash
npm install @gentid/sdk
```

Requires Node.js 18 or later.

---

## Quick start

```typescript
import { GentIDClient } from '@gentid/sdk';

const gentid = new GentIDClient({
  apiKey: process.env.GENTID_API_KEY!, // gid_live_...
});

// 1. Create an agent identity
const agent = await gentid.createAgent({ name: 'payments-bot', owner: 'acme-corp' });
// ⚠  Store agent.privateKey — it is returned only once, never again.

// 2. Sign any action
const { signature } = await gentid.signMessage(agent.id, 'approve-payment-$500');

// 3. Verify from anywhere — no API key needed
const { valid } = await gentid.verifySignature(agent.id, 'approve-payment-$500', signature);

// 4. Issue a permission token for a third party to verify
const { token } = await gentid.getToken(agent.id);

// 5. Any server can verify the token offline — no API key needed
const verified = await gentid.verifyToken(token);
// { valid: true, agentId, agentName, owner, permissions, ... }
```

---

## Agents

```typescript
// Create
const agent = await gentid.createAgent({ name: 'my-agent', owner: 'acme-corp' });

// Read
const agent = await gentid.getAgent('gentic:agent:a3f9d2c1e8b4');
const { agents, total } = await gentid.listAgents('acme-corp', { limit: 50, offset: 0 });

// Lifecycle
await gentid.suspendAgent(agent.id);
await gentid.reactivateAgent(agent.id);
await gentid.revokeAgent(agent.id);  // permanent
```

## Signatures

```typescript
// Sign a message locally, then log to GentID for audit
const { signature } = await gentid.signMessage(agent.id, 'approve-order-123');

// Verify — public endpoint, no API key required
const { valid } = await gentid.verifySignature(agent.id, 'approve-order-123', signature);
```

## Verification

```typescript
// Public lookup — no API key required
// Returns identity, public key, status, and trust score (0–100)
const identity = await gentid.lookupAgent('gentic:agent:a3f9d2c1e8b4');
// { id, name, status, publicKey, algorithm, owner, issuedAt, trustScore }

// Request formal verification (email | domain | manual)
await gentid.requestVerification(agent.id, 'domain');
const records = await gentid.getVerificationStatus(agent.id);
```

## Permissions

Set what each agent is allowed to do. Permissions are free-form JSON — define any schema that fits your use case.

```typescript
// Set permissions for an agent
await gentid.setPermissions(agent.id, {
  travel_booking: true,
  max_transaction_usd: 1500,
  allowed_merchants: ['delta.com', 'united.com'],
  expires_at: '2026-12-31T00:00:00Z',
});

// Read back
const { permissions } = await gentid.getPermissions(agent.id);
```

## Permission tokens

Issue a signed JWT that encodes the agent's identity and permissions. Any third party can verify it — online or offline.

```typescript
// Agent side — get a short-lived signed token (1 hour TTL)
const { token, expiresAt } = await gentid.getToken(agent.id);

// Attach to outgoing requests
fetch('https://partner-site.com/api/book', {
  headers: { 'Authorization': `GentID ${token}` },
});

// Third-party server — verify with no API key
const result = await gentid.verifyToken(token);
// {
//   valid: true,
//   agentId: 'gentic:agent:...',
//   agentName: 'payments-bot',
//   owner: 'acme-corp',
//   status: 'active',
//   permissions: { travel_booking: true, max_transaction_usd: 1500 },
//   issuedAt: '...',
//   expiresAt: '...',
// }
```

## Approval requests

Request a human owner to approve an action in real time. The owner has 15 minutes to respond via the GentID dashboard.

```typescript
const request = await gentid.requestApproval(
  agent.id,
  'purchase-macbook-pro',
  { merchant: 'apple.com', amount: 1799, currency: 'USD' },
);
// { id, status: 'pending', expiresAt, ... }
// Owner receives a real-time push notification and approves/rejects in the dashboard.
```

## Trust

Grant one agent the ability to act on behalf of another, within a scoped set of permissions.

```typescript
// Grant trust
const grant = await gentid.grantTrust(agentA.id, {
  granteeAgentId: agentB.id,
  scope: ['read', 'sign'],
  expiresAt: '2026-12-31T00:00:00Z',
});

// List and revoke
const grants = await gentid.listTrustedAgents(agentA.id);
await gentid.revokeTrust(agentA.id, grant.id);
```

## Badge

Embed a verified identity badge on any page.

```typescript
// No API key required
const badge = await gentid.getBadge(agent.id);
// badge.embedSnippet — paste into any HTML page
// badge.trustScore   — 0–100 public trust score
```

---

## Agent Gateway — `@gentid/auth`

To accept GentID-authenticated agents on your server, install the companion middleware package:

```bash
npm install @gentid/auth
```

### Express

```typescript
import { gentidAuth } from '@gentid/auth/express';

app.use('/api', gentidAuth());

app.post('/api/book', (req, res) => {
  const { agentName, permissions } = req.agent!;
  res.json({ ok: true, bookedBy: agentName });
});
```

### Next.js (App Router)

```typescript
// app/api/book/route.ts
import { withGentidAuth } from '@gentid/auth/next';

export const POST = withGentidAuth(async (req, agent) => {
  return Response.json({ ok: true, bookedBy: agent.agentName });
});
```

### Cloudflare Worker

```typescript
import { withGentidAuth } from '@gentid/auth/cloudflare';

export default {
  fetch: withGentidAuth(async (request, agent, env, ctx) => {
    return Response.json({ agent: agent.agentName });
  }),
};
```

---

## Error handling

All methods throw `GentIDError` on non-2xx responses:

```typescript
import { GentIDClient, GentIDError } from '@gentid/sdk';

try {
  const agent = await gentid.getAgent('gentic:agent:does-not-exist');
} catch (err) {
  if (err instanceof GentIDError) {
    console.log(err.statusCode); // 404
    console.log(err.code);       // 'AGENT_NOT_FOUND'
    console.log(err.message);    // 'Agent not found'
  }
}
```

---

## Configuration

```typescript
const gentid = new GentIDClient({
  apiKey: 'gid_live_xxxxxxxxxxxx',  // required
  baseUrl: 'https://api.gentid.com', // optional override
});
```

API keys are generated in the [GentID dashboard](https://gentid.com/dashboard/api-keys). Keys are prefixed with `gid_live_` for production.

---

## Links

- [Documentation](https://gentid.com/docs)
- [Dashboard](https://gentid.com/dashboard)
- [npm — @gentid/sdk](https://www.npmjs.com/package/@gentid/sdk)
- [GitHub — gentid-sdk](https://github.com/010101G/gentid-sdk)
- [npm — @gentid/auth](https://www.npmjs.com/package/@gentid/auth)
- [GitHub — gentid-auth](https://github.com/010101G/gentid-auth)
