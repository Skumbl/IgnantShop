import { Events, MessageFlags, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import type { Interaction, ButtonInteraction, User } from 'discord.js';
import type { ExtendedClient } from '../client.js';
import type { Event, Command } from '../types/index.js';
import {
    getGame,
    deleteGame,
    playerHit,
    dealerPlay,
    gameOutcome,
    formatHand,
    calculateHand,
    type BlackjackGame,
} from '../utils/blackjackLogic.js';
import { award, getBalance } from '../database/wallet.js';
import { addLostRecord } from '../database/lost.js';
import { colors } from '../config/colors.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction: Interaction): Promise<void> {
        // Handle slash commands
        if (interaction.isChatInputCommand()) {
            const command: Command | undefined =
                (interaction.client as ExtendedClient).commands.get(interaction.commandName);
            if (!command) {
                console.error(`no command matching ${interaction.commandName}`);
                return;
            }
            try {
                await command.execute(interaction);
            }
            catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        content: 'There was an error while executing this command!',
                        flags: MessageFlags.Ephemeral,
                    });
                }
                else {
                    await interaction.reply({
                        content: 'There was an error while executing this command!',
                        flags: MessageFlags.Ephemeral,
                    });
                }
            }
        }

        // Handle button interactions
        if (interaction.isButton()) {
            if (interaction.customId === 'blackjack_hit') {
                await handleBlackjackHit(interaction);
            }
            else if (interaction.customId === 'blackjack_stand') {
                await handleBlackjackStand(interaction);
            }
        }
    },
} satisfies Event<Events.InteractionCreate>;

async function handleBlackjackHit(interaction: ButtonInteraction): Promise<void> {
    const user: User = interaction.user;
    const userId: string = interaction.user.id;
    const game: BlackjackGame | undefined = getGame(userId);

    if (!game) {
        const errorEmbed: EmbedBuilder = new EmbedBuilder()
            .setColor(colors.red)
            .setDescription('No active game found.');
        await interaction.update({ embeds: [errorEmbed], components: [] });
        return;
    }

    if (game.gameOver) {
        const errorEmbed: EmbedBuilder = new EmbedBuilder()
            .setColor(colors.red)
            .setDescription('This game is already over.');
        await interaction.update({ embeds: [errorEmbed], components: [] });
        return;
    }

    playerHit(game);
    const playerTotal: number = calculateHand(game.playerHand);

    if (playerTotal > 21) {
        game.gameOver = true;
        const outcome: { result: string, payout: number } = gameOutcome(game);
        addLostRecord(userId, game.bet);
        deleteGame(userId);

        const privateEmbed: EmbedBuilder = new EmbedBuilder()
            .setColor(colors.red)
            .setDescription('Game over! Results posted below.');
        await interaction.update({ embeds: [privateEmbed], components: [] });

        const newBalance: number | null = getBalance(userId);

        const bustEmbed: EmbedBuilder = new EmbedBuilder()
            .setColor(colors.red)
            .setTitle('Blackjack')
            .setDescription(`Player: ${user.displayName} \n### Dealer: \n${formatHand(game.dealerHand, false)}\n\n### Player: \n${formatHand(game.playerHand, false)}\n\n**${outcome.result}**\n💰 Payout: ${outcome.payout} \nBalance: ${newBalance}`)
            .setTimestamp();

        await interaction.followUp({ embeds: [bustEmbed], ephemeral: false });
        return;
    }

    const hitEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(colors.green)
        .setTitle('Blackjack')
        .setDescription(`### Dealer: \n${formatHand(game.dealerHand, true)}\n\n### Player: \n${formatHand(game.playerHand, false)}\n**Total: ${playerTotal}**`)
        .setTimestamp();

    const buttons: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('blackjack_hit')
                .setLabel('Hit')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('blackjack_stand')
                .setLabel('Stand')
                .setStyle(ButtonStyle.Secondary),
        );

    await interaction.update({ embeds: [hitEmbed], components: [buttons] });
}

async function handleBlackjackStand(interaction: ButtonInteraction): Promise<void> {
    const user: User = interaction.user;
    const userId: string = interaction.user.id;
    const game: BlackjackGame | undefined = getGame(userId);

    if (!game) {
        const errorEmbed: EmbedBuilder = new EmbedBuilder()
            .setColor(colors.red)
            .setDescription('No active game found.');
        await interaction.update({ embeds: [errorEmbed], components: [] });
        return;
    }

    if (game.gameOver) {
        const errorEmbed: EmbedBuilder = new EmbedBuilder()
            .setColor(colors.red)
            .setDescription('This game is already over.');
        await interaction.update({ embeds: [errorEmbed], components: [] });
        return;
    }

    game.gameOver = true;
    dealerPlay(game);
    const outcome: { result: string, payout: number } = gameOutcome(game);

    if (outcome.payout > 0) {
        award(userId, outcome.payout);
    }
    else if (outcome.payout === 0) {
        addLostRecord(userId, game.bet);
    }
    deleteGame(userId);

    const privateEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(colors.green)
        .setDescription('Game over! Results posted below.');
    await interaction.update({ embeds: [privateEmbed], components: [] });

    const newBalance: number | null = getBalance(userId);

    const resultEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(outcome.payout > game.bet ? colors.green : colors.red)
        .setTitle('Blackjack')
        .setDescription(`Player: ${user.displayName} \n### Dealer: \n${formatHand(game.dealerHand, false)}\n**Total: ${calculateHand(game.dealerHand)}**\n\n### Player: \n${formatHand(game.playerHand, false)}\n**Total: ${calculateHand(game.playerHand)}**\n\n**${outcome.result}**\n💰 Payout: ${outcome.payout} \nBalance: ${newBalance}`)
        .setTimestamp();

    await interaction.followUp({ embeds: [resultEmbed], ephemeral: false });
}
