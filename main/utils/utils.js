// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { levels } from "logform";
import Zen from "../Zen.js";


// ----------------------------------------------------------------
//                           Chunk Strings 
// ----------------------------------------------------------------
/**
 * 
 * @param {String} str 
 * @param {Number} chunkSize
 * @returns {Array<String>} chunks
 */
export function chunkify( str, chunkSize ) {
  const numChunks = Math.ceil( str.length / chunkSize );
  const chunks = new Array(numChunks);

  for ( let i = 0, o = 0; i < numChunks; ++i, o += chunkSize ) {
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
export function msgSanatize ( str ) {
  return str.replaceAll('@', '@\u200b');
} 


// ----------------------------------------------------------------
//                         Export Cachers
// ----------------------------------------------------------------
export const caches = {
  cacheLogChns: cacheLogChns,
  cacheEnabled: cacheEnabled
}


// ----------------------------------------------------------------
//                     Cache - Logging Channels
// ----------------------------------------------------------------
/**
 * 
 * @param {Zen} bot 
 * @returns {Object} cache
 */
async function cacheLogChns( bot ) {
  console.log("Building Logger Cache");
  try {
    const cache = {};
    const sql = 'SELECT * FROM settings';
    const res = await bot.db.fetch(sql) || [];
    // Add to object
    res.forEach( entry => {
      if (entry.logging_chn) cache[entry.server_id] = entry.logging_chn;
    });
    return cache;

  } catch ( e ) {
    console.error("An error occured while building logging cache: ", e);
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
async function cacheEnabled( bot ) {
  console.log("Building Features Cache");
  try {
    const cache = {}
    const sql = 'SELECT * FROM settings';
    const res = await bot.db.fetch(sql) || [];
    // Add to cache
    res.forEach( server => {
      const enabled = {
        levels: server.levels,
        rep: server.rep,
      };

      cache[server.server_id] = enabled;
    });
    return cache;

  } catch ( e ) {
    console.error("An error occured while building features cache");
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

