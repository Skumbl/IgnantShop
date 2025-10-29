import { SlashCommandBuilder } from '@discordjs/builders';
import type { ChatInputCommandInteraction, User } from 'discord.js';
import { createItem } from '../../shop/shop.js';
import type { Command } from '../../types/index.js';

export default {
    data: new SlashCommandBuilder()
        .setName('create-listing')
        .setDescription('create ignant store list')

        .addStringOption((option: any) => option
            .setName('name')
            .setDescription('The name of the item')
            .setRequired(true)
        )

        .addStringOption((option: any) => option
            .setName('description')
            .setDescription('The description of the item')
            .setRequired(true)
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const name: string = interaction.options.getString('name', true);
        const description: string = interaction.options.getString('description', true);
        const result: boolean = createItem(name, description, interaction.user.id);

        if (!result) {
            await interaction.reply('Failed to create listing!');
            return;
        }

        await interaction.reply(`Created listing for ${name}!`);
    }

} p
