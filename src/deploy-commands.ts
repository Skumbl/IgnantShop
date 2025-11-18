import { REST, Routes } from 'discord.js';
import type { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import type { Command } from './types/index.js';

const token: string | undefined = process.env.DISCORD_TOKEN;
const clientId: string | undefined = process.env.CLIENT_ID;
const guildId: string | undefined = process.env.GUILD_ID;

if (!token || !clientId || !guildId) {
    console.error('Missing required environment variables.');
    process.exit(1);
}

const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
const folderPath: string = path.join(import.meta.dirname, 'commands');
const commandFolders: string[] = fs.readdirSync(folderPath);

// loop thought all folders for slash commands
for (const folder of commandFolders) {
    const commandsPath: string = path.join(folderPath, folder);
    const commandFiles: string[] = fs.readdirSync(commandsPath).filter((file: string) =>
        (file.endsWith('.ts') || file.endsWith('.js')) && !file.endsWith('.d.ts')
    );

    // loop through each files
    for (const file of commandFiles) {
        const filePath: string = path.join(commandsPath, file);
        const command: Command | undefined = (await import(filePath)).default;

        if (!command) {
            console.error(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            continue;
        }

        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        }
        else {
            console.error(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const rest: REST = new REST().setToken(token);

// deploy this shit
(async (): Promise<void> => {
    try {
        console.log(`Started refreshing ${commands.length} slash commands.`);

        const data: unknown = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        const commandData: RESTPostAPIChatInputApplicationCommandsJSONBody[] =
            data as RESTPostAPIChatInputApplicationCommandsJSONBody[];

        console.log(`Successfully reloaded ${commandData.length} application commands.`);
    }
    catch (error: unknown) {
        console.error('Error deploying commands:', error);
    }
})();
