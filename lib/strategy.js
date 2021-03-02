/**
 * Module dependencies.
 */
var passport = require('passport-strategy')
    , util = require('util')
    , restler = require('restler')
// , BadRequestError = require('./errors/badrequesterror')
// , InternalOpenIDError = require('./errors/internalopeniderror');


/**
 * `Strategy` constructor.
 *
 * The OpenID authentication strategy authenticates requests using the OpenID
 * 2.0 or 1.1 protocol.
 *
 * OpenID provides a decentralized authentication protocol, whereby users can
 * authenticate using their choice of OpenID provider.  Authenticating in this
 * this manner involves a sequence of events, including prompting the user to
 * enter their OpenID identifer and redirecting the user to their OpenID
 * provider for authentication.  Once authenticated, the user is redirected back
 * to the application with an assertion regarding the identifier.
 *
 * Applications must supply a `verify` callback which accepts an `identifier`,
 * an optional service-specific `profile`, an optional set of policy extensions
 * and then calls the `done` callback supplying a `user`, which should be set to 
 * `false` if the credentials are not valid.  If an exception occured, `err` 
 * should be set.
 *
 * Options:
 *   - `returnURL`         URL to which the OpenID provider will redirect the user after authentication
 *   - `realm`             the part of URL-space for which an OpenID authentication request is valid
 *   - `profile`           enable profile exchange, defaults to _false_
 *   - `pape`              when present, enables the OpenID Provider Authentication Policy Extension
 *                         (http://openid.net/specs/openid-provider-authentication-policy-extension-1_0.html)
 *   - `pape.maxAuthAge`   sets the PAPE maximum authentication age in seconds
 *   - `pape.preferredAuthPolicies` sets the preferred set of PAPE authentication policies for the 
 *                         relying party to use for example `multi-factor`, `multi-factor-physical`
 *                         or `phishing-resistant` (either an array or a string)
 *   - `identifierField`   field name where the OpenID identifier is found, defaults to 'openid_identifier'
 *   - `passReqToCallback` when `true`, `req` is the first argument to the verify callback (default: `false`)
 *
 * Examples:
 *
 *     passport.use(new OpenIDStrategy({
 *         returnURL: 'http://localhost:3000/auth/openid/return',
 *         realm: 'http://localhost:3000/'
 *       },
 *       function(identifier, done) {
 *         User.findByOpenID(identifier, function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 *     passport.use(new OpenIDStrategy({
 *         returnURL: 'http://localhost:3000/auth/openid/return',
 *         realm: 'http://localhost:3000/',
 *         profile: true,
 *         pape: { maxAuthAge : 600 } 
 *       },
 *       function(identifier, profile, done) {
 *         User.findByOpenID(identifier, function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {

    if (!options.clientId) throw new Error('OneID authentication requires a clientId option');
    if (!options.clientSecret) throw new Error('OneID authentication requires a clientSecret option');
    if (!options.refCode) throw new Error('OneID authentication requires a refCode option');

    passport.Strategy.call(this);
    this.name = 'oneid';

    this._config = {
        client_id: options.clientId,
        client_secret: options.clientSecret,
        shared_token: '',
        refcode: options.refCode
    }
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(Strategy, passport.Strategy);


/**
 * Authenticate request by delegating to an OpenID provider using OpenID 2.0 or
 * 1.1.
 *
 * @param {Object} req
 * @api protected
 */
Strategy.prototype.authenticate = function (req) {

    if (!req.body?.shared_token) throw new Error('OneID authentication requires a shared_token option');

    let self = this;

    this._config.shared_token = req.body?.shared_token
    restler.post('https://one.th/api/oauth/shared-token', {
        data: this._config
    }).on('complete', data => {
        let username = data?.username;
        if (data?.code) {
            self.error(data?.errorMessage, data?.code)
        }
        else {
            if (data?.access_token) {
                restler.get('https://one.th/api/account', {
                    headers: { 'Authorization': `Bearer ${data.access_token}` }
                }).on('complete', (data) => {
                    data.username = username;
                    if (data?.id) self.success(data)
                    else {
                        self.error("invalid userId", 400)
                    }
                })
            }
            else {
                self.error("invalid clientId", 400)
            }
        }
    })
}

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;