// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import Zen from '../Zen.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, ThreadChannel } from 'discord.js';
import { ChannelType } from 'discord-api-types/v9';

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
			.setDescription(this.description)
			.setDefaultPermission(false)
			.addSubcommand(sub =>
				sub
					.setName('keepalive')
					.setDescription('Prevent Thread from archiving.')
					.addChannelOption(chn => {
						chn
							.setName('target')
							.setDescription('Thread to keep open.')
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
							.setName('alive')
							.setDescription('Keep thread open?')
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
			case 'keepalive':
				await this.keepAlive(interaction);
				return;
		}

		return;
	};

	/**
	 *
	 * @param {CommandInteraction} interaction
	 */
	async keepAlive(interaction) {
		// Data Builder
		const thread = interaction.options.getChannel('target');
		const alive = interaction.options.getBoolean('alive');

		// Add to db
		try {
			let sql = `SELECT * FROM threads WHERE server_id=$1`;
			let vals = [interaction.guild.id];
			const res = await this.bot.db.fetchOne(sql, vals);

			// Data Builder
			let channels = [];
			let threads = [];

			if (res) {
				channels = [...res.channels];
				threads = [...res.threads];
			}

			// Add to appropriate list
			if (thread.type === 'GUILD_TEXT') {
				if (alive) channels.push(thread.id);
				else {
					const index = channels.indexOf(thread.id);
					if (index > -1) channels.splice(index, 1);
				}
			}

			if (
				thread.type === 'GUILD_PUBLIC_THREAD' ||
				thread.type === 'GUILD_PRIVATE_THREAD'
			) {
				if (alive) threads.push(thread.id);
				else {
					const index = threads.indexOf(threads.id);
					if (index > -1) {
						threads.splice(index, 1);
					}
				}
			}

			// Update db with data
			sql = `INSERT INTO threads(server_id, channels, threads)
						 VALUES ($1, $2, $3)
						 ON CONFLICT (server_id)
						 DO UPDATE SET channels=$2, threads=$3`;
			vals = [interaction.guild.id, channels, threads];
			await this.bot.db.execute(sql, vals);

			// Reply to Interaction
			const type = thread.type === 'GUILD_TEXT' ? 'Threads in' : 'Thread';
			const state = alive ? 'not' : 'now';
			const msg = `${type} ${thread.name} will ${state} auto archive.`;
			await interaction.editReply(msg);
		} catch (e) {
			this.bot.logger.error(e);
		}
	}

	/**
	 *
	 * @param {ThreadChannel} oldThread
	 * @param {ThreadChannel} newThread
	 * @returns {boolean} unarchived
	 */
}

export async function handleKeepAliveEvent(bot, oldThread, newThread) {
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
