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

describe('STATUSES CONTROLLER', () => {
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
    /** test GET /api/statuses */
    describe('GET /api/statuses', () => {
        it ('it shouldn\'t fail when the database is empty', (done) => {
            chai.request(server)
                .get('/api/statuses')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.statuses.length.should.be.eql(0);

                    done();
                });
        });
        it ('it should return all statuses', (done) => {
            new Status().save(() => {
                new Status().save(() => {
                    new Status().save(() => {
                        chai.request(server)
                            .get('/api/statuses')
                            .end((err, res) => {
                                res.should.have.status(200);
                                res.body.statuses.length.should.be.eql(3);

                                done();
                            });
                    });
                });
            });
        });
    });
    /** test DELETE /api/statuses */
    describe('DELETE /api/statuses', () => {
        it ('it should delete the entire database of statuses', (done) => {
            const s1 = new Status();
            s1.statusId = utils.randomId();
            s1.userId = utils.randomId();
            s1.text = utils.randomStatus();
            s1.save(() => {
                const s2 = new Status();
                s2.statusId = utils.randomId();
                s2.userId = utils.randomId();
                s2.text = utils.randomStatus();
                s2.save(() => {
                    const s3 = new Status();
                    s1.statusId = utils.randomId();
                    s3.userId = utils.randomId();
                    s3.text = utils.randomStatus();
                    s3.save(() => {
                        chai.request(server)
                            .delete('/api/statuses')
                            .end((err, res) => {
                                res.should.have.status(200);
                                res.body.statuses.should.be.a('object');
                                res.body.statuses.n.should.be.eql(0);
                                res.body.statuses.ok.should.be.eql(1);

                                done();
                            });
                    });
                });
            });
        });
    });
});
