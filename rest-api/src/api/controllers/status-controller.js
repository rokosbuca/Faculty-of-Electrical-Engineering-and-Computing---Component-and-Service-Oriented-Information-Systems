/**
 * 
 * @author rsb
 */

// router
const router = require('express').Router();
const mapping = '/statuses/:statusId';

// middlewares
const security = require('../security');

// schemas
const User = require('../../../database/models/user');
const Status = require('../../../database/models/status');

// utils
const utils = require('../utils');

router.get(mapping, (req, res) => {
    if (!req.params.statusId) {
        res.status(400).send('Malformed request. Please provide statusId.');
        return;
    }

    const statusId = req.params.statusId;

    Status.findOne({ statusId: statusId }, (err, status) => {
        if (err) {
            res.status(500).send('Unexpected error occured while fetching statuses.');
            return;
        }

        if (!status) {
            res.status(400).send('Malformed request. Provided statusId doesn\'t exist in the database.');
            return;
        }

        res.json({ status: status });
        return;
    });
});

router.post(mapping,
    security.authenticationMiddleware,
    security.accessFrequencyLimiterMiddlewareByToken,
    (req, res) => {
    /**
     * Status...
     * statusId
     * text
     * userId
     */

    if (!req.params.statusId) {
        req.status(400).send('Malformed request. Please provide statusId.');
        return;
    }
    if (!req.body.userId) {
        req.status(400).send('Malformed request. Please provide userId this status should be added to.');
        return;
    }
    if (!req.body.text) {
        req.status(400).send('Malformed request. Please provide text for this status.');
        return;
    }

    const statusId = req.params.statusId;
    const userId = String(req.body.userId);
    const text = String(req.body.text);

    // first find if user with given userId exists
    User.find((err, users) => {
        if (err) {
            res.status(500).send('Unexpected error while checking if the userId given is valid.');
            return;
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
            return;
        }

        const status = new Status();
        status.statusId = statusId;
        status.text = text;
        status.userId = userId;

        status.save((err) => {
            if (err) {
                res.status(500).send('Unexpected error while saving new status.');
                return;
            }

            res.json({ message: 'Status saved successfully.', status: status });
            return;
        });
    });
});

router.put(mapping, (req, res) => {
    if (!req.params.statusId) {
        req.status(400).send('Malformed request. Please provide statusId');
    }
    if (!req.body.userId) {
        req.status(400).send('Malformed request. Please provide userId this status should be added to.');
    }
    if (!req.body.text) {
        req.status(400).send('Malformed request. Please provide text for this status.');
    }

    const statusId = String(req.params.statusId);
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
    if (!req.params.statusId) {
        req.status(400).send('Malformed request. Please provide statusId');
    }

    const statusId = String(req.params.statusId);

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