# @gentid/sdk

TypeScript SDK for [GentID](https://gentid.com) — cryptographic identity infrastructure for AI agents.

## Installation

```bash
npm install @gentid/sdk
```

Requires Node.js 18 or later.

## Quick start

```typescript
import { GentIDClient } from '@gentid/sdk';

const gentid = new GentIDClient({
  apiKey: process.env.GENTID_API_KEY!, // gid_live_...
});

// 1. Create an agent identity
const agent = await gentid.createAgent({ name: 'payments-bot', owner: 'acme-corp' });
console.log(agent.id); // gentic:agent:a3f9d2c1e8b4

// ⚠ Store agent.privateKey securely — it is returned only once, never again.

// 2. Sign any action
const { signature } = await gentid.signMessage(agent.id, 'approve-payment-$500');

// 3. Verify from anywhere — no API key needed
const { valid } = await gentid.verifySignature(agent.id, 'approve-payment-$500', signature);
console.log(valid); // true
```

## API reference

### Agents

```typescript
// Create a new agent identity
const agent: CreatedAgent = await gentid.createAgent({ name: string, owner: string });
// agent.privateKey is returned ONCE — store it in your secrets vault

// Get an agent
const agent: Agent = await gentid.getAgent(agentId);

// List agents by owner
const { agents, total } = await gentid.listAgents('acme-corp', { limit: 50, offset: 0 });

// Status management
await gentid.suspendAgent(agentId);    // temporarily disable
await gentid.reactivateAgent(agentId); // re-enable
await gentid.revokeAgent(agentId);     // permanent — cannot be undone
```

### Signatures

```typescript
// Sign a message with an agent's private key (stored server-side)
const { signature, messageHash, logId } = await gentid.signMessage(agentId, message);

// Verify a signature
const { valid } = await gentid.verifySignature(agentId, message, signature);
```

### Verification

```typescript
// Public lookup — no API key required
// Anyone can verify an agent's identity and public key
const identity: LookupResult = await gentid.lookupAgent(agentId);
// { id, name, status, publicKey, algorithm, owner, issuedAt }

// Request human/domain verification for an agent
const record = await gentid.requestVerification(agentId, 'manual'); // 'email' | 'domain' | 'manual'

// Check verification status
const records = await gentid.getVerificationStatus(agentId);
```

## Error handling

All methods throw `GentIDError` on failure:

```typescript
import { GentIDClient, GentIDError } from '@gentid/sdk';

try {
  await gentid.getAgent('gentic:agent:invalid');
} catch (err) {
  if (err instanceof GentIDError) {
    console.error(err.statusCode); // 404
    console.error(err.message);   // "Agent not found"
    console.error(err.code);      // "AGENT_NOT_FOUND"
  }
}
```

## Configuration

```typescript
const gentid = new GentIDClient({
  apiKey: 'gid_live_...', // required
  baseUrl: 'https://api.gentid.com', // optional — this is the default
});
```

## Verifying webhook signatures

If you use GentID webhooks, verify the `X-GentID-Signature` header:

```typescript
import crypto from 'crypto';

function verifyWebhook(secret: string, rawBody: string, signatureHeader: string): boolean {
  const [tPart, v1Part] = signatureHeader.split(',');
  const timestamp = tPart.replace('t=', '');
  const expected  = v1Part.replace('v1=', '');
  const sig = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}
```

## License

MIT
