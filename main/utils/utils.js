// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
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
//                     Cache - Logging Channels
// ----------------------------------------------------------------
/**
 * 
 * @param {Zen} bot 
 * @returns {Object} cache
 */
export async function cacheLogChns( bot ) {
  try {
    const cache = {};
    const sql = 'SELECT * FROM settings';
    const res = await bot.db.fetch(sql);
    
    // Add to object
    res.forEach( entry => {
      if (entry.logging_chn) cache[entry.server_id] = entry.logging_chn;
    });

    return cache;

  } catch ( e ) {
    console.error("An error occured in building logging cache: ", e);
  }
}
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
//                             Imports
// ----------------------------------------------------------------

