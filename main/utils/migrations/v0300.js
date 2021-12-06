// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import Cursor from 'pg-cursor';
import winston from 'winston';
import ZenDB from '../db/index.js';

// ----------------------------------------------------------------
const VERSION = '0300';
/** @type {winston.Logger} */
let LOGGER = null;

// ----------------------------------------------------------------
//                               Main
// ----------------------------------------------------------------
/**
 *
 * @param {String} ver
 * @param {Array<ZenDB>} db
 * @param {winston.Logger} logger
 * @returns
 */
export default async function migrate(ver, db, logger) {
	if (VERSION !== ver) return false;
	LOGGER = logger;

	// Databuilder
	const oldDB = db[0];
	const newDB = db[1];

	// Manual migration
	const oldCursors = await getOldData(oldDB);

	await addToNewDB(newDB, oldCursors);

	return true;
}

// ----------------------------------------------------------------
//                             Old Data
// ----------------------------------------------------------------
/**
 *
 * @param {ZenDB} oldDB
 * @returns {Array<Cursor>}
 */
async function getOldData(oldDB) {
	// Data builder
	const tables = ['lb', 'rep'];

	const getCursor = async t => {
		try {
			const sql = `SELECT * FROM ${t}`;
			const res = await oldDB.getCursor(sql);
			return res;
		} catch (e) {
			LOGGER.error(e);
		}
	};

	const getCursors = async () => {
		return Promise.all(tables.map(t => getCursor(t)));
	};

	const cursors = await getCursors();
	return cursors;
}

// ----------------------------------------------------------------
//                             New Data
// ----------------------------------------------------------------
/**
 *
 * @param {ZenDB} newDb
 * @param {Array<Cursor>} cursors
 */
async function addToNewDB(newDb, cursors) {
	// Create Schmea
	await newDb.init();

	// Export data from first cursor
	try {
		let rows = await cursors[0].readAsync(50);
		let count = 0;
		while (rows.length) {
			console.log(`Adding ${count} from cursor 1`);
			count += rows.length;
			const sqls = [];
			const vals = [];
			rows.forEach(async r => {
				const sql = `INSERT INTO xp (server_id, user_id, xp, level, last_xp)
								 VALUES ($1, $2, $3, $4, $5)`;
				const values = [
					r.server_id,
					r.user_id,
					r.total_exp,
					r.level,
					r.last_exp,
				];

				const sql2 = `INSERT INTO logger (server_id, user_id, channel_id, last_msg, msg_count)
											VALUES ($1, $2, $3, $4, $5);`;
				const values2 = [r.server_id, r.user_id, -1, r.last_exp, r.msg_amt];

				sqls.push(sql);
				vals.push(values);
				sqls.push(sql2);
				vals.push(values2);
			});

			await newDb.executeMany(sqls, vals);
			rows = await cursors[0].readAsync(50);
		}
	} catch (e) {
		LOGGER.error(e);
	}

	// Export data from second cursor
	try {
		let rows = await cursors[1].readAsync(50);
		let count = 0;
		while (rows.length) {
			console.log(`Adding ${count} from cursor 2`);
			count += rows.length;
			const sqls = [];
			const vals = [];
			rows.forEach(async r => {
				const sql = `INSERT INTO rep (server_id, user_id, rep)
								 VALUES ($1, $2, $3)`;
				const values = [r.server_id, r.user_id, r.rep];

				sqls.push(sql);
				vals.push(values);
			});

			await newDb.executeMany(sqls, vals);
			rows = await cursors[1].readAsync(50);
		}
	} catch (e) {
		LOGGER.error(e);
	}
}

// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
