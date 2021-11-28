// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import Zen from '../Zen.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Interaction } from 'discord.js';

// ----------------------------------------------------------------
//                             Command
// ----------------------------------------------------------------
export default class Threads {
	constructor() {
		this.name = 'thread';
		this.description = 'Commands Related to threads';
		this.global = false;
		this.data = new SlashCommandBuilder()
			.setName(this.name)
			.setDescription(this.description);
		// .addSubcommand( sub =>
		//   sub
		//     .setName('get')
		//     .setDescription('')
		// )
		// )
	}

	/**
	 * @param {Interaction} interaction
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

		return;
	};
}
