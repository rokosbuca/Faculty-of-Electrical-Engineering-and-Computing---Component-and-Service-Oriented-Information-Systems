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

describe('STATUS CONTROLLER', () => {
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
    /** test GET /api/statuses/:statusId */
    describe('GET /api/statuses/:statusId', () => {
        it ('it should fail when the provided :statusId doesn\'t exist in the database', (done) => {
            chai.request(server)
                .get('/api/statuses/xxx')
                .end((err, res) => {
                    res.should.have.status(400);

                    done();
                });
        });
        it ('it should return the correct status\' text', (done) => {
            const status = new Status();
            status.statusId = utils.randomId();
            status.text = utils.randomStatus();
            status.userId = utils.randomId();
            status.save(() => {
                chai.request(server)
                    .get('/api/statuses/' + status.statusId)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.status.text.should.be.a('string');
                        res.body.status.statusId.should.be.eql(status.statusId);
                        res.body.status.text.should.be.eql(status.text);
                        res.body.status.userId.should.be.eql(status.userId);

                        done();
                    });
            });
        });
    });
    /** test POST /api/statuses/:statusId */
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
    /** test PUT /api/statuses/:statusId */
    describe('PUT /api/statuses/:statusId', () => {
        it ('it should fail when no body is provided', (done) => {
            chai.request(server)
                .put('/api/statuses/xxx')
                .end((err, res) => {
                    res.should.have.status(400);

                    done();
                });
        });
        it ('it should correctly replace current status\' data with new data', (done) => {
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
                            userId: user.userId,
                            text: 'new text'
                        };
                        chai.request(server)
                            .put('/api/statuses/' + statusId)
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
    /** test DELETE /api/statuses/:statusId */
    describe('DELETE /api/statuses/:statusId', () => {
        it ('it shouldn\'t fail when no such status exists', (done) => {
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
                    // delete status that doesn't exist
                    const statusId = utils.randomId();
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
                        .delete('/api/statuses/' + statusId)
                        .send(deleteBody)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.status.should.be.a('object');
                            res.body.status.n.should.be.eql(0);
                            res.body.status.ok.should.be.eql(1);
        
                            done();
                        });
                });
            });
        });
        it ('it should correctly delete the status defined by :statusId', (done) => {
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
                            .delete('/api/statuses/' + statusId)
                            .send(deleteBody)
                            .end((err, res) => {
                                res.should.have.status(200);
                                res.body.status.should.be.a('object');
                                res.body.status.n.should.be.eql(1);
                                res.body.status.ok.should.be.eql(1);
            
                                done();
                            });
                    });
                });
            });
        });
    });
});
