/**
 * Security middlewares for the rest api.
 * 
 * This modules handles authentication via the api token, 
 * restricts too frequent of an access to the api and 
 * manages developer access permissions to various parts
 * of the api.
 * 
 * @author rsb
 */
'use strict';

const redis = require('redis');
const redisClient = redis.createClient();
const RateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

const jwt = require('jsonwebtoken');
const config = require('../config');

const decodeApiKey = (apiKey) => {
    // TODO
    return null;
};

const authenticationMiddleware = (req, res, next) => {
    console.log('accessing security.authenticationMiddleware middleware');

    if (!req.body.token) {
        res.status(400).send('Malformed request. Please provide token with this request and try again.');
        return;
    }

    const token = req.body.token;

    jwt.verify(token, config.secret, (err, decodedToken) => {
        if (err) {
            res.status(401).send('Unaothrized. Token authentication failed.');
            return;
        }

        // save token to req for later use
        req.decodedToken = decodedToken;
        next();
    });
};


const accessPermissionMiddleware = (req, res, next) => {
    console.log('accessing security.accessPermissionMiddleware middleware');
    next();
};

const accessFrequencyLimiterMiddlewareByIP = new RateLimit({
    store: new RedisStore({
        expiry: 60,     // 60 sec
        resetExpiryOnChange: false,
        prefix: 'rl:ip:'    // prefix on redis
    }),

    max: 20, // limit each IP to 20 requests per windowMs - this amounts to 1200 requests per hour
    delayMs: 0, // disable delaying - full speed until the max limit is reached
    message: { success: false, message: 'You have exceeded a maximum of 20 api requests per minute from this IP address. Please try again later.' }, // message to be sent if the limit is exceeded. Keep in mind the "time to wait before retrying (Retry-After)" is embedded in the header by default.
    keyGenerator: (req) => req.ip
});

const accessFrequencyLimiterMiddlewareByToken = new RateLimit({
    store: new RedisStore({
        expiry: 60,     // 60 sec
        resetExpiryOnChange: false,
        prefix: 'rl:key:'    // prefix on redis
    }),

    max: 20, // limit each dev api key to 20 requests per windowMs - this amounts to 1200 requests per hour
    delayMs: 0, // disable delaying - full speed until the max limit is reached
    message: { success: false, message: 'You have exceeded a maximum of 20 api requests per minute with this developer api key. Please try again later.' }, // message to be sent if the limit is exceeded. Keep in mind the "time to wait before retrying (Retry-After)" is embedded in the header by default.
    keyGenerator: (req) => req.body.key
})

module.exports = {
    authenticationMiddleware,
    accessPermissionMiddleware,
    accessFrequencyLimiterMiddlewareByIP,
    accessFrequencyLimiterMiddlewareByToken
}