// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { Guild, Interaction, Message } from 'discord.js';
import Zen from '../Zen.js';

// ----------------------------------------------------------------
//                            Ready Event
// ----------------------------------------------------------------
export default class RepGivenEvent {
	constructor(bot) {
		this.name = 'repGiven';
		/** @type {boolean} */
		this.once = false;
		/** @type {Zen} */
		this.bot = bot;
	}

	/**
	 * @param {Object} rEvent
	 * @param {Interaction | Message} rEvent.init
	 * @param {Number} rEvent.userId
	 * @param {Guild} rEvent.guild
	 * @returns {Promise<void>}
	 */
	execute = async ({ init, userId, guild }) => {
		// Data Builder
		const author = await guild.members.fetch(userId);
		const aRoles = author.roles.cache.map(r => r.id);
		let roles = [];
		let rep = null;

		// Get rep count
		try {
			const sql = 'SELECT * FROM rep WHERE server_id=$1 AND user_id=$2;';
			const values = [guild.id, userId];

			const result = await this.bot.db.fetchOne(sql, values);
			rep = result ? result.rep : 0;
		} catch (e) {
			this.bot.logger.error(e);
		}

		if (!rep) return;

		// Grab all available roles for level x and below
		try {
			const sql = `SELECT * FROM rewards WHERE 
                    server_id=$1 AND type=$2 AND val<=$3;`;
			const vals = [guild.id, 'rep', rep];
			const res = await this.bot.db.fetch(sql, vals);

			if (!res) return;

			res.forEach(entry => {
				if (aRoles.includes(entry.role_id)) return;
				roles.push(entry.role_id);
			});
		} catch (e) {
			this.bot.logger.error(e);
			return;
		}

		// Return if no roles left to apply
		if (roles.length < 1) return;

		// Apply roles if the user doesn't have them
		const roleObjs = roles.map(role => guild.roles.cache.get(role));
		try {
			await author.roles.add(roleObjs);
		} catch (e) {
			this.bot.logger.error(e);
			return;
		}

		// Send a Message about the level up and gained roles.
		const msg = `\`${
			author.displayName
		} gained the following title(s):  ${roleObjs
			.map(r => r.name)
			.join(', ')} \``;
		await init.channel.send(msg).then(msg => {
			setTimeout(() => msg.delete(), 15000);
		});
	};
}
