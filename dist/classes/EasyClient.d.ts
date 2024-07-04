import { Client, ClientOptions, IntentsBitField, Message } from "discord.js";
export type PrefixResolvable = string | Prefix;
export type Prefix = (client: EasyClient, message: Message) => string | Promise<string>;
export interface IRawEasyClientOptions extends ClientOptions {
    token?: string;
    prefixes?: PrefixResolvable[];
}
export interface IEasyClientOptions extends Omit<IRawEasyClientOptions, "prefixes"> {
    prefixes: Prefix[];
}
export declare class EasyClient extends Client<true> {
    #private;
    options: (Omit<ClientOptions, "intents"> & {
        intents: IntentsBitField;
    }) & IEasyClientOptions;
    constructor(options: IRawEasyClientOptions);
    login(token?: string): Promise<string>;
}
//# sourceMappingURL=EasyClient.d.ts.map