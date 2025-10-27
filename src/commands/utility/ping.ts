import { SlashCommandBuilder } from '@discordjs/builders';
import type { CommandInteraction } from 'discord.js';
import type { Command } from '../../types/index.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('replies to ping with "pong!"'),
    async execute(interaction: CommandInteraction): Promise<void> {
        await interaction.reply('Pong!');
    },
} satisfies Command;
