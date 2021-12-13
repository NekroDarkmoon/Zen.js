// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import Zen from '../Zen.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

// ----------------------------------------------------------------
//                             Command
// ----------------------------------------------------------------
export default class Tags {
	constructor() {
		this.name = 'tag';
		this.description = 'Commands Related to the Tag system';
		this.global = false;
		this.data = new SlashCommandBuilder()
			.setName(this.name)
			.setDescription(this.description)
			.addSubcommand(sub => sub.setName('get').setDescription('  '))
			.addSubcommand(sub => sub.setName('add').setDescription('  '))
			.addSubcommand(sub => sub.setName('remove').setDescription('  '))
			.addSubcommand(sub => sub.setName('list').setDescription('  '))
			.addSubcommand(sub => sub.setName('info').setDescription('  '));
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
