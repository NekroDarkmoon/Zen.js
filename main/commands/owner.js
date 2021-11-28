// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import Zen from '../Zen.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Interaction } from 'discord.js';

// ----------------------------------------------------------------
//                             Command
// ----------------------------------------------------------------
export default class OwnerCommands {
	constructor() {
		this.name = 'bot';
		this.description = 'Bot Owner Commands';
		this.global = false;
		this.data = new SlashCommandBuilder()
			.setName(this.name)
			.setDescription(this.description)
			.setDefaultPermission(false)
			.addSubcommand(sub =>
				sub
					.setName('removeSlash')
					.setDescription('Removes all or a specified slash command')
					.addStringOption(str =>
						str.setName('target').setDescription('Slash Command to remove')
					)
			);
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
		switch (sub) {
			case 'removeSlash':
				await this.removeSlash(interaction);
				break;
		}

		return;
	};

	/**
	 *
	 * @param {Interaction} interaction
	 */
	async removeSlash(interaction) {}
}
