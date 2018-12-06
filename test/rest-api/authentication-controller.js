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

describe('AUTHENTICATION CONTROLLER', () => {
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
    /** test POST /api/authenticate */
    describe('POST /api/authenticate', () => {
        it ('it should fail when there is no username provided in req body', (done) => {
            chai.request(server)
                .post('/api/authenticate')
                .end((err, res) => {
                    res.should.have.status(400);

                    done();
                });
        });
        it ('it should fail when there is no password provided in req body', (done) => {
            chai.request(server)
                .post('/api/authenticate')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({ username: 'xxx' })
                .end((err, res) => {
                    res.should.have.status(400);

                    done();
                });
        });
        it ('it should fail if the given username-password combination is wrong.', (done) => {
            const user = new User();
            user.userId = utils.randomId();
            user.username = 'username';
            user.email = 'email';
            user.password = 'password';
            // create salt to salt the password before saving user
            const salt = new Salt();
            salt.saltId = utils.randomId();
            salt.salt = utils.randomSalt();
            salt.save(() => {
                user.saltId = salt.saltId;
                user.password = utils.createPassword(user.password, salt.salt);
                user.save(() => {
                    // try to authenticate with the wrong password ('Password')
                    chai.request(server)
                        .post('/api/authenticate')
                        .set('content-type', 'application/x-www-form-urlencoded')
                        .send({ username: 'username', password: 'Password' })
                        .end((err, res) => {
                            res.should.have.status(401);
        
                            done();
                        });
                });
            });
        });
        it ('it should create a predictable json web token for given username and password', (done) => {
            const user = new User();
            user.userId = utils.randomId();
            user.username = 'username';
            user.email = 'email';
            user.password = 'password';
            // create salt to salt the password before saving user
            const salt = new Salt();
            salt.saltId = utils.randomId();
            salt.salt = utils.randomSalt();
            salt.save(() => {
                user.saltId = salt.saltId;
                user.password = utils.createPassword(user.password, salt.salt);
                user.save(() => {
                    // try to authenticate with the wrong password ('Password')
                    chai.request(server)
                        .post('/api/authenticate')
                        .set('content-type', 'application/x-www-form-urlencoded')
                        .send({ username: 'username', password: 'password' })
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.token.should.be.a('string');
                            const payload = {
                                userId: user.userId,
                                username: user.username,
                                hashedPassword: user.password
                            }
                            const token = jwt.sign(payload, config.secret, {
                                expiresIn: 1440
                            });
                            res.body.token.should.be.eql(token);

                            done();
                        });
                });
            });
        });
    });
});
