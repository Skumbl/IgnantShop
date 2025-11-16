import { SlashCommandBuilder, EmbedBuilder } from '@discordjs/builders';
import type { ChatInputCommandInteraction, User } from 'discord.js';
import type { Command } from '../../types/index.js';
import { deduct, getBalance } from '../../database/wallet.js';

export default {
    data: new SlashCommandBuilder()
        .setName('deduct')
        .setDescription('deducts a certain amount from the user')
        .addUserOption((option: any) =>
            option
                .setName('user')
                .setDescription('The user to deduct the amount from')
                .setRequired(true),
        )
        .addNumberOption((option: any) =>
            option.setName('amount')
                .setDescription('The amount to deduct')
                .setRequired(true),
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const user: User | null = interaction.options.getUser('user', true);
        const amount: number = interaction.options.getNumber('amount', true);

        if (!user) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(0xFF1A00)
                .setDescription('Invalid User');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        const result: boolean = deduct(user.id, amount);

        if (result) {
            const successEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(0x66B266)
                .setTitle('Coins Deducted')
                .setDescription(
                    `Deducted **${amount}** coin(s) from ${user}\n
                    Current Balance: ${getBalance(user.id)} coin(s)`)
                .setTimestamp();
            await interaction.reply({ embeds: [successEmbed] });
        }
        else {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(0xFF1A00)
                .setDescription(`Failed to deduct ${amount} coins from ${user}. Insufficient balance or account doesn't exist.`);
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
} satisfies Command;
