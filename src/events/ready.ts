import { Events } from 'discord.js';
import type { Client } from 'discord.js';

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client: Client) {
        console.log(`Logged in as ${client.user?.tag}!`);
    }
};
