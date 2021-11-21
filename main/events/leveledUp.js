// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { Message } from 'discord.js';
import Zen from '../Zen.js';

// ----------------------------------------------------------------
//                            Ready Event
// ----------------------------------------------------------------
export default class LeveledUpEvent {
	constructor(bot) {
		this.name = 'leveledUp';
		/** @type {boolean} */
		this.once = false;
		/** @type {Zen} */
		this.bot = bot;
	}

	/**
	 * @param {Object} lEvent
	 * @param {Message} lEvent.message
	 * @param {Number} lEvent.level
	 * @returns {Promise<void>}
	 */
	execute = async ({ message, level }) => {
		// Data Builder
		const author = message.member;
		const aRoles = author.roles.cache.map(r => r.id);
		let roles = [];

		const lvlMsg = `\`${author.displayName} reached level ${level}\``;
		await message.channel.send(lvlMsg).then(msg => {
			setTimeout(() => msg.delete(), 15000);
		});

		// Grab all available roles for level x and below
		try {
			const sql = `SELECT * FROM rewards WHERE 
                    server_id=$1 AND type=$2 AND val<=$3;`;
			const vals = [message.guild.id, 'xp', level];
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
		const roleObjs = roles.map(role => message.guild.roles.cache.get(role));
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
		await message.channel.send(msg).then(msg => {
			setTimeout(() => msg.delete(), 15000);
		});
	};
}
