import { REST, Routes } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';

const token: string | undefined = process.env.DISCORD_TOKEN;
const clientId: string | undefined = process.env.CLIENT_ID;
const guildId: string | undefined = process.env.GUILD_ID;

if (!token || !clientId || !guildId) {
    console.error('Missing required environment variables.');
    process.exit(1);
}

// fuck type saftey, I'm not going back to write a new type
const commands: any[] = [];

const folderPath = path.join(import.meta.dirname, 'commands');

const commandFolders = fs.readdirSync(folderPath);

// loop thought all folders for slash commands
for (const folder of commandFolders) {
    const commandsPath = path.join(folderPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file =>
        file.endsWith('ts') || file.endsWith('js'),
    );

    // loop through each files
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const commandModule = await import(filePath);
        const command = commandModule.default;

        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        }
        else {
            console.error(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const rest = new REST().setToken(token);

// deploy this shit
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} slash commands.`);

        const data: any = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        ) as any;

        console.log(`Successfully reloaded ${data.length} application commands.`);
    }
    catch (error) {
        console.error('error deploying commands', error);
    }
})();
