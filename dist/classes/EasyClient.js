"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EasyClient = void 0;
const discord_js_1 = require("discord.js");
class EasyClient extends discord_js_1.Client {
    constructor(options) {
        super({
            ...options,
        });
        this.#init(options);
    }
    #init(opts) {
        this.options.prefixes =
            opts.prefixes?.map((x) => typeof x === "function"
                ? x
                : function () {
                    return x.toString();
                }) ?? [];
    }
    login(token) {
        return super.login(token ?? this.options.token);
    }
}
exports.EasyClient = EasyClient;
//# sourceMappingURL=EasyClient.js.map