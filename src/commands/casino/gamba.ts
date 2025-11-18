import { SlashCommandBuilder, EmbedBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { award, deduct, getBalance } from '../../database/wallet.js';
import type { Command } from '../../types/index.js';

export default {
    data: new SlashCommandBuilder()
        .setName('gamba')
        .setDescription('Slot machine gambling')
        .addNumberOption((option: any) =>
            option.setName('bet')
                .setDescription('The amount of coins to bet')
                .setRequired(true),
        ),
    execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
        const userId: string = interaction.user.id;
        const bet: number | null = interaction.options.getNumber('bet');

        if (!bet || bet <= 0) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(0xFF1A00)
                .setDescription('Please enter a valid bet amount.');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        const balance: number | null = getBalance(userId);

        if (balance === null || bet > balance) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(0xFF1A00)
                .setDescription(`You don't have enough coins. Balance: ${balance || 0} coins`);
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        deduct(userId, bet);

        const slot1: number = Math.floor(Math.random() * 10);
        const slot2: number = Math.floor(Math.random() * 10);
        const slot3: number = Math.floor(Math.random() * 10);

        let winnings: number = 0;
        let resultText: string = '';

        if (slot1 === slot2 && slot2 === slot3) {
            if (slot1 === 7) {
                winnings = bet * 10;
                resultText = 'TRIPLE SEVENS JACKPOT!';
            }
            else {
                winnings = bet * 5;
                resultText = 'TRIPLE MATCH!';
            }
        }

        else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
            winnings = bet * 2;
            resultText = 'Double Match!';
        }

        else {
            resultText = 'No match...';
        }

        if (winnings > 0) {
            award(userId, winnings);
        }

        const profit: number = winnings - bet;
        const newBalance: number = (balance || 0) - bet + winnings;
        const embedColor: number = profit > 0 ? 0x00FF00 : profit === 0 ? 0xFFFF00 : 0xFF1A00;

        const slotEmbed: EmbedBuilder = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle('🎰 Slot Machine 🎰')
            .setDescription(`**[ ${slot1} | ${slot2} | ${slot3} ]**\n\n${resultText}`)
            .addFields(
                { name: 'Bet', value: `${bet} coins`, inline: true },
                { name: 'Won', value: `${winnings} coins`, inline: true },
                { name: 'Profit', value: `${profit >= 0 ? '+' : ''}${profit} coins`, inline: true },
                { name: 'New Balance', value: `${newBalance} coins`, inline: false },
            )
            .setFooter({ text: `${interaction.user.username}` })
            .setTimestamp();

        await interaction.reply({ embeds: [slotEmbed] });
    },
} satisfies Command;
