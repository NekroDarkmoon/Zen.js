// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { MessageReaction, Permissions, User } from 'discord.js';
import Zen from '../Zen.js';

// ----------------------------------------------------------------
//                            Ready Event
// ----------------------------------------------------------------
export default class MessageReactionAddEvent {
	constructor(bot) {
		this.name = 'messageReactionAdd';
		/** @type {boolean} */
		this.once = false;
		/** @type {Zen} */
		this.bot = bot;
	}

	/**
	 *
	 * @param {MessageReaction} reaction
	 * @param {User} user
	 */
	execute = async (reaction, user) => {
		// Validation - Ready
		if (!this.bot.isReady()) return;

		try {
			await this.handleRep(reaction, user);
		} catch (e) {
			this.bot.logger.error(e);
			return;
		}
	};

	/**
	 *
	 * @param {MessageReaction} reaction
	 * @param {User} user
	 */
	async handleRep(reaction, user) {
		if (reaction.partial) reaction = await reaction.fetch();
		if (user.partial) user = await user.fetch();

		// Data Builder
		const message = reaction.message;
		const member = await this.bot._getOrFetchMembers(
			message.member.id,
			message.guildId
		);

		if (member.partial) member = await member.fetch();
		const guild = message.guild;

		// Validation - Bot
		if (member.user.bot) return;
		// Validation - Self Check
		const gUser = await this.bot._getOrFetchMembers(user.id, guild.id);
		if (
			!gUser.permissions.has(Permissions.FLAGS.ADMINISTRATOR) &&
			user.id === member.id
		)
			return;
		// Validation - Reaction Check
		if (!(reaction.emoji.name.toLowerCase() === 'upvote')) return;

		// Give rep to member
		try {
			const sql = `INSERT INTO rep (server_id, user_id, rep)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (server_id, user_id) 
                    DO UPDATE SET rep = rep.rep + $3;`;
			const values = [guild.id, member.id, 1];
			await this.bot.db.execute(sql, values);

			// Add checkmark reaction
			message.react('✅');
		} catch (e) {
			this.bot.logger.error(e);
			return;
		}
	}
}
