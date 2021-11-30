// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import Zen from '../Zen.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import {
	CommandInteraction,
	Message,
	MessageEmbed,
	ThreadChannel,
} from 'discord.js';
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
	const guild = message.guild;
	const channel = message.channel;
	const content = message.content;
	const hashtags = this.bot.caches.hashtags[guild.id];

	// TODO: Check for exception

	// Check if hashtags exist
	if (hashtags?.length === 0) return false;
	// Return if not included
	if (!hashtags.includes(channel.id)) return false;

	if (content.includes('[') && content.includes(']')) {
	} else {
		setTimeout(message => {
			message.delete();
		}, 5000);

		const msg = new MessageEmbed()
			.setTitle('Error')
			.setDescription('Please add relevant tags to your post.')
			.setColor('RANDOM');
		await message.channel.send(msg).then(msg => {
			msg.delete();
		});
	}

	return true;
}
