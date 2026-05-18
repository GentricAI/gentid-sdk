export type AgentStatus = 'active' | 'revoked' | 'suspended';
export type VerificationType = 'email' | 'domain' | 'manual';
export type VerificationStatus = 'pending' | 'verified' | 'failed';
export interface Agent {
    id: string;
    name: string;
    owner: string;
    publicKey: string;
    status: AgentStatus;
    createdAt: string;
    updatedAt: string;
}
export interface CreatedAgent extends Agent {
    /** Returned only once at creation — store it securely. */
    privateKey: string;
}
export interface SignResult {
    agentId: string;
    messageHash: string;
    signature: string;
    logId: string;
}
export interface VerifyResult {
    valid: boolean;
    agentId: string;
    messageHash: string;
}
export interface VerificationRecord {
    id: string;
    agentId: string;
    type: VerificationType;
    status: VerificationStatus;
    createdAt: string;
    updatedAt: string;
    hint?: string;
}
/** Public lookup result — no API key required. */
export interface LookupResult {
    id: string;
    name: string;
    status: AgentStatus;
    publicKey: string;
    algorithm: string;
    owner: string;
    issuedAt: string;
}
export interface ListAgentsResult {
    agents: Agent[];
    total: number;
}
export interface GentIDClientOptions {
    apiKey: string;
    /** Defaults to https://api.gentid.com */
    baseUrl?: string;
}
//# sourceMappingURL=types.d.ts.map