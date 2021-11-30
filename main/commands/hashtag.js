// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import Zen from '../Zen.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Message, ThreadChannel } from 'discord.js';
import { ChannelType } from 'discord-api-types/v9';

// ----------------------------------------------------------------
//                             Command
// ----------------------------------------------------------------
export default class HashTag {
	constructor() {
		this.name = 'hashtag';
		this.description = 'Commands Related to hashtags';
		this.global = false;
		this.data = new SlashCommandBuilder()
			.setName(this.name)
			.setDescription(this.description)
			.setDefaultPermission(false)
			.addSubcommand(sub =>
				sub
					.setName('requirehashtag')
					.setDescription(
						'Require content posted in a channel to have hashtags.'
					)
					.addChannelOption(chn => {
						chn
							.setName('target')
							.setDescription('Selected Channel')
							.setRequired(true);
						chn.channelTypes = [
							ChannelType.GuildText,
							ChannelType.GuildPublicThread,
							ChannelType.GuildPrivateThread,
						];
						return chn;
					})
					.addBooleanOption(bool =>
						bool
							.setName('set')
							.setDescription('Enable / Disable')
							.setRequired(true)
					)
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
			case 'requirehashtag':
				await this.restrict(interaction);
				return;
		}

		return;
	};

	/**
	 *
	 * @param {CommandInteraction} interaction
	 */
	async restrict(interaction) {
		// Data Builder
		const channel = interaction.options.getChannel('target');
		const enable = interaction.options.getBoolean('set');

		// Add to db
		try {
			let sql = `SELECT * FROM settings WHERE server_id=$1`;
			let vals = [interaction.guild.id];
			const res = await this.bot.db.fetchOne(sql, vals);

			if (!res) {
				await interaction.editReply('Error: Setup server first using `setup`');
				return;
			}

			const hashtags = [...res.hashtags];
			if (enable) hashtags.push(channel.id);
			else if (hashtags.includes(channel.id))
				hashtags.splice(hashtags.findIndex(channel.id), 1);

			// Update db
			sql = `UPDATE settings SET hashtags=$1 WHERE server_id=$2;`;
			vals = [hashtags, interaction.guild.id];
			await this.bot.db.execute(sql, vals);

			// Reply to Interaction
			const state = enable ? 'now' : 'no longer';
			const msg = `Channel ${state} requires \` [ tag ] \`. `;
			await interaction.editReply(msg);
		} catch (e) {
			this.bot.logger.error(e);
		}
	}
}

/**
 * @param {Message} message
 */
export async function handleHashTag(message) {
	// Data builder
	const guild = oldThread.guild;
	const channel = oldThread.parent;
	const archived = oldThread.archived === false && newThread.archived === true;

	// Return if not archived
	if (!archived) return false;

	try {
		const sql = `SELECT * FROM threads WHERE server_id=$1`;
		const vals = [guild.id];
		const res = await bot.db.fetchOne(sql, vals);
		if (!res) return false;

		// Check if channel matches first
		if (res.channels.includes(channel.id)) {
			await newThread.setArchived(false);
			return true;
		}

		// Check if thread is in threads
		if (res.threads.includes(oldThread.id)) {
			await newThread.setArchived(false);
			return true;
		}

		return false;
	} catch (e) {
		bot.logger.error(e);
	}
}
