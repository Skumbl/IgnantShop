import { Events } from 'discord.js';
import type { Client } from 'discord.js';

export default {
    name: Events.ClientReady,
    once: true,
    execute(client: Client): void {
        console.log(`Logged in as ${client.user?.tag}!`);
    },
};
