"use strict";

/**
 * Constructeur de session. Préférer un appel aux méthodes create et createGuest.
 * @param {boolean} authenticated
 * @param {string} token
 * @param {Array.string} rights
 * @param {string} userID
 */
var Session = function (authenticated, token, rights, userID) {
    if (typeof rights === 'undefined') {
        rights = [];
    }
    this.authenticated = authenticated;
    this.token = token;
    this.rights = rights;
    this.userId = userID;
};

/**
 * Permet de vérifier si la session à mes autorisations requises.
 * @param {array|string} required
 * @returns {Boolean}
 */
Session.prototype.assertAccess = function (required) {
    if (required instanceof Array) {
        var length = required.length;
        for (var i = 0; i < length; i++) {
            if (this.rights.indexOf(required[i]) === -1) {
                return false;
            }
        }
        return true;
    }
    else {
        return this.rights.indexOf(required) !== -1;
    }
};

/**
 * Crée une session basique, sans droit.
 * @returns {Session}
 */
Session.createGuest = function () {
    return new Session(false, null, [], null);
};

/**
 * Crée une sessions connectée.
 * @param {string} token
 * @param {array|string} rights
 * @param {string} userID
 * @returns {Session}
 */
Session.create = function (token, rights, userID) {
    return new Session(true, token, rights, userID);
};

module.exports = Session;
