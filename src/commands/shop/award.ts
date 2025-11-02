import { SlashCommandBuilder } from '@discordjs/builders';
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
            await interaction.reply('You are not Ignant, I don\'t need to listen to you');
            return;
        }

        if (!user) {
            await interaction.reply('Invalid Target User');
            return;
        }

        const result: boolean = award(user.id, amount);

        if (result) {
            await interaction.reply(`Awarded ${amount} Ignant Coins to ${user.displayName}`);
        }
        else {
            await interaction.reply('Failed to award ignant coins');
        }
    },
} satisfies Command;
