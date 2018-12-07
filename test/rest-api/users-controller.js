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

describe('USERS CONTROLLER', () => {
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
    /** test GET /api/users */
    describe('GET /api/users', () => {
        it ('it shouldn\'t fail when the database is empty', (done) => {
            chai.request(server)
                .get('/api/users')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.users.length.should.be.eql(0);

                    done();
                });
        });
        it ('it should return all users', (done) => {
            new User().save(() => {
                new User().save(() => {
                    new User().save(() => {
                        chai.request(server)
                            .get('/api/users')
                            .end((err, res) => {
                                res.should.have.status(200);
                                res.body.users.length.should.be.eql(3);

                                done();
                            });
                    });
                });
            });
        });
    });
    /** test DELETE /api/users */
    describe('DELETE /api/users', () => {
        it ('it should delete the entire database of users', (done) => {
            const u1 = new User();
            u1.userId = utils.randomId();
            u1.username = utils.randomString(5);
            u1.email = utils.randomEmail();
            u1.password = utils.createPassword(utils.randomString(9), utils.randomSalt);
            u1.saltId = utils.randomId();
            u1.save(() => {
                const u2 = new User();
                u2.userId = utils.randomId();
                u2.username = utils.randomString(5);
                u2.email = utils.randomEmail();
                u2.password = utils.createPassword(utils.randomString(9), utils.randomSalt);
                u2.saltId = utils.randomId();
                u2.save(() => {
                    const u3 = new User();
                    u3.userId = utils.randomId();
                    u3.username = utils.randomString(5);
                    u3.email = utils.randomEmail();
                    u3.password = utils.createPassword(utils.randomString(9), utils.randomSalt);
                    u3.saltId = utils.randomId();
                    u3.save(() => {
                        chai.request(server)
                            .delete('/api/users')
                            .end((err, res) => {
                                res.should.have.status(200);
                                res.body.users.should.be.a('object');
                                res.body.users.n.should.be.eql(3);
                                res.body.users.ok.should.be.eql(1);

                                done();
                            });
                    });
                });
            });
        });
    });
});
