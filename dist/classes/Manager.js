"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Manager = void 0;
const managers_1 = require("./managers");
class Manager {
    #client;
    events = new managers_1.EventManager(this);
    constructor(client) {
        this.#client = client;
    }
    get client() {
        return this.#client;
    }
}
exports.Manager = Manager;
//# sourceMappingURL=Manager.js.map