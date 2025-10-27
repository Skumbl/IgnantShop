import { Events } from 'discord.js';
import type { Client } from 'discord.js';
import type { Event } from '../types/index.js';

export default {
    name: Events.ClientReady,
    once: true,
    execute(client: Client<true>): void {
        console.log(`Logged in as ${client.user?.tag}!`);
    },
} satisfies Event<Events.ClientReady>;
