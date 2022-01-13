// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { formatDt } from './formats.js';

// ----------------------------------------------------------------
//                             Imports
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

// ----------------------------------------------------------------
//                        DateTime Display Formats
// ----------------------------------------------------------------
/**
 * @param {Date} dt
 * @returns {String}
 */
export function formatShortTime(dt) {
	return formatDt(dt, 't');
}

/**
 * @param {Date} dt
 * @returns {String}
 */
export function formatLongTime(dt) {
	return formatDt(dt, 'T');
}

/**
 * @param {Date} dt
 * @returns {String}
 */
export function formatShortDate(dt) {
	return formatDt(dt, 'd');
}

/**
 * @param {Date} dt
 * @returns {String}
 */
export function formatLongDate(dt) {
	return formatDt(dt, 'D');
}

/**
 * @param {Date} dt
 * @returns {String}
 */
export function formatLongDateTime(dt) {
	return formatDt(dt, 'F');
}

/**
 * @param {Date} dt
 * @returns {String}
 */
export function formatRelative(dt) {
	return formatDt(dt, 'R');
}
