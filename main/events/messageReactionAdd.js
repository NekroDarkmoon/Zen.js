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
		const member = reaction.message.member
			? reaction.message.member
			: await reaction.message.guild.members.fetch(reaction.message.author.id);
		if (member.partial) member = await member.fetch();
		const guild = reaction.message.guild;
		const rep = 1;

		// Validation - Bot
		if (member.user.bot) return;
		// Validation - Self Check
		if (
			!member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) &&
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
			const values = [guild.id, member.id, rep];
			await this.bot.db.execute(sql, values);
		} catch (e) {
			this.bot.logger.error(e);
			return;
		}
	}
}
