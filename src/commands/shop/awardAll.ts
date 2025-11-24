import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { award, getAllWallets } from '../../database/wallet.js';
import type { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { colors } from '../../config/colors.js';
import type { Command } from '../../types/index.js';
import { isIgnant } from '../../utils/auth.js';

interface walletEntry {
    user_id: string;
    balance: number;
}

export default {
    data: new SlashCommandBuilder()
        .setName('award-all')
        .setDescription('Award all accounts with the same amount of points')
        .addNumberOption((option: any) =>
            option.setName('amount')
                .setDescription('The amount of points to award')
                .setRequired(true),
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const amount: number | null = interaction.options.getNumber('amount');
        const failedUserIds: string[] = [];

        if (!isIgnant(interaction.user.id)) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(colors.red)
                .setDescription('You are not Ignant, I don\'t need to listen to you');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        if (!amount || amount <= 0) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setTitle('Invalid Amount')
                .setDescription('Please provide a valid amount.')
                .setColor(colors.red);
            await interaction.reply({ embeds: [errorEmbed] });
            return;
        }

        const wallets: walletEntry[] = getAllWallets();
        for (const wallet of wallets) {
            if (!award(wallet.user_id, amount)) {
                failedUserIds.push(wallet.user_id);
            }
        }

        if (failedUserIds.length > 0) {
            const displayNames: string[] = await Promise.all(
                failedUserIds.map(async (userId: string) => {
                    try {
                        const member: GuildMember = await interaction.guild!.members.fetch(userId);
                        return member.displayName;
                    }
                    catch (error) {
                        console.error(`Failed to fetch user ${userId}:`, error);
                        return 'Unknown User';
                    }
                }),
            );
            const excluded: string = displayNames.length > 0 ? `\n\n*Excluded: ${displayNames.join(', ')}*` : '';
            const successEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(colors.green)
                .setTitle('Award All')
                .setDescription(`Awarded **${amount}** Ignant Coin(s) to all accounts.\nExcept${excluded}`)
                .setTimestamp();
            await interaction.reply({ embeds: [successEmbed] });
        }
        else {
            const successEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(colors.green)
                .setTitle('Award All')
                .setDescription(`Awarded **${amount}** Ignant Coin(s) to all accounts.`)
                .setTimestamp();
            await interaction.reply({ embeds: [successEmbed] });
        }
    },
} satisfies Command;
