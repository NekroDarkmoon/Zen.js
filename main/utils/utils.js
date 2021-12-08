// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import Zen from '../Zen.js';

// ----------------------------------------------------------------
//                           Chunk Strings
// ----------------------------------------------------------------
/**
 *
 * @param {String} str
 * @param {Number} chunkSize
 * @returns {Array<String>} chunks
 */
export function chunkify(str, chunkSize) {
	const numChunks = Math.ceil(str.length / chunkSize);
	const chunks = new Array(numChunks);

	for (let i = 0, o = 0; i < numChunks; ++i, o += chunkSize) {
		chunks[i] = str.substr(o, chunkSize);
	}

	return chunks;
}

// ----------------------------------------------------------------
//                         Sanitize String
// ----------------------------------------------------------------
/**
 *
 * @param {String} str
 * @returns {String} str
 */
export function msgSanatize(str) {
	return str.replaceAll('@', '@\u200b');
}

// ----------------------------------------------------------------
//                         Export Cachers
// ----------------------------------------------------------------
export const caches = {
	settingsCacheBuilder,
};

// ----------------------------------------------------------------
//                       Cache - Server Objects
// ----------------------------------------------------------------
/**
 *
 * @param {Zen} bot
 * @returns {import('../structures/typedefs.js').ZenCache} ZenCache
 *
 */
export async function settingsCacheBuilder(bot) {
	bot.logger.info('Building Server Settings Cache');
	const cache = {};

	try {
		const sql = `SELECT * FROM settings`;
		const res = (await bot.db.fetch(sql)) || [];

		// Build Cache
		res.forEach(s => {
			// Add Enabled features
			const enabled = {
				levels: s.levels || false,
				playChns: s.playchns || false,
				rep: s.rep || false,
			};

			// Add Channel cache
			const channels = {
				hashtags: s.hashtags || [],
				logChn: s.logging_chn,
				playCat: s.playcat,
			};

			const roles = {
				exceptions: s.exception || [],
			};

			const settings = {};

			const data = {
				enabled,
				channels,
				roles,
				settings,
			};

			cache[s.server_id] = data;
		});
	} catch (e) {
		bot.logger.error(`An errror occured while building settings cache ${e}.`);
	}

	return cache;
}

// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
