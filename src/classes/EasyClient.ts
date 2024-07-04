import { Client, ClientOptions, IntentsBitField, Message } from "discord.js";

/**
 * Resolvable for client prefixes
 */
export type PrefixResolvable = string | Prefix;

/**
 * Prefix function
 */
export type Prefix = (
  client: EasyClient,
  message: Message,
) => string | Promise<string>;
/**
 * The raw client options.
 */
export interface IRawEasyClientOptions extends ClientOptions {
  /**
   * Bot's token.
   */
  token?: string;

  prefixes?: PrefixResolvable[];
}

export interface IEasyClientOptions
  extends Omit<IRawEasyClientOptions, "prefixes"> {
  prefixes: Prefix[];
}

/**
 * The EasyClient class.
 */
export class EasyClient extends Client<true> {
  public declare options: (Omit<ClientOptions, "intents"> & {
    intents: IntentsBitField;
  }) &
    IEasyClientOptions;

  public constructor(options: IRawEasyClientOptions) {
    super({
      ...options,
    });
    this.#init(options);
  }

  #init(opts: IRawEasyClientOptions) {
    this.options.prefixes =
      opts.prefixes?.map((x) =>
        typeof x === "function"
          ? x
          : function () {
              return x.toString();
            },
      ) ?? [];
  }

  public override login(token?: string) {
    return super.login(token ?? this.options.token);
  }
}
