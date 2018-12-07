/**
 * 
 * @author rsb
 */

// router
const router = require('express').Router();
const mapping = '/users';

// middlewares
const security = require('../security');

// schemas
const User = require('../../../database/models/user');
const Salt = require('../../../database/models/salt');

// utils
const utils = require('../utils');

router.get(mapping, (req, res) => {
    User.find((err, users) => {
        if (err) {
            res.status(500).send('Error while fetching users.');
            return;
        }

        res.json({ message: 'FOR TESTING PURPOSES', users: users });
        return;
    });
});

router.post(mapping, (req, res) => {
    if (!req.body.username) {
        res.status(400).send('Malformed request. Please provide username');
        return;
    }
    if (!req.body.email) {
        res.status(400).send('Malformed request. Please provide email');
        return;
    }
    if (!req.body.password) {
        res.status(400).send('Malformed request. Please provide password');
        return;
    }
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    // first create salt for this user
    const salt = new Salt();
    salt.saltId = utils.randomId();
    salt.salt = utils.randomSalt();
    
    salt.save((err) => {
        if (err) {
            res.status(500).send('Unexpected error while saving salt to database.');
            return;
        }
        const user = new User();
        user.userId = utils.randomId();
        user.username = username;
        user.email = email;
        user.password = utils.createPassword(password, salt.salt);
        user.saltId = salt.saltId;

        user.save((err) => {
            if (err) {
                res.status(500).send('Unexpected error while saving user to database.');
                return;
            }

        });

        res.json({ message: 'User saved successfully', user: user });
        return;
    });
});

router.delete(mapping, (req, res) => {
    User.remove({}, (err, users) => {
        if (err) {
            res.status(500).send('Unexpected error while deleting all users.');
            return;
        }

        res.json({ message: 'deleted all users', users: users });
        return;
    });
});

module.exports = {
    router
};