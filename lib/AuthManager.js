"use strict";

var Session = require('./Session');
var restify = require('restify');

var IcyError = require('IcyApiError').IcyError;
var authErrorCodes = require('IcyApiError').AuthCodes.base;

/**
 * Nom du cookie du token de connexion.
 * @type String 
 */
var ICYTOKEN_COOKIE = "IcyToken";

/**
 * Gestionnaire d'authentification
 * @param {Restify.server} server
 * @param {Function} clientAuth 
 * @param {Function} authToken
 * @param {Function} revokeToken
 * @param {Function} register
 */
module.exports = function (server, options) {

    /**
     * @api {get} /login Récupérer un token d'identification
     * @apiName GetToken
     * @apiGroup Login
     * 
     * @apiHeader {string} Authorization Les info de login sous forme "Basic base64(login:password)"
     *
     * @apiSuccess (200) {Object} auth_ok           auth_ok
     * @apiSuccess (200) {Number} auth_ok.code    Code d'erreur 0
     * @apiSuccess (200) {Object} auth_ok.data    Les info de login
     * @apiSuccess (200) {String} auth_ok.data.access_token   Token d'accès
     * @apiSuccess (200) {Number} auth_ok.data.expire         Date d'expiration du token (timestamp)
     * 
     * 
     */
    server.get('/login', function (req, res, next) {
        if (hasBasisAuth(req)) {
            options.authClient(req.authorization.basic, function (err, result) {
                if (err) {
                    return next(err);
                }
                else {
                    res.send(result);
                    return next();
                }
            });
        }
        else {
            res.send(new IcyError(authErrorCodes | 2, {}, "Informations d'authentification incomplètes"));
        }
    });

    /**
     * @api {get} /logout Révoquer le token de connexion
     * @apiName Logout
     * @apiGroup Login
     * 
     *   @apiHeader {String} Authorization Bearer &lt;token&gt;.
     * 
     * @apiHeaderExample {string} Exemple de header d'authentification:
     * Authorization: Bearer X6QxfulpjhLWbalwN7QNNWBFBn7pAuAILxI
     * 
     * @apiSuccess (200) {Object} auth_ok           ok
     * @apiSuccess (200) {Number} auth_ok.code    Code d'erreur 0
     * 
     * 
     */
    server.get('/logout', function (req, res, next) {
        if (hasBearerToken(req)) {
            options.revokeToken(getBearerToken(req), function (err, result) {
                if (err) {
                    return next(err);
                }
                else {
                    res.json({});
                    return next();
                }
            });
        }
        else {
            res.json({});
            return next();
        }
    });

    server.get('/status', function (req, res, next) {

    });

    /**
     * Injecte la 'sessions' dans la requête si disponible.
     */
    server.use(function (req, res, next) {
        console.log(req.authorization);
        if (hasBearerToken(req)) {
            options.authToken(getBearerToken(req), function (err, result) {
                if (err) {
                    return next(err);
                }
                else {
                    req.session = Session.create(result.token, result.rights, result.userID);
                    return next();
                }
            });
        }
        else {
            req.session = Session.createGuest();
            return next();
        }
    });
};
function hasBearerToken(req) {
    return req.authorization && req.authorization.scheme === "Bearer" && req.authorization.credentials.length > 0;
}

function getBearerToken(req) {
    return hasBearerToken(req) ? req.authorization.credentials : null;
}

function hasBasisAuth(req) {
    return req.authorization && req.authorization.scheme === "Basic"
            && req.authorization.basic
            && req.authorization.basic.username.length > 0
            && req.authorization.basic.password.length > 0;
}
