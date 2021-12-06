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

	return await getCursors();
}

// ----------------------------------------------------------------
//                             New Data
// ----------------------------------------------------------------

// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
