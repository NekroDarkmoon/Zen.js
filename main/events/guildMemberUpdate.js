// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { GuildMember, MessageEmbed } from 'discord.js';
import Zen from '../Zen.js';

// ----------------------------------------------------------------
//                            Ready Event
// ----------------------------------------------------------------
export default class GuildMemberUpdateEvent {
	constructor(bot) {
		this.name = 'guildMemberUpdate';
		/** @type {boolean} */
		this.once = false;
		/** @type {Zen} */
		this.bot = bot;
	}

	/**
	 *
	 * @param {GuildMember} oldMember
	 * @param {GuildMember} newMember
	 * @returns {Promise<void>}
	 */
	execute = async (oldMember, newMember) => {
		try {
			await this.logEvent(oldMember, newMember);
		} catch (e) {
			console.error(e);
			return;
		}
	};

	/**
	 *
	 * @param {GuildMember} before
	 * @param {GuildMember} after
	 */
	async logEvent(before, after) {
		// Validation - Bot
		if (before.bot) return;
		if (before.partial) {
			before = await before.fetch();
			after = await after.fetch();
		}

		const chnId = this.bot.caches[before.guild.id]?.channels.logChn;
		if (!chnId) return;

		// DataBuilder
		const bts = '```diff\n';
		const bt = '```';
		const member = before.user.username;
		const id = before.id;
		const oNick = before.nickname ? before.nickname : member;
		const nNick = after.nickname ? after.nickname : member;
		const guild = before.guild;

		if (oNick === nNick) return;

		// Log to channel
		try {
			const logChn = await before.guild.channels.fetch(chnId);
			// Create Embed
			const e = new MessageEmbed().setTitle(member).setColor('ORANGE');
			e.addField('UserID', `${bts} ${id} ${bt}`, false);
			e.addField('Old Nickname', `${bts} ${oNick} ${bt}`, true);
			e.addField('New Nickname', `${bts} ${nNick} ${bt}`, true);
			e.setThumbnail(before.user.avatarURL());

			await logChn.send({ embeds: [e] });
		} catch (e) {
			console.error(e);
		}
	}
}
