import { EasyClient } from ".";
import { EventManager } from "./managers";

export class Manager {
  #client: EasyClient;
  public readonly events = new EventManager(this);
  public constructor(client: EasyClient) {
    this.#client = client;
  }

  get client() {
    return this.#client;
  }
}
