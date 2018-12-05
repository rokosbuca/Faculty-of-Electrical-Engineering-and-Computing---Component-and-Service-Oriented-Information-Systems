// controllers
const userController = require('./controllers/user-controller');
const statusController = require('./controllers/status-controller');
const apiKeyController = require('./controllers/apikey-controller');

// middlewares
const security = require('./security');

module.exports = (app, path) => {
    app.use(path, security.accessFrequencyLimiterMiddlewareByIP);

    // link controller's routers
    app.use(path, userController.router);
    app.use(path, statusController.router);
    app.use(path, apiKeyController.router);
}