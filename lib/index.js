/**
 * Module dependencies.
 */
let Strategy = require('./strategy')
// , BadRequestError = require('./errors/badrequesterror')
// , InternalOpenIDError = require('./errors/internalopeniderror');


/**
 * Expose `Strategy` directly from package.
 */
exports = module.exports = Strategy;

/**
 * Expose constructors.
 */
exports.Strategy = Strategy;

// exports.BadRequestError = BadRequestError;
// exports.InternalOpenIDError = InternalOpenIDError;