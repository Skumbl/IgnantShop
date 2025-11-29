import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import type { Command } from '../../types/index.js';
import { getAllLostRecords, type LostRecord } from '../../database/lost.js';
import { colors } from '../../config/colors.js';

interface LostLeaderboardEntry {
    user_id: string;
    amount: number;
}

export default {
    data: new SlashCommandBuilder()
        .setName('loser-leaderboard')
        .setDescription('See fools separated from their money'),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const lostRecords: LostRecord[] = getAllLostRecords();

        if (!lostRecords || lostRecords.length === 0) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(colors.red)
                .setDescription('No losers found');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        // Sort by amount lost (descending)
        const leaderboardData: LostLeaderboardEntry[] = lostRecords
            .map((record: LostRecord) => ({
                user_id: record.user_id,
                amount: record.amount,
            }))
            .sort((a: LostLeaderboardEntry, b: LostLeaderboardEntry) => b.amount - a.amount);

        const leaderboardText: string = leaderboardData
            .slice(0, 10)
            .map((data: LostLeaderboardEntry, index: number) => {
                const medal: string = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
                return `${medal} <@${data.user_id}>\n` +
                    `  **Lost: ${data.amount} coins**`;
            })
            .join('\n\n');

        const leaderboardEmbed: EmbedBuilder = new EmbedBuilder()
            .setColor(colors.red)
            .setTitle('Biggest Losers Leaderboard')
            .setDescription(leaderboardText || 'No data available')
            .setFooter({ text: `Total losers: ${lostRecords.length}` })
            .setTimestamp();

        await interaction.reply({ embeds: [leaderboardEmbed] });
    },
} satisfies Command;
