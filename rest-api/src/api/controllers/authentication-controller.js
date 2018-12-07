/**
 * 
 * @author rsb
 */

// router
const router = require('express').Router();
const mapping = '/authenticate';

// middlewares
const security = require('../security');

// schemas
const User = require('../../../database/models/user');
const Salt = require('../../../database/models/salt');

// utils
const utils = require('../utils');

// authentication
const jwt = require('jsonwebtoken');
const config = require('../../config');

router.post(mapping, (req, res) => {
    if (!req.body.username) {
        res.status(400).send('Malformed request. Please provide username.');
        return;
    }
    if (!req.body.password) {
        res.status(400).send('Malformed request. Please provide password.');
        return;
    }

    const username = req.body.username;
    const password = req.body.password;

    User.findOne({
        username: username
    }, (err, user) => {
        if (err) {
            res.status(500).send('Unexpected error while fetching user.');
            return;
        }

        // check if password is correct
        // for that, find user's salt to reproduce password
        // from plain text password sent in the request
        Salt.findOne({
            saltId: user.saltId
        }, (err, salt) => {
            if (err) {
                res.status(500).send(err);
                return;
            }

            const hashedSentPassword = utils.createPassword(password, salt.salt);
            if (hashedSentPassword !== user.password) {
                // authentication failed
                // do not provide token
                res.status(401).send('Unathorized. Wrong password provided');
                return;
            } else {
                const payload = {
                    userId: user.userId,
                    username: user.username,
                    hashedPassword: user.password
                }
                const token = jwt.sign(payload, config.secret, {
                    expiresIn: 1440
                });

                res.json({ message: 'Authentication successful', token: token });
                return;
            }

        });
    });
});

module.exports = {
    router
};