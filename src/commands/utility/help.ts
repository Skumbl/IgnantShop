import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { EmbedBuilder } from '@discordjs/builders';
import { colors } from '../../config/colors.js';

const documentation: string = `**IgnantShop Discord Bot**
A virtual economy system with shops, inventory, and gambling.

**Economy Commands**
\`/balance\` - Check your coin balance
\`/leaderboard\` - View top users by total worth

**Shop Commands**
\`/shop\` - View all available items
\`/buy\` - Purchase an item from the shop
\`/create-listing\` - Create a new shop item (Ignant only)
\`/destroy-listing\` - Remove a shop item (Ignant only)

**Gambling Commands**
\`/gamba\` - Play the slot machine
\`/blackjack\` - Play blackjack

**Admin Commands**
\`/create-account\` - Create a new user account
\`/award\` - Give coins to a user (Ignant only)
\`/deduct\` - Remove coins from a user (Ignant only)`;

export default {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('List of commands'),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const embed: EmbedBuilder = new EmbedBuilder()
            .setTitle('IgnantShop Commands')
            .setDescription(documentation)
            .setColor(colors.purple);
        await interaction.reply({ embeds: [embed] });
    },
};
