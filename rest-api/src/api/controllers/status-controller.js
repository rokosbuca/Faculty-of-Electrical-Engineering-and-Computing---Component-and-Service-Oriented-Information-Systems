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
        }

        res.json({ message: 'Random status generated successfully.', status: status });
    });
});

router.get(mapping, (req, res) => {
    Status.find((err, statuses) => {
        if (err) {
            res.status(500).send('Unexpected error occured while fetching statuses.');
        }

        res.json({ statuses: statuses });
    });
});

router.post(mapping, (req, res) => {
    /**
     * Status
     * statusId -> generated automatically
     * text
     * userId
     */

    if (!req.body.userId) {
        req.status(400).send('Malformed request. Please provide userId this status should be added to.');
    }
    if (!req.body.text) {
        req.status(400).send('Malformed request. Please provide text for this status.');
    }

    const statusId = utils.randomId();
    const userId = String(req.body.userId);
    const text = String(req.body.text);

    // first find if user with given userId exists
    User.find((err, users) => {
        if (err) {
            res.status(500).send('Unexpected error while checking if the userId given is valid.');
        }

        let userFound = false;
        let ui = -1;
        for (let i in users) {
            if (users[i].userId === userId) {
                userFound = true;
                ui = i;
            }
        }

        if (!userFound) {
            res.status(400).send('Please provide existing userId.');
        }

        const status = new Status();
        status.statusId = statusId;
        status.text = text;
        status.userId = userId;

        status.save((err) => {
            if (err) {
                res.status(500).send('Unexpected error while saving new status.');
            }

            res.json({ message: 'Status saved successfully.', status: status });
        });
    });
});

router.put(mapping, (req, res) => {
    if (!req.body.statusId) {
        req.status(400).send('Malformed request. Please provide statusId');
    }
    if (!req.body.userId) {
        req.status(400).send('Malformed request. Please provide userId this status should be added to.');
    }
    if (!req.body.text) {
        req.status(400).send('Malformed request. Please provide text for this status.');
    }

    const statusId = String(req.body.statusId);
    const userId = String(req.body.userId);
    const text = String(req.body.text);

    Status.update({
        statusId: statusId
        }, {
            text: text,
        }, (err, user) => {
            if (err) {
                res.status(500).send('Unexpected server error while updating status text.');
            }

            res.json({ message: 'Status successfully updated.', user: user });
    });
});

router.delete(mapping, (req, res) => {
    if (!req.body.statusId) {
        req.status(400).send('Malformed request. Please provide statusId');
    }

    const statusId = String(req.body.statusId);

    Status.remove({
        statusId: statusId
    }, function(err, status) {
        if (err) {
            res.status(500).send(err);
        }

        res.json({ message: 'Successfully deleted', status: status });
    });
});

module.exports = {
    router
};