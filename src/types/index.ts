import type { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, ChatInputCommandInteraction, ClientEvents } from 'discord.js';

export interface Command {
    data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export interface Event<K extends keyof ClientEvents = keyof ClientEvents> {
    name: K;
    once?: boolean;
    execute: (...args: ClientEvents[K]) => Promise<void> | void;
}
