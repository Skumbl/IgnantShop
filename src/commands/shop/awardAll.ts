import { SlashCommandBuilder } from 'discord.js';
import { award, getAllWallets } from '../../database/wallet.js';
import type { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import type { Command } from '../../types/index.js';

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
                .setRequired(true)
        )
        .addStringOption((option: any) =>
            option.setName('reason')
                .setDescription('The reason for the award')
                .setRequired(false)
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const amount: number | null = interaction.options.getNumber('amount');
        const reason: string | null = interaction.options.getString('reason');
        const failedUserIds: string[] = [];

        if (!amount || amount <= 0) {
            await interaction.reply('Please provide a valid amount.');
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
                    } catch (error) {
                        console.error(`Failed to fetch user ${userId}:`, error);
                        return 'Unknown User';
                    }
                })
            );
            await interaction.reply(`Awarded ${amount} points to all accounts except ${displayNames.join(', ')}.`);
        } else {
            await interaction.reply(`Awarded ${amount} points to all accounts.`);
        }
    }
} satisfies Command;
