import { SlashCommandBuilder } from '@discordjs/builders';
import type { CommandInteraction } from 'discord.js';
import type { Command } from '../../types/index.js';

export default {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Get information about the user'),
    async execute(interaction: CommandInteraction): Promise<void> {
        await interaction.reply(`User ID: ${interaction.user.id}`);
    },
} satisfies Command;
