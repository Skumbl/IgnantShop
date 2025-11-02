import { ExtendedClient } from './client.js';
import fs from 'node:fs';
import path from 'node:path';
import { initDB } from './database/index.js';
import type { Command, Event } from './types/index.js';

const token: string | undefined = process.env.DISCORD_TOKEN;
const client: ExtendedClient = new ExtendedClient();

initDB();
await loadCommands();
await loadEvents();

client.login(token);

// function to load all slash functions and set command in client
async function loadCommands(): Promise<void> {
    const folderPath: string = path.join(import.meta.dirname, 'commands');
    const commandFolders: string[] = fs.readdirSync(folderPath);

    for (const folder of commandFolders) {
        const commandsPath: string = path.join(folderPath, folder);
        const commandsFiles: string[] = fs.readdirSync(commandsPath).filter((file: string) =>
            file.endsWith('.ts') || file.endsWith('.js'),
        );

        for (const file of commandsFiles) {
            const filePath: string = path.join(commandsPath, file);
            const command: Command | undefined = (await import(`file://${filePath}`)).default;

            if (!command) {
                console.log(`[WARNING] ${filePath} has no default export`);
                continue;
            }

            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                console.log(`[Success] Loaded command: ${command.data.name}`);
            }
            else {
                console.log(`[WARNING] ${filePath} is missing "data" or "execute" property`);
            }
        }
    }
}

// function to load all events
// function to load all events
async function loadEvents(): Promise<void> {
    const eventsPath: string = path.join(import.meta.dirname, 'events');
    const eventsFiles: string[] = fs.readdirSync(eventsPath).filter((file: string) => file.endsWith('.ts') || file.endsWith('.js'));

    for (const file of eventsFiles) {
        const filePath: string = path.join(eventsPath, file);
        const event: Event | undefined = (await import(`file://${filePath}`)).default;

        if (!event) {
            console.log(`[WARNING] ${filePath} has no default export`);
            continue;
        }

        if (event.once) {
            client.once(event.name, (...args: unknown[]) => event.execute(...args));
        }
        else {
            client.on(event.name, (...args: unknown[]) => event.execute(...args));
        }
    }
}
