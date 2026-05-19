"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GentIDClient = exports.GentIDError = void 0;
class GentIDError extends Error {
    constructor(statusCode, message, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'GentIDError';
    }
}
exports.GentIDError = GentIDError;
const DEFAULT_BASE_URL = 'https://api.gentid.com';
class GentIDClient {
    constructor({ baseUrl = DEFAULT_BASE_URL, apiKey }) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
        this.apiKey = apiKey;
    }
    async request(method, path, body, auth = true) {
        const url = `${this.baseUrl}/api/v1${path}`;
        const headers = { 'Content-Type': 'application/json' };
        if (auth)
            headers['Authorization'] = `Bearer ${this.apiKey}`;
        const res = await fetch(url, {
            method,
            headers,
            ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new GentIDError(res.status, data.error ?? res.statusText, data.code);
        }
        return data;
    }
    // ─── Agents ───────────────────────────────────────────────────────────────────
    /** Create a new agent identity. Store the returned privateKey — it is never shown again. */
    async createAgent(params) {
        return this.request('POST', '/agents', params);
    }
    async getAgent(id) {
        return this.request('GET', `/agents/${encodeURIComponent(id)}`);
    }
    async listAgents(owner, options) {
        const params = new URLSearchParams({ owner });
        if (options?.limit !== undefined)
            params.set('limit', String(options.limit));
        if (options?.offset !== undefined)
            params.set('offset', String(options.offset));
        return this.request('GET', `/agents?${params}`);
    }
    async revokeAgent(id) {
        return this.request('POST', `/agents/${encodeURIComponent(id)}/revoke`);
    }
    async suspendAgent(id) {
        return this.request('POST', `/agents/${encodeURIComponent(id)}/suspend`);
    }
    async reactivateAgent(id) {
        return this.request('POST', `/agents/${encodeURIComponent(id)}/reactivate`);
    }
    // ─── Signatures ───────────────────────────────────────────────────────────────
    async signMessage(agentId, message) {
        return this.request('POST', '/signatures/sign', { agentId, message });
    }
    async verifySignature(agentId, message, signature) {
        return this.request('POST', '/signatures/verify', { agentId, message, signature });
    }
    // ─── Verification ─────────────────────────────────────────────────────────────
    /** Public — no API key required. Verify any agent's identity and public key. */
    async lookupAgent(agentId) {
        return this.request('GET', `/verification/lookup/${encodeURIComponent(agentId)}`, undefined, false);
    }
    async requestVerification(agentId, type) {
        return this.request('POST', '/verification/request', { agentId, type });
    }
    async getVerificationStatus(agentId) {
        const params = new URLSearchParams({ agentId });
        return this.request('GET', `/verification/status?${params}`);
    }
    // ─── Permissions ──────────────────────────────────────────────────────────────
    async getPermissions(agentId) {
        return this.request('GET', `/portal/agents/${encodeURIComponent(agentId)}/permissions`);
    }
    async setPermissions(agentId, permissions) {
        return this.request('PUT', `/portal/agents/${encodeURIComponent(agentId)}/permissions`, { permissions });
    }
    // ─── Trust ────────────────────────────────────────────────────────────────────
    async listTrustedAgents(agentId) {
        return this.request('GET', `/portal/agents/${encodeURIComponent(agentId)}/trust`);
    }
    async grantTrust(grantorAgentId, params) {
        return this.request('POST', `/portal/agents/${encodeURIComponent(grantorAgentId)}/trust`, params);
    }
    async revokeTrust(grantorAgentId, trustId) {
        return this.request('DELETE', `/portal/agents/${encodeURIComponent(grantorAgentId)}/trust/${encodeURIComponent(trustId)}`);
    }
    // ─── Badge ────────────────────────────────────────────────────────────────────
    /** Returns badge data + embed snippet. No API key required. */
    async getBadge(agentId) {
        return this.request('GET', `/badge/${encodeURIComponent(agentId)}`, undefined, false);
    }
    // ─── Delegation ───────────────────────────────────────────────────────────────
    /**
     * Issue a signed permission token for an agent.
     * The JWT encodes the agent's identity + permissions and can be verified
     * by any third party without calling GentID (offline-verifiable).
     */
    async getToken(agentId) {
        return this.request('GET', `/portal/agents/${encodeURIComponent(agentId)}/token`);
    }
    /**
     * Verify a permission token issued by GentID.
     * No API key required — useful for third-party server verification.
     */
    async verifyToken(token) {
        return this.request('POST', '/verification/verify-token', { token }, false);
    }
    /**
     * Request owner approval for an action above the agent's configured threshold.
     * The org owner is notified in real time and has 15 minutes to approve or reject.
     */
    async requestApproval(agentId, action, metadata) {
        return this.request('POST', `/agents/${encodeURIComponent(agentId)}/request-approval`, {
            action,
            metadata: metadata ?? {},
        });
    }
}
exports.GentIDClient = GentIDClient;
//# sourceMappingURL=client.js.map