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
	cacheLogChns: cacheLogChns,
	cacheEnabled: cacheEnabled,
	cachePlayChns: cachePlayChns,
};

// ----------------------------------------------------------------
//                     Cache - Logging Channels
// ----------------------------------------------------------------
/**
 *
 * @param {Zen} bot
 * @returns {Object} cache
 */
async function cacheLogChns(bot) {
	bot.logger.info('Building Logger Cache');
	try {
		const cache = {};
		const sql = 'SELECT * FROM settings';
		const res = (await bot.db.fetch(sql)) || [];
		// Add to object
		res.forEach(entry => {
			if (entry.logging_chn) cache[entry.server_id] = entry.logging_chn;
		});
		return cache;
	} catch (e) {
		bot.logger.error('An error occured while building logging cache: ', e);
	}
}

// ----------------------------------------------------------------
//                     Cache - Play Categories
// ----------------------------------------------------------------
/**
 *
 * @param {Zen} bot
 * @returns {Object} cache
 */
async function cachePlayChns(bot) {
	bot.logger.info('Building PlayChannels Cache');
	try {
		const cache = {};
		const sql = 'SELECT * FROM settings';
		const res = (await bot.db.fetch(sql)) || [];
		// Add to object
		res.forEach(entry => {
			if (entry.playcat) cache[entry.server_id] = entry.playcat;
		});
		return cache;
	} catch (e) {
		bot.logger.error('An error occured while building logging cache: ', e);
	}
}

// ----------------------------------------------------------------
//                     Cache - Enabled Features
// ----------------------------------------------------------------
/**
 *
 * @param {Zen} bot
 * @returns {{
 *  server_id: {
 *    levels: Boolean,
 *    rep: Boolean,
 * }}} cache
 */
async function cacheEnabled(bot) {
	bot.logger.info('Building Features Cache');
	try {
		const cache = {};
		const sql = 'SELECT * FROM settings';
		const res = (await bot.db.fetch(sql)) || [];
		// Add to cache
		res.forEach(server => {
			const enabled = {
				levels: server.levels,
				playchns: server.playchns,
				rep: server.rep,
			};

			cache[server.server_id] = enabled;
		});
		return cache;
	} catch (e) {
		bot.logger.error('An error occured while building features cache');
	}
}

// ----------------------------------------------------------------
//                             XP Calc
// ----------------------------------------------------------------

// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
