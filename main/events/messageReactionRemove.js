// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { MessageReaction, User, Permissions } from 'discord.js';
import Zen from '../Zen.js';

// ----------------------------------------------------------------
//                            Ready Event
// ----------------------------------------------------------------
export default class MessageReactionRemoveEvent {
	constructor(bot) {
		this.name = 'messageReactionRemove';
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
		const member = this.bot._getOrFetchMembers(
			message.member.id,
			message.guildId
		);

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
                     DO UPDATE SET rep = rep.rep - $3`;
			const values = [guild.id, member.id, 1];
			await this.bot.db.execute(sql, values);

			// Fetch and remove reactions
			const reacts = message.reactions.cache;
			reacts.forEach(r => {
				if (r.emoji.name.toLowerCase() === '✅') r.remove();
			});
		} catch (e) {
			this.bot.logger.error(e);
			return;
		}
	}
}
