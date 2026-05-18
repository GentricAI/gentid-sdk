"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GentIDError = exports.GentIDClient = void 0;
var client_1 = require("./client");
Object.defineProperty(exports, "GentIDClient", { enumerable: true, get: function () { return client_1.GentIDClient; } });
Object.defineProperty(exports, "GentIDError", { enumerable: true, get: function () { return client_1.GentIDError; } });
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
//# sourceMappingURL=index.js.map