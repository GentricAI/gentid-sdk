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
  /** 0–100 trust score computed from age, owner verification, signature volume, and verified records. */
  trustScore: number;
}

export interface AgentPermissions {
  agentId: string;
  permissions: Record<string, unknown>;
}

export interface AgentTrustGrant {
  id: string;
  granteeAgentId: string;
  scope: string[];
  expiresAt: string | null;
  createdAt: string;
}

export interface BadgeData {
  agentId: string;
  name: string;
  status: AgentStatus;
  owner: string;
  trustScore: number;
  issuedAt: string;
  embedUrl: string;
  embedSnippet: string;
}

export interface PermissionToken {
  token: string;
  expiresAt: string;
}

export interface VerifiedToken {
  valid: true;
  agentId: string;
  agentName: string;
  owner: string;
  status: string;
  permissions: Record<string, unknown>;
  issuedAt: string;
  expiresAt: string;
}

export interface ApprovalRequest {
  id: string;
  agentId: string;
  agentName: string;
  orgId: string;
  action: string;
  metadata: Record<string, unknown>;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  requestedAt: string;
  resolvedAt: string | null;
  expiresAt: string;
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
