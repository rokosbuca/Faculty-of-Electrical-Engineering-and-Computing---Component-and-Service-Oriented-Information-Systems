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
});
