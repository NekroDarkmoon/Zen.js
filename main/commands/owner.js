// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import Zen from '../Zen.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

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
					.setName('addslash')
					.setDescription('Adds all or a specified slash command')
					.addStringOption(str =>
						str.setName('target').setDescription('Slash Command to add')
					)
			)
			.addSubcommand(sub =>
				sub
					.setName('removeslash')
					.setDescription('Removes all or a specified slash command')
					.addStringOption(str =>
						str.setName('target').setDescription('Slash Command to remove')
					)
			)
			.addSubcommand(sub =>
				sub
					.setName('updateslashperms')
					.setDescription('Update slash commands permissions.')
			);
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
		switch (sub) {
			case 'addslash':
				await this.addSlash(interaction);
				break;
			case 'removeslash':
				await this.removeSlash(interaction);
				break;
			case 'updateslashperms':
				await this.updateSlashPerms(interaction);
				break;
		}

		return;
	};

	/**
	 *
	 * @param {CommandInteraction} interaction
	 * @returns
	 */
	async addSlash(interaction) {
		// Data Builder
		const cmdName = interaction.options.getString('target');

		try {
			if (!cmdName) {
				await this.bot.CommandHandler.registerCommands();
			} else {
			}
		} catch (e) {
			this.bot.logger.error(e);
		}

		// Send reply
		const val = cmdName ? cmdName : 'all';
		const msg = `Registered ${val} commands.`;
		this.bot.logger.info(msg);
		await interaction.editReply(msg);
		return;
	}

	/**
	 *
	 * @param {CommandInteraction} interaction
	 */
	async removeSlash(interaction) {
		// Data Builder
		const cmdName = interaction.options.getString('target');

		try {
			if (!cmdName) {
				await this.bot.CommandHandler.deleteCommands();
			} else {
			}
		} catch (e) {
			this.bot.logger.error(e);
		}

		// Send reply
		const val = cmdName ? cmdName : 'all';
		const msg = `Unregistered ${val} commands.`;
		this.bot.logger.warn(msg);
		await interaction.editReply(msg);
		return;
	}

	/**
	 * @param {CommandInteraction} interaction
	 */
	async updateSlashPerms(interaction) {
		try {
			await this.bot.CommandHandler.setSlashPerms();
		} catch (e) {
			this.bot.logger.error(e);
		}
	}
}
