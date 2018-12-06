/**
 * 
 * @author rsb
 */

// router
const router = require('express').Router();
const mapping = '/users';

// middlewares
const security = require('../security');

router.get(mapping, (req, res) => {});

router.get(mapping + '/:id/statuses', (req, res) => {});

module.exports = {
    router
};