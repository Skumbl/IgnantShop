import { SlashCommandBuilder } from '@discordjs/builders';
import type { ChatInputCommandInteraction } from 'discord.js';
import type { Command } from '../../types/index.js';
import { getBalance } from '../../database/wallet.js';

export default {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your balance'),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const balance_amount: number | null = getBalance(interaction.user.id);

        if (balance_amount === null) {
            await interaction.reply('make an account shidass');
        }
        else if (balance_amount === 0) {
            await interaction.reply(':rotating_light: **BROKE** :rotating_light: ');
        }
        await interaction.reply(`${interaction.user.username} has ${balance_amount} Ignant Points`);
    },
} as Command;
