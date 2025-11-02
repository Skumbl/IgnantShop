import { SlashCommandBuilder } from '@discordjs/builders';
import type { ChatInputCommandInteraction, User } from 'discord.js';
import { isIgnant } from '../../utils/auth.js';
import type { Command } from '../../types/index.js';
import { deduct } from '../../database/wallet.js';

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
                .setDescription('The amount to calculate the tax for')
                .setRequired(true),
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const user: User | null = interaction.options.getUser('user', true);
        const amount: number = interaction.options.getNumber('amount', true);

        if (!isIgnant(user.id)) {
            await interaction.reply('Invalid User');
            return;
        }

        const result: boolean = deduct(user.id, amount);

        if (result) {
            await interaction.reply(`Deducted ${amount} from ${user.username}'s wallet`);
        }
        else {
            await interaction.reply(`Failed to deduct ${amount} from ${user.username}'s wallet`);
        }
    },
} satisfies Command;
