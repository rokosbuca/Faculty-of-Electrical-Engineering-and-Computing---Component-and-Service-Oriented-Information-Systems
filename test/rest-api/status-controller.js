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
});
