import { SlashCommandBuilder } from '@discordjs/builders';
import type { CommandInteraction } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Get information about the user'),
    async execute(interaction: CommandInteraction) {
        await interaction.reply(`User ID: ${interaction.user.id}`);
    }
}
