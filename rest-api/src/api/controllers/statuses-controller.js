/**
 * 
 * @author rsb
 */

// router
const router = require('express').Router();
const mapping = '/statuses';

// middlewares
const security = require('../security');

// schemas
const User = require('../../../database/models/user');
const Status = require('../../../database/models/status');

// utils
const utils = require('../utils');

router.get(mapping, (req, res) => {
    Status.find((err, statuses) => {
        if (err) {
            res.status(500).send('Unexpected error occured while fetching statuses.');
            return;
        }

        res.json({ message: 'FOR TESTING PURPOSES ONLY', statuses: statuses });
        return;
    });
});

router.delete(mapping, (req, res) => {
    User.remove({}, (err, statuses) => {
        if (err) {
            res.status(500).send('Unexpected error while deleting all statuses from all users.');
            return;
        }

        res.json({ message: 'deleted all statuses from all users', statuses: statuses });
        return;
    });
});

module.exports = {
    router
};