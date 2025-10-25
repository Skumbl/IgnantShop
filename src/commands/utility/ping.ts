import { SlashCommandBuilder } from '@discordjs/builders';
import type { CommandInteraction } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('replies to ping with "pong!"'),
    async execute(interaction: CommandInteraction) {
        await interaction.reply('Pong!');
    }
}
