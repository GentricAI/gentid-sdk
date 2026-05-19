import type { GentIDClientOptions, Agent, CreatedAgent, SignResult, VerifyResult, VerificationRecord, VerificationType, ListAgentsResult, LookupResult, AgentPermissions, AgentTrustGrant, BadgeData, PermissionToken, VerifiedToken, ApprovalRequest } from './types';
export declare class GentIDError extends Error {
    readonly statusCode: number;
    readonly code?: string | undefined;
    constructor(statusCode: number, message: string, code?: string | undefined);
}
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