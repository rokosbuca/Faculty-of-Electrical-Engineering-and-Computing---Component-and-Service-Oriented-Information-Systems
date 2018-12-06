/**
 * 
 * @author rsb
 */

// router
const router = require('express').Router();
const mapping = '/users/:userId';

// middlewares
const security = require('../security');

// schemas
const User = require('../../../database/models/user');
const Salt = require('../../../database/models/salt');

// utils
const utils = require('../utils');

router.get(mapping,
    security.authenticationMiddleware,
    security.accessFrequencyLimiterMiddlewareByToken,
    (req, res) => {
    if (!req.params.userId) {
        res.status(400).send('Malformed request. Please provide userId.');
    }

    const userId = req.params.userId;

    User.findOne({ userId: userId }, (err, user) => {
        if (err) {
            res.status(500).send('Error while fetching user');
        }

        res.json({ user: user });
    });
});


router.put(mapping,
    security.authenticationMiddleware,
    security.accessFrequencyLimiterMiddlewareByToken,
    (req, res) => {
    /**
     * User..
     * username
     * email
     * password
     */
    if (!req.params.userId) {
        res.status(400).send('Malformed request. Please provide userId.');
    }
    if (!req.body.username) {
        res.status(400).send('Malformed request. Please provide new username.');
    }
    if (!req.body.email) {
        res.status(400).send('Malformed request. Please provide new email.');
    }
    if (!req.body.password) {
        res.status(400).send('Malformed request. Please provide new password.');
    }

    const userId = String(req.params.userId);
    const username = String(req.body.username);
    const email = String(req.body.email);
    const password = String(req.body.password);

    // first create new salt for this user
    const salt = new Salt();
    salt.saltId = utils.randomId();
    salt.salt = utils.randomSalt();
    
    salt.save((err) => {
        if (err) {
            res.status(500).send('Unexpected error while saving salt to database.');
        }

        // use this salt to generate hashed password
        const hashedPassword = utils.createPassword(password, salt.salt);
        User.update({
            userId: userId
            }, {
                username: username,
                email: email,
                password: hashedPassword,
                saltId: salt.saltId
            }, (err, user) => {
                if (err) {
                    res.status(500).send('Unexpected server error while updating user.');
                }
    
                res.json({ message: 'User successfully updated.', user: user });
            });
        });

});

router.delete(mapping,
    security.authenticationMiddleware,
    security.accessFrequencyLimiterMiddlewareByToken,
    (req, res) => {
    if (!req.params.userId) {
        res.status(400).send('Malformed request. Please provide userId.');
    }

    const userId = req.params.userId;

    User.remove({
        userId: userId
    }, function(err, user) {
        if (err) {
            res.status(500).send(err);
        }

        res.json({ message: 'Successfully deleted', user: user });
    });
});

module.exports = {
    router
};