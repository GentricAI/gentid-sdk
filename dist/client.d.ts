import { type DiscoveryDocument } from '@gentid/protocol';
import type { GentIDClientOptions, Agent, CreatedAgent, SignResult, VerifyResult, VerificationRecord, VerificationType, ListAgentsResult, LookupResult, AgentPermissions, AgentTrustGrant, BadgeData, PermissionToken, VerifiedToken, ApprovalRequest } from './types';
export declare class GentIDError extends Error {
    readonly statusCode: number;
    readonly code?: string | undefined;
    constructor(statusCode: number, message: string, code?: string | undefined);
}
/**
 * @deprecated Registry-era client, preserved for compatibility. GentID is now a
 * federated protocol: issue identities from your own node (`npx @gentid/cli init`)
 * and verify with `@gentid/auth` v2 / `@gentid/core` — no registry API involved.
 * See https://gentid.com/docs#migration
 */
export declare class GentIDClient {
    private readonly baseUrl;
    private readonly apiKey;
    constructor({ baseUrl, apiKey }: GentIDClientOptions);
    private request;
    /** Create a new agent identity. Store the returned privateKey — it is never shown again. */
    createAgent(params: {
        name: string;
        owner: string;
    }): Promise<CreatedAgent>;
    getAgent(id: string): Promise<Agent>;
    listAgents(owner: string, options?: {
        limit?: number;
        offset?: number;
    }): Promise<ListAgentsResult>;
    revokeAgent(id: string): Promise<Agent>;
    suspendAgent(id: string): Promise<Agent>;
    reactivateAgent(id: string): Promise<Agent>;
    signMessage(agentId: string, message: string): Promise<SignResult>;
    verifySignature(agentId: string, message: string, signature: string): Promise<VerifyResult>;
    /** Public — no API key required. Verify any agent's identity and public key. */
    lookupAgent(agentId: string): Promise<LookupResult>;
    requestVerification(agentId: string, type: VerificationType): Promise<VerificationRecord>;
    getVerificationStatus(agentId: string): Promise<VerificationRecord[]>;
    getPermissions(agentId: string): Promise<AgentPermissions>;
    setPermissions(agentId: string, permissions: Record<string, unknown>): Promise<AgentPermissions>;
    listTrustedAgents(agentId: string): Promise<AgentTrustGrant[]>;
    grantTrust(grantorAgentId: string, params: {
        granteeAgentId: string;
        scope?: string[];
        expiresAt?: string;
    }): Promise<AgentTrustGrant>;
    revokeTrust(grantorAgentId: string, trustId: string): Promise<void>;
    /** Returns badge data + embed snippet. No API key required. */
    getBadge(agentId: string): Promise<BadgeData>;
    /**
     * Fetches the protocol discovery document for another GentID-compatible issuer —
     * e.g. `gentid.discover("identity.apple.com")`. Useful when you need to verify
     * agents issued by an instance other than the one this client is configured
     * against. Does not require an API key.
     */
    discover(issuerHost: string): Promise<DiscoveryDocument>;
    /**
     * Issue a signed permission token for an agent.
     * The JWT encodes the agent's identity + permissions and can be verified
     * by any third party without calling GentID (offline-verifiable).
     */
    getToken(agentId: string): Promise<PermissionToken>;
    /**
     * Verify a permission token issued by GentID.
     * No API key required — useful for third-party server verification.
     */
    verifyToken(token: string): Promise<VerifiedToken>;
    /**
     * Request owner approval for an action above the agent's configured threshold.
     * The org owner is notified in real time and has 15 minutes to approve or reject.
     */
    requestApproval(agentId: string, action: string, metadata?: Record<string, unknown>): Promise<ApprovalRequest>;
}
//# sourceMappingURL=client.d.ts.map