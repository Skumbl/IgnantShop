import { Events, MessageFlags, Collection } from 'discord.js';
import { ExtendedClient } from './client.js';
import fs from 'node:fs';
import path from 'node:path';

const { token } = process.env;
const client: ExtendedClient = new ExtendedClient();

await loadCommands();

client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = (interaction.client as ExtendedClient).commands.get(interaction.commandName);

    if (!command) {
        console.error(`no command matching ${interaction.commandName}`);
        return;
    }

    try {
        await command.execute(interaction);
    }
    catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: 'There was an error while executing this command!',
                flags: MessageFlags.Ephemeral,
            });
        } else {
            await interaction.reply({
                content: 'There was an error while executing this command!',
                flags: MessageFlags.Ephemeral,
            });
        }
    }
});

// function for looping through the commands dir and loading in all slash functions
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
                console.log(`Oh fuck, the command at ${filePath} is missing a required "data" or "execute" prop`);
            }
        }
    }
}

client.login(token);
