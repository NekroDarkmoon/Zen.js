// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { SlashCommandBuilder } from '@discordjs/builders';
import { Interaction, Permissions } from 'discord.js';

// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
export default class Game {
	constructor() {
		this.name = 'game';
		this.description = 'Not Implemented';
		this.global = true;
		this.data = new SlashCommandBuilder()
			.setName(this.name)
			.setDescription(this.description);
	}

	/**
	 * @param {CommandInteraction} interaction
	 * @returns {Promise<void>}
	 * */
	execute = async interaction => {
		// Get Bot & interface
		/** @type {Zen} */
		const bot = interaction.client;
		if (!this.bot) this.bot = bot;
		// Defer Reply
		await interaction.deferReply();

		// Execute based on subcommand
		const sub = interaction.options.getSubcommand();
		await interaction.editReply('Not Implemented.');

		return;
	};
}
