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

export class GentIDClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor({ baseUrl = DEFAULT_BASE_URL, apiKey }: GentIDClientOptions) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
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
}
