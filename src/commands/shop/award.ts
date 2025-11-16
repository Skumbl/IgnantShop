import { SlashCommandBuilder, EmbedBuilder } from '@discordjs/builders';
import type { ChatInputCommandInteraction, User } from 'discord.js';
import { isIgnant } from '../../utils/auth.js';
import { award } from '../../database/wallet.js';
import type { Command } from '../../types/index.js';

export default {
    data: new SlashCommandBuilder()
        .setName('award')
        .setDescription('Award a user with coins')
        .addUserOption((option: any) =>
            option
                .setName('user')
                .setDescription('User to award coins to')
                .setRequired(true),
        )
        .addNumberOption((option: any) =>
            option
                .setName('amount')
                .setDescription('The amount of coins to award')
                .setRequired(true),
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const user: User | null = interaction.options.getUser('user', true);
        const amount: number = interaction.options.getNumber('amount', true);

        if (!isIgnant(interaction.user.id)) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(0xFF1A00)
                .setDescription('You are not Ignant, I don\'t need to listen to you');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        if (!user) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(0xFF1A00)
                .setDescription('Invalid Target User');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        const result: boolean = award(user.id, amount);

        if (result) {
            const successEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(0xFF9900)
                .setTitle('Coins Awarded')
                .setDescription(`Awarded **${amount}** Ignant Coin(s) to ${user}`)
                .setTimestamp();
            await interaction.reply({ embeds: [successEmbed] });
        }
        else {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(0xFF1A00)
                .setDescription('Failed to award ignant coin(s)');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }
    },
} satisfies Command;
