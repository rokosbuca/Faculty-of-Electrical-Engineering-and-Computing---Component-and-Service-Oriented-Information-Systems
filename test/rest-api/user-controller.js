/**
 * 
 * @author rsb
 */

// database 
const mongoose = require("mongoose");

// testing libraries and more
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../rest-api/src/server');
const should = chai.should();

// models
const User = require('../../rest-api/database/models/user');
const Salt = require('../../rest-api/database/models/salt');
const Status = require('../../rest-api/database/models/status');

// utils
const utils = require('../../rest-api/src/api/utils');
const jwt = require('jsonwebtoken');
const config = require('../../rest-api/src/config');

// config chai library
chai.use(chaiHttp);

describe('USER CONTROLLER', () => {
    beforeEach((done) => {
        // before each test empty the database
        User.remove({}, () => {
            Salt.remove({}, () => {
                Status.remove({}, () => {
                    done();
                });
            });
        });
    });
    /** test GET /api/users/:userId */
    describe('GET /api/users/:userId', () => {
        it ('it should fail when the provided :userId doesn\'t exist in the database', (done) => {
            /*
            const user = new User();
            user.userId = req.params.userId
            user.username = 'username';
            user.email = utils.randomEmail();
            user.password = utils.createPassword('password', utils.randomSalt());
            user.saltId = utils.randomId();
            // generate json web token
            const payload = {
                userId: user.userId,
                username: user.username,
                hashedPassword: user.password
            };
            const token = jwt.sign(payload, config.secret, {
                expiresIn: 1440
            });
            const getBody = {
                token: token
            };*/
            chai.request(server)
                .get('/api/users/xxx')
                .end((err, res) => {
                    res.should.have.status(404);

                    done();
                });
        });
        it ('it should return the correct user\'s data', (done) => {
            const user = new User();
            user.userId = utils.randomId()
            user.username = 'username';
            user.email = utils.randomEmail();
            user.password = utils.createPassword('password', utils.randomSalt());
            user.saltId = utils.randomId();
            user.save(() => {
                chai.request(server)
                    .get('/api/users/' + user.userId)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.user.userId.should.be.eql(user.userId);
                        res.body.user.username.should.be.eql(user.username);
                        res.body.user.email.should.be.eql(user.email);
                        res.body.user.password.should.be.eql(user.password);
                        res.body.user.saltId.should.be.eql(user.saltId);

                        done();
                    });
            });
        });
    });
    /** test POST /api/statuses/:statusId */
    /*
    describe('POST /api/statuses/:statusId', () => {
        it ('it should fail when no body is provided', (done) => {
            chai.request(server)
                .post('/api/statuses/xxx')
                .end((err, res) => {
                    res.should.have.status(400);

                    done();
                });
        });
        it ('it should create a status with an user-given statusId', (done) => {
            // create an user so json web token can be created
            const user = new User();
            user.userId = utils.randomId();
            user.username = 'username';
            user.password = 'password';
            const salt = new Salt();
            salt.saltId = utils.randomId();
            salt.salt = utils.randomSalt();
            user.saltId = salt.saltId;
            user.password = utils.createPassword(user.password, salt.salt);
            salt.save(() => {
                user.save(() => {
                    const statusId = utils.randomId();
                    const payload = {
                        userId: user.userId,
                        username: user.username,
                        hashedPassword: user.password
                    }
                    const token = jwt.sign(payload, config.secret, {
                        expiresIn: 1440
                    });
                    const postBody = {
                        token: token,
                        userId: user.userId,
                        text: utils.randomStatus()
                    };
                    chai.request(server)
                        .post('/api/statuses/' + statusId)
                        .send(postBody)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.status.text.should.be.a('string');
                            res.body.status.statusId.should.be.eql(statusId);
                            res.body.status.text.should.be.eql(postBody.text);
                            res.body.status.userId.should.be.eql(postBody.userId);
        
                            done();
                        });
                });
            });
        });
    });
    */
    /** test PUT /api/users/:userId */
    describe('PUT /api/users/:userId', () => {
        it ('it should fail when no body is provided', (done) => {
            chai.request(server)
                .put('/api/users/xxx')
                .end((err, res) => {
                    res.should.have.status(400);

                    done();
                });
        });
        it ('it should correctly replace current user\'s data with new data', (done) => {
            // create an user so json web token can be created
            const user = new User();
            user.userId = utils.randomId();
            user.username = 'username';
            user.password = 'password';
            const salt = new Salt();
            salt.saltId = utils.randomId();
            salt.salt = utils.randomSalt();
            user.saltId = salt.saltId;
            user.password = utils.createPassword(user.password, salt.salt);
            salt.save(() => {
                user.save(() => {
                    // create status so it can be replaced with new data
                    const statusOld = new Status();
                    statusOld.statusId = utils.randomStatus();
                    statusOld.userId = user.userId;
                    statusOld.text = 'old text';
                    statusOld.save(() => {
                        // replace statusOld with statusNew
                        // replace old data with new data
                        const statusId = statusOld.statusId;
                        const payload = {
                            userId: user.userId,
                            username: user.username,
                            hashedPassword: user.password
                        };
                        const token = jwt.sign(payload, config.secret, {
                            expiresIn: 1440
                        });
                        const putBody = {
                            token: token,
                            username: utils.randomString(5),
                            email: utils.randomEmail(),
                            password: utils.randomString(6)
                        };
                        chai.request(server)
                            .put('/api/users/' + user.userId)
                            .send(putBody)
                            .end((err, res) => {
                                res.should.have.status(200);
                                res.body.user.should.be.a('object');
                                res.body.user.n.should.be.eql(1);
                                res.body.user.nModified.should.be.eql(1);
                                res.body.user.ok.should.be.eql(1);
            
                                done();
                            });
                    });
                });
            });
        });
    });
    /** test DELETE /api/users/:userId */
    describe('DELETE /api/users/:userId', () => {
        it ('it should fail when attempt is made to delete the user that doesn\'t belong to userId encoded in json web token', (done) => {
            // create an user so json web token can be created
            const user = new User();
            user.userId = utils.randomId();
            user.username = 'username';
            user.password = 'password';
            const salt = new Salt();
            salt.saltId = utils.randomId();
            salt.salt = utils.randomSalt();
            user.saltId = salt.saltId;
            user.password = utils.createPassword(user.password, salt.salt);
            salt.save(() => {
                user.save(() => {
                    // save status that belongs to user with randomId
                    const status = new Status();
                    status.statusId = utils.randomId();
                    status.userId = utils.randomId();
                    status.text = utils.randomStatus()
                    status.save(() => {
                        // attempt to delete status that doesn't belong to userId encoded in json web token
                        // create json web token for user
                        const payload = {
                            userId: user.userId,
                            username: user.username,
                            hashedPassword: user.password
                        };
                        const token = jwt.sign(payload, config.secret, {
                            expiresIn: 1440
                        });
                        const deleteBody = {
                            token: token
                        };
                        chai.request(server)
                            .delete('/api/users/' + utils.randomId())
                            .send(deleteBody)
                            .end((err, res) => {
                                res.should.have.status(401);
            
                                done();
                        });
                    });
                });
            });
        });
        it ('it should correctly delete the user defined by :userId', (done) => {
            // create an user so json web token can be created
            const user = new User();
            user.userId = utils.randomId();
            user.username = 'username';
            user.password = 'password';
            const salt = new Salt();
            salt.saltId = utils.randomId();
            salt.salt = utils.randomSalt();
            user.saltId = salt.saltId;
            user.password = utils.createPassword(user.password, salt.salt);
            salt.save(() => {
                user.save(() => {
                    // create status so it can be deleted
                    // status belongs to the user trying to delete it
                    const statusOld = new Status();
                    statusOld.statusId = utils.randomStatus();
                    statusOld.userId = user.userId;
                    statusOld.text = 'old text';
                    statusOld.save(() => {
                        // delete statusOld
                        const statusId = statusOld.statusId;
                        const payload = {
                            userId: user.userId,
                            username: user.username,
                            hashedPassword: user.password
                        };
                        const token = jwt.sign(payload, config.secret, {
                            expiresIn: 1440
                        });
                        const deleteBody = {
                            token: token,
                            userId: user.userId
                        };
                        chai.request(server)
                            .delete('/api/users/' + user.userId)
                            .send(deleteBody)
                            .end((err, res) => {
                                res.should.have.status(200);
                                res.body.user.should.be.a('object');
                                res.body.user.n.should.be.eql(1);
                                res.body.user.ok.should.be.eql(1);
            
                                done();
                            });
                    });
                });
            });
        });
    });
});
