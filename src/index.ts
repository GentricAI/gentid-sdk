export { GentIDClient, GentIDError } from './client';
export type {
  Agent,
  CreatedAgent,
  SignResult,
  VerifyResult,
  VerificationRecord,
  VerificationType,
  VerificationStatus,
  AgentStatus,
  LookupResult,
  ListAgentsResult,
  GentIDClientOptions,
  AgentPermissions,
  AgentTrustGrant,
  BadgeData,
} from './types';

// Quick start:
//
// import { GentIDClient } from '@gentid/sdk';
//
// const gentid = new GentIDClient({ apiKey: 'gid_live_xxxx' });
//
// const agent = await gentid.createAgent({ name: 'payments-bot', owner: 'acme-corp' });
// // ⚠  store agent.privateKey — it is never returned again
//
// const { signature } = await gentid.signMessage(agent.id, 'approve-payment-42');
// const { valid } = await gentid.verifySignature(agent.id, 'approve-payment-42', signature);
//
// // Public lookup — no API key needed
// const identity = await gentid.lookupAgent(agent.id);
