import { Client, Collection, GatewayIntentBits } from 'discord.js';
import type { Command } from './types/index.js';

export class ExtendedClient extends Client {
    commands: Collection<string, Command>;

    constructor() {
        super({ intents: [GatewayIntentBits.Guilds] });
        this.commands = new Collection();
    }
}
