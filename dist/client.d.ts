import type { GentIDClientOptions, Agent, CreatedAgent, SignResult, VerifyResult, VerificationRecord, VerificationType, ListAgentsResult, LookupResult } from './types';
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
}
//# sourceMappingURL=client.d.ts.map