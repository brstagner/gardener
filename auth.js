"use strict";

// Middleware and helper logic for authorization
require('dotenv').config();
const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("./expressError");

/** return signed JWT from user data. */

function createToken (user) {

    let payload = {
        username: user.username,
        isAdmin: user.is_admin || false,
    };

    return jwt.sign(payload, process.env.SECRET_KEY);
}

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT (req, res, next) {
    try {
        const token = req.headers && req.headers.authorization;
        if (token) {
            res.locals.user = jwt.verify(token, process.env.SECRET_KEY);
        }
        return next();
    } catch (err) {
        return next();
    }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn (req, res, next) {
    try {
        if (!res.locals.user) throw new UnauthorizedError();
        return next();
    } catch (err) {
        return next(err);
    }
}

/** Middleware to use when they must be logged in as admin.
 *
 * If not, raises Unauthorized.
 */

function isAdmin (req, res, next) {
    try {
        if (!res.locals.user || !res.locals.user.isAdmin) throw new UnauthorizedError();
        return next();
    } catch (err) {
        return next(err);
    }
}

/** Middleware to use when they must be logged in as relevant user or as admin.
 *
 * If not, raises Unauthorized.
 */

function isUser (req, res, next) {
    try {
        if (!res.locals.user || ((req.params.username != res.locals.user.username) && (!res.locals.user.isAdmin)))
            throw new UnauthorizedError();
        return next();
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createToken,
    authenticateJWT,
    ensureLoggedIn,
    isAdmin,
    isUser
};