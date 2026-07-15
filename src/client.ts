import { resolveDiscovery, type DiscoveryDocument } from '@gentid/protocol';
import type {
  GentIDClientOptions,
  Agent,
  CreatedAgent,
  SignResult,
  VerifyResult,
  VerificationRecord,
  VerificationType,
  ListAgentsResult,
  LookupResult,
  AgentPermissions,
  AgentTrustGrant,
  BadgeData,
  PermissionToken,
  VerifiedToken,
  ApprovalRequest,
} from './types';

export class GentIDError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'GentIDError';
  }
}

const DEFAULT_BASE_URL = 'https://api.gentid.com';

let deprecationWarned = false;

/**
 * @deprecated Registry-era client, preserved for compatibility. GentID is now a
 * federated protocol: issue identities from your own node (`npx @gentid/cli init`)
 * and verify with `@gentid/auth` v2 / `@gentid/core` — no registry API involved.
 * See https://gentid.com/docs#migration
 */
export class GentIDClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor({ baseUrl = DEFAULT_BASE_URL, apiKey }: GentIDClientOptions) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
    if (!deprecationWarned) {
      deprecationWarned = true;
      const warn =
        '@gentid/sdk v1 is the registry-era API and is deprecated. GentID is now a ' +
        'federated protocol: see https://gentid.com/docs#migration for the v2 path ' +
        '(@gentid/core, @gentid/auth, @gentid/cli).';
      if (typeof process !== 'undefined' && typeof process.emitWarning === 'function') {
        process.emitWarning(warn, 'DeprecationWarning');
      } else {
        console.warn(warn);
      }
    }
  }

  private async request<T>(method: string, path: string, body?: unknown, auth = true): Promise<T> {
    const url = `${this.baseUrl}/api/v1${path}`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (auth) headers['Authorization'] = `Bearer ${this.apiKey}`;

    const res = await fetch(url, {
      method,
      headers,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new GentIDError(
        res.status,
        (data as { error?: string }).error ?? res.statusText,
        (data as { code?: string }).code,
      );
    }

    return data as T;
  }

  // ─── Agents ───────────────────────────────────────────────────────────────────

  /** Create a new agent identity. Store the returned privateKey — it is never shown again. */
  async createAgent(params: { name: string; owner: string }): Promise<CreatedAgent> {
    return this.request<CreatedAgent>('POST', '/agents', params);
  }

  async getAgent(id: string): Promise<Agent> {
    return this.request<Agent>('GET', `/agents/${encodeURIComponent(id)}`);
  }

  async listAgents(owner: string, options?: { limit?: number; offset?: number }): Promise<ListAgentsResult> {
    const params = new URLSearchParams({ owner });
    if (options?.limit !== undefined) params.set('limit', String(options.limit));
    if (options?.offset !== undefined) params.set('offset', String(options.offset));
    return this.request<ListAgentsResult>('GET', `/agents?${params}`);
  }

  async revokeAgent(id: string): Promise<Agent> {
    return this.request<Agent>('POST', `/agents/${encodeURIComponent(id)}/revoke`);
  }

  async suspendAgent(id: string): Promise<Agent> {
    return this.request<Agent>('POST', `/agents/${encodeURIComponent(id)}/suspend`);
  }

  async reactivateAgent(id: string): Promise<Agent> {
    return this.request<Agent>('POST', `/agents/${encodeURIComponent(id)}/reactivate`);
  }

  // ─── Signatures ───────────────────────────────────────────────────────────────

  async signMessage(agentId: string, message: string): Promise<SignResult> {
    return this.request<SignResult>('POST', '/signatures/sign', { agentId, message });
  }

  async verifySignature(agentId: string, message: string, signature: string): Promise<VerifyResult> {
    return this.request<VerifyResult>('POST', '/signatures/verify', { agentId, message, signature });
  }

  // ─── Verification ─────────────────────────────────────────────────────────────

  /** Public — no API key required. Verify any agent's identity and public key. */
  async lookupAgent(agentId: string): Promise<LookupResult> {
    return this.request<LookupResult>('GET', `/verification/lookup/${encodeURIComponent(agentId)}`, undefined, false);
  }

  async requestVerification(agentId: string, type: VerificationType): Promise<VerificationRecord> {
    return this.request<VerificationRecord>('POST', '/verification/request', { agentId, type });
  }

  async getVerificationStatus(agentId: string): Promise<VerificationRecord[]> {
    const params = new URLSearchParams({ agentId });
    return this.request<VerificationRecord[]>('GET', `/verification/status?${params}`);
  }

  // ─── Permissions ──────────────────────────────────────────────────────────────

  async getPermissions(agentId: string): Promise<AgentPermissions> {
    return this.request<AgentPermissions>('GET', `/portal/agents/${encodeURIComponent(agentId)}/permissions`);
  }

  async setPermissions(agentId: string, permissions: Record<string, unknown>): Promise<AgentPermissions> {
    return this.request<AgentPermissions>('PUT', `/portal/agents/${encodeURIComponent(agentId)}/permissions`, { permissions });
  }

  // ─── Trust ────────────────────────────────────────────────────────────────────

  async listTrustedAgents(agentId: string): Promise<AgentTrustGrant[]> {
    return this.request<AgentTrustGrant[]>('GET', `/portal/agents/${encodeURIComponent(agentId)}/trust`);
  }

  async grantTrust(
    grantorAgentId: string,
    params: { granteeAgentId: string; scope?: string[]; expiresAt?: string },
  ): Promise<AgentTrustGrant> {
    return this.request<AgentTrustGrant>('POST', `/portal/agents/${encodeURIComponent(grantorAgentId)}/trust`, params);
  }

  async revokeTrust(grantorAgentId: string, trustId: string): Promise<void> {
    return this.request<void>('DELETE', `/portal/agents/${encodeURIComponent(grantorAgentId)}/trust/${encodeURIComponent(trustId)}`);
  }

  // ─── Badge ────────────────────────────────────────────────────────────────────

  /** Returns badge data + embed snippet. No API key required. */
  async getBadge(agentId: string): Promise<BadgeData> {
    return this.request<BadgeData>('GET', `/badge/${encodeURIComponent(agentId)}`, undefined, false);
  }

  // ─── Discovery ────────────────────────────────────────────────────────────────

  /**
   * Fetches the protocol discovery document for another GentID-compatible issuer —
   * e.g. `gentid.discover("identity.apple.com")`. Useful when you need to verify
   * agents issued by an instance other than the one this client is configured
   * against. Does not require an API key.
   */
  async discover(issuerHost: string): Promise<DiscoveryDocument> {
    return resolveDiscovery(issuerHost);
  }

  // ─── Delegation ───────────────────────────────────────────────────────────────

  /**
   * Issue a signed permission token for an agent.
   * The JWT encodes the agent's identity + permissions and can be verified
   * by any third party without calling GentID (offline-verifiable).
   */
  async getToken(agentId: string): Promise<PermissionToken> {
    return this.request<PermissionToken>('GET', `/portal/agents/${encodeURIComponent(agentId)}/token`);
  }

  /**
   * Verify a permission token issued by GentID.
   * No API key required — useful for third-party server verification.
   */
  async verifyToken(token: string): Promise<VerifiedToken> {
    return this.request<VerifiedToken>('POST', '/verification/verify-token', { token }, false);
  }

  /**
   * Request owner approval for an action above the agent's configured threshold.
   * The org owner is notified in real time and has 15 minutes to approve or reject.
   */
  async requestApproval(
    agentId: string,
    action: string,
    metadata?: Record<string, unknown>,
  ): Promise<ApprovalRequest> {
    return this.request<ApprovalRequest>('POST', `/agents/${encodeURIComponent(agentId)}/request-approval`, {
      action,
      metadata: metadata ?? {},
    });
  }
}
