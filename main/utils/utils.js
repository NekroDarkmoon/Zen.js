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
	cacheLogChns: cacheLogChns,
	cacheEnabled: cacheEnabled,
	cachePlayChns: cachePlayChns,
	cacheHashtags: cacheHashtags,
};

// ----------------------------------------------------------------
//                     Cache - Logging Channels
// ----------------------------------------------------------------
/**
 *
 * @param {Zen} bot
 * @returns {Object} cache
 * @deprecated
 */
async function cacheLogChns(bot) {
	bot.logger.info('Building Logger Cache');
	try {
		const cache = {};
		const sql = 'SELECT * FROM settings';
		const res = (await bot.db.fetch(sql)) || [];
		// Add to object
		res.forEach(entry => {
			cache[entry.server_id] = entry.logging_chn;
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
 * @deprecated
 */
async function cachePlayChns(bot) {
	bot.logger.info('Building PlayChannels Cache');
	try {
		const cache = {};
		const sql = 'SELECT * FROM settings';
		const res = (await bot.db.fetch(sql)) || [];
		// Add to object
		res.forEach(entry => {
			cache[entry.server_id] = entry.playcat;
		});
		return cache;
	} catch (e) {
		bot.logger.error('An error occured while building logging cache: ', e);
		return {};
	}
}

// ----------------------------------------------------------------
//                     			Cache - HashTags
// ----------------------------------------------------------------
/**
 * @param {Zen} bot
 * @deprecated
 */
async function cacheHashtags(bot) {
	bot.logger.info('Building Hashtag Cache');
	try {
		const cache = {};
		const sql = 'SELECT * FROM settings';
		const res = (await bot.db.fetch(sql)) || [];
		// Add to object
		res.forEach(entry => {
			cache[entry.server_id] = entry.hashtags;
		});
		return cache;
	} catch (e) {
		bot.logger.error(e);
		return {};
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
 * @deprecated
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
//                          Cache - Exceptions
// ----------------------------------------------------------------
/**
 *
 * @param {*} bot
 * @deprecated
 */
async function cacheExceptions(bot) {
	bot.logger.info('Building Exceptions Cache');
	try {
		const cache = {};
		const sql = `SELECT * FROM settings`;
		const res = (await bot.db.fetch(sql)) || [];
		// Add to Cache
		res.forEach(server => {
			cache[server.id] = server.exceptions;
		});
	} catch (e) {
		bot.logger.error(`An error occured while building exceptions cache ${e}`);
	}
}

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
				exceptions: s.exceptions || [],
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

	console.log(cache);
	return cache;
}

// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
