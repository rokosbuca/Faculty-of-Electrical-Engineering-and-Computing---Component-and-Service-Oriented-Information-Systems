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

router.post(mapping + '/rnd', (req, res) => {
    const userId = req.body.userId;
    const statusId = utils.randomId();
    const text = utils.randomStatus();

    const status = new Status();
    status.statusId = statusId;
    status.text = text;
    status.userId = userId;
    
    status.save((err) => {
        if (err) {
            res.status(500).send(err);
            return;
        }

        res.json({ message: 'Random status generated successfully.', status: status });
        return;
    });
});

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