import { SlashCommandBuilder, EmbedBuilder } from '@discordjs/builders';
import type { ChatInputCommandInteraction } from 'discord.js';
import type { Command } from '../../types/index.js';
import { getAllWallets } from '../../database/wallet.js';
import { getUserInventoryValue } from '../../database/inventory.js';
import { colors } from '../../config/colors.js';

interface LeaderboardEntry {
    user_id: string;
    balance: number;
    inventoryValue: number;
    totalWorth: number;
}

export default {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the Ignant Points leaderboard'),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const wallets: { user_id: string; balance: number }[] = getAllWallets();

        if (!wallets || wallets.length === 0) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(colors.red)
                .setDescription('No accounts found');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        // Calculate total worth
        const leaderboardData: LeaderboardEntry[] = wallets.map((wallet: { user_id: string; balance: number }) => {
            const inventoryValue: number = getUserInventoryValue(wallet.user_id);
            const totalWorth: number = wallet.balance + inventoryValue;
            return {
                user_id: wallet.user_id,
                balance: wallet.balance,
                inventoryValue,
                totalWorth,
            };
        });

        leaderboardData.sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.totalWorth - a.totalWorth);

        const leaderboardText: string = leaderboardData
            .slice(0, 10)
            .map((data: LeaderboardEntry, index: number) => {
                const medal: string = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
                return `${medal} <@${data.user_id}>\n` +
                    `   Balance: ${data.balance} | Inventory: ${data.inventoryValue} | **Total: ${data.totalWorth}**`;
            })
            .join('\n\n');

        const leaderboardEmbed: EmbedBuilder = new EmbedBuilder()
            .setColor(colors.yellow)
            .setTitle('Ignant Points Leaderboard')
            .setDescription(leaderboardText || 'No data available')
            .setFooter({ text: `Total accounts: ${wallets.length}` })
            .setTimestamp();

        await interaction.reply({ embeds: [leaderboardEmbed] });
    },
} satisfies Command;
