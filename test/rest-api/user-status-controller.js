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

describe('USER - STATUS CONTROLLER', () => {
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
    /** test GET /api/users/:userId/statuses */
    describe('GET /api/users/:userId/statuses', () => {
        it ('it shouldn\'t fail when the database is empty', (done) => {
            chai.request(server)
                .get('/api/users/xxx/statuses')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.statuses.length.should.be.eql(0);

                    done();
                });
        });
        it ('it should return all user\'s statuses', (done) => {
            const user = new User();
            user.userId = utils.randomId()
            user.username = 'username';
            user.email = utils.randomEmail();
            user.password = utils.createPassword('password', utils.randomSalt());
            user.saltId = utils.randomId();
            user.save(() => {
                const s1 = new Status();
                s1.userId = user.userId;
                s1.save(() => {
                    const s2 = new Status();
                    s2.userId = user.userId;
                    s2.save(() => {
                        const s3 = new Status();
                        s3.userId = utils.randomId();
                        s3.save(() => {
                            chai.request(server)
                            .get('/api/users/' + user.userId + '/statuses')
                            .end((err, res) => {
                                res.should.have.status(200);
                                res.body.statuses.length.should.be.eql(2);

                                done();
                            });
                        });
                    });
                });
            });
        });
    });
    /** test POST /api/users/:userId/statuses */
    describe('POST /api/users/:userId/statuses', () => {
        it ('it should create new post that belongs to :userId', (done) => {
            const user = new User();
            user.userId = utils.randomId()
            user.username = 'username';
            user.email = utils.randomEmail();
            user.password = utils.createPassword('password', utils.randomSalt());
            user.saltId = utils.randomId();
            user.save(() => {
                // create json web token for user to send with post request
                const payload = {
                    userId: user.userId,
                    username: user.username,
                    hashedPassword: user.password
                };
                const token = jwt.sign(payload, config.secret, {
                    expiresIn: 1440
                });
                const postBody = {
                    token: token,
                    text: 'random text'
                };
                chai.request(server)
                    .post('/api/users/' + user.userId + '/statuses')
                    .send(postBody)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.status.userId.should.be.eql(user.userId);

                        done();
                    });
            });
        });
    });
    /** test PUT /api/users/:userId/statuses */
    describe('PUT /api/users/:userId/statuses', () => {
        it ('it should fail when no body is provided', (done) => {
            chai.request(server)
                .put('/api/users/xxx/statuses')
                .end((err, res) => {
                    res.should.have.status(400);

                    done();
                });
        });
        it ('it should correctly replace current user\'s status text with new text', (done) => {
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
                            statusId: statusOld.statusId,
                            text: 'new text'
                        };
                        chai.request(server)
                            .put('/api/users/' + statusOld.userId + '/statuses')
                            .send(putBody)
                            .end((err, res) => {
                                res.should.have.status(200);
                                res.body.status.should.be.a('object');
                                res.body.status.n.should.be.eql(1);
                                res.body.status.nModified.should.be.eql(1);
                                res.body.status.ok.should.be.eql(1);
            
                                done();
                            });
                    });
                });
            });
        });
    });
    /** test DELETE /api/users/:userId/statuses */
    describe('DELETE /api/users/:userId/statuses', () => {
        it ('it should fail when attempt is made to delete the status that doesn\'t belong to userId encoded in json web token', (done) => {
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
                    status.text = utils.randomStatus();
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
                            token: token,
                            statusId: status.statusId
                        };
                        chai.request(server)
                            .delete('/api/users/' + user.userId + '/statuses')
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
