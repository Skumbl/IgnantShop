import { SlashCommandBuilder } from '@discordjs/builders';
import type { CommandInteraction } from 'discord.js';
import type { Command } from '../../types/index.js';

export default {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Get information about the server'),
    async execute(interaction: CommandInteraction): Promise<void> {
        if (!interaction.guild) {
            await interaction.reply('This command can only be used in a server.');
            return;
        }
        await interaction.reply(`Server ID: ${interaction.guild.id}`);
    },
} satisfies Command;
