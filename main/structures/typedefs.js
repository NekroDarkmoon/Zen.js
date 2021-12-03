// ----------------------------------------------------------------
//                             Typedefs
// ----------------------------------------------------------------
/**
 * @namespace typedefs
 */

// ----------------------------------------------------------------
//                             ZenConfig
// ----------------------------------------------------------------
/**
 * @typedef {Object} ZenConfig
 * @property {String} token
 * @property {string} client_id
 * @property {string} client_secret
 * @property {string} uri
 * @property {string} prefix
 * @property {Array<string>} guilds
 * @property {string} activity
 * @property {boolean} deploySlash
 * @property {string} inviteLink
 * @property {string} version
 * @memberof typedefs
 */

// ----------------------------------------------------------------
//                            ZenSlashPerms
// ----------------------------------------------------------------
/**
 * @typedef {Object} ZenSlashPerms
 * @property {Array<string>} commandNames
 * @property {Object} commandPerms
 * @property {Object} commandPerms.cmdName
 * @memberof typedefs
 */

// ----------------------------------------------------------------
//                           Discord.js
// ----------------------------------------------------------------
/**
 * @typedef {import("discord.js").Client} Client
 * @typedef {import("discord.js").Interaction} Interaction
 * @typedef {import("discord.js").Message} Message
 * @typedef {import("discord.js").MessageReaction} MessageReaction
 * @typedef {import("discord.js").User} DiscordUser
 */

// ----------------------------------------------------------------
//                            Custom Cache
// ----------------------------------------------------------------
/**
 * @typedef {Object<string, server_id>} ZenCache
 * @memberof typedefs
 *
 */

/**
 * @typedef {Object} server_id
 * @property {Object} server_id.enabled
 * @property {boolean} server_id.enabled.levels
 * @property {boolean} server_id.enabled.playChns
 * @property {boolean} server_id.enabled.rep
 *
 * @property {Object} server_id.channels
 * @property {Array<String>} server_id.channels.hashtags
 * @property {String} server_id.channels.logChn
 * @property {Number} server_id.channels.playCat
 *
 * @property {Object} server_id.roles
 * @property {Array<String>} server_id.roles.exceptions
 *
 * @property {Object} server_id.settings
 */

// ----------------------------------------------------------------
//                             Typedefs
// ----------------------------------------------------------------
// ----------------------------------------------------------------
//                             Typedefs
// ----------------------------------------------------------------
// ----------------------------------------------------------------
//                             Typedefs
// ----------------------------------------------------------------
// ----------------------------------------------------------------
//                             Typedefs
// ----------------------------------------------------------------
// ----------------------------------------------------------------
//                             Typedefs
// ----------------------------------------------------------------

// ----------------------------------------------------------------
//                             Custom
// ----------------------------------------------------------------

// ----------------------------------------------------------------
//                             Typedefs
// ----------------------------------------------------------------
export default {};
