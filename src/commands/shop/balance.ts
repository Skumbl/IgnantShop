import { SlashCommandBuilder, EmbedBuilder } from '@discordjs/builders';
import type { ChatInputCommandInteraction } from 'discord.js';
import type { Command } from '../../types/index.js';
import { getBalance } from '../../database/wallet.js';

export default {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your balance'),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const userId: string = interaction.user.id;
        const balance_amount: number | null = getBalance(userId);
        const colbyCoinGif: string = 'https://imgur.com/brnP6lL.gif';

        if (balance_amount === null) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(0xFF1A00)
                .setDescription('You don\'t have an account yet, shidass');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        if (balance_amount === 0) {
            const brokeEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(0xFF1A00)
                .setTitle('BROKE')
                .setDescription(`${interaction.user.displayName} has **0** Ignant Points`)
                .setTimestamp()
                .setImage(colbyCoinGif);
            await interaction.reply({ embeds: [brokeEmbed] });
            return;
        }

        const balanceEmbed: EmbedBuilder = new EmbedBuilder()
            .setColor(0x0066FF)
            .setTitle('Balance')
            .setDescription(`${interaction.user.displayName} has **${balance_amount}** Ignant Points`)
            .setTimestamp()
            .setImage(colbyCoinGif);
        await interaction.reply({ embeds: [balanceEmbed] });
    },
} satisfies Command;
