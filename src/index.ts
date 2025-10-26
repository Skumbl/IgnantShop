import { ExtendedClient } from './client.js';
import fs from 'node:fs';
import path from 'node:path';

const { token } = process.env;
const client: ExtendedClient = new ExtendedClient();

await loadCommands();
await loadEvents();
client.login(token);

// function to load all slash functions and set command in client
async function loadCommands() {
    const folderPath = path.join(import.meta.dirname, 'commands');
    const commandFolders = fs.readdirSync(folderPath);

    for (const folder of commandFolders) {
        const commandsPath: string = path.join(folderPath, folder);
        const commandsFiles = fs.readdirSync(commandsPath).filter(file =>
            file.endsWith('.ts') || file.endsWith('.js')
        );

        for (const file of commandsFiles) {
            const filePath: string = path.join(commandsPath, file);
            const commandModule = await import(`file://${filePath}`);
            const command = commandModule.default;

            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
            }
            else {
                console.log(`[WARNING] the command at ${filePath} is missing a required "data" or "execute" prop`);
            }
        }
    }
}

// functon to load all eventss
async function loadEvents() {
    const eventsPath = path.join(import.meta.dirname, 'events');
    const eventsFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.ts') || file.endsWith('.js'));

    for (const file of eventsFiles) {
        const filePath = path.join(eventsPath, file);
        const eventModule = await import(`file://${filePath}`);
        const event = eventModule.default;

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        }
        else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
}
