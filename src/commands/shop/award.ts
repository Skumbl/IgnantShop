import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { award } from '../../database/wallet';
import type { Command } from '../../types/index.js';

export default {
    data: new SlashCommandBuilder()
        .setName('award')
        .setDescription('Award a user with coins')
        .addUserOption((option: any) =>
            option
                .setName('user')
                .setDescription('new account hodler')
                .setRequired(true))

        .addNumberOption(option =>
            option.setName('amount')
                .setDescription('The amount of points to award')
                .setRequired(true)
        ),
    async execute(interaction: CommandInteraction): Promise<void> {
        const user: string = interaction.options.getString('user', true);
        const amount: number = interaction.options.getNumber('amount', true);

        const result: boolean = award(user, amount);

        if (result) {
            await interaction.reply(`Awarded ${amount} points to ${user}`);
        }
        else {
            await interaction.reply(`Failed to award ${amount} points to ${user}`);
        }
    }
} satisfies Command;
