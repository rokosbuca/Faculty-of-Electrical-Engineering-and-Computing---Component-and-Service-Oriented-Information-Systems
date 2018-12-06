// controllers
const usersController = require('./controllers/users-controller');
const userController = require('./controllers/user-controller');
const userStatusController = require('./controllers/user-status-controller');
const statusController = require('./controllers/status-controller');
const authenticationController = require('./controllers/authentication-controller');

// middlewares
const security = require('./security');

module.exports = (app, path) => {
    // enable api frequency access limiter middleware which is triggered with the senders IP
    app.enable('trust proxy'); // only useful if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
    app.use(path, security.accessFrequencyLimiterMiddlewareByIP);

    // ping user back when /api is requested
    app.use(require('express').Router().get(path, (_, res) => { res.json({ message: 'api is online' }); }));

    // link controller's routers
    app.use(path, authenticationController.router);
    app.use(path, usersController.router);
    app.use(path, userController.router);
    app.use(path, userStatusController.router);
    app.use(path, statusController.router);
}