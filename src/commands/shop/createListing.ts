import { SlashCommandBuilder, EmbedBuilder } from '@discordjs/builders';
import type { ChatInputCommandInteraction } from 'discord.js';
import { isIgnant } from '../../utils/auth.js';
import { createItem } from '../../database/shop.js';
import type { Command } from '../../types/index.js';
import { colors } from '../../config/colors.js';

export default {
    data: new SlashCommandBuilder()
        .setName('create-listing')
        .setDescription('Create ignant store list')
        .addStringOption((option: any) => option
            .setName('name')
            .setDescription('The name of the item')
            .setRequired(true),
        )
        .addNumberOption((option: any) => option
            .setName('price')
            .setDescription('The price of the item')
            .setRequired(true),
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        if (!isIgnant(interaction.user.id)) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(colors.red)
                .setDescription('You\'re not Ignant, I don\'t have to listen to you');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        const name: string = interaction.options.getString('name', true);
        const price: number = interaction.options.getNumber('price', true);
        const result: boolean = createItem(name, price);

        if (!result) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(colors.red)
                .setDescription('Failed to create listing!');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        const successEmbed: EmbedBuilder = new EmbedBuilder()
            .setColor(colors.green)
            .setTitle('Listing Created')
            .setDescription(`**${name}** has been added to the shop`)
            .addFields(
                { name: 'Price', value: `${price} coins`, inline: true },
            )
            .setTimestamp();
        await interaction.reply({ embeds: [successEmbed] });
    },
} satisfies Command;
