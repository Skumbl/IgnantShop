import { Events, MessageFlags } from 'discord.js';
import type { Interaction } from 'discord.js';
import type { ExtendedClient } from '../client.js';
import type { Event, Command } from '../types/index.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction: Interaction): Promise<void> {
        if (!interaction.isChatInputCommand()) return;

        const command: Command | undefined =
            (interaction.client as ExtendedClient).commands.get(interaction.commandName);
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
            }
            else {
                await interaction.reply({
                    content: 'There was an error while executing this command!',
                    flags: MessageFlags.Ephemeral,
                });
            }
        }
    },
} satisfies Event<Events.InteractionCreate>;
