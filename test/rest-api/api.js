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

// config chai library
chai.use(chaiHttp);

describe('User', () => {
    beforeEach((done) => {
        // before each test empty the database
        User.remove({}, (err) => {
            done();
        });
    });
    /** test GET /api/users */
    describe('GET /api/users', () => {
        it ('it should return no users from an empty database', (done) => {
            chai.request(server)
                .get('/api/users')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.users.should.be.a('array');
                    res.body.users.length.should.be.eql(0);

                    done();
                });
        });
        it ('it should retrieve all users when there are users in the database', (done) => {
            new User().save(() => {
                new User().save(() => {
                    new User().save(() => {
                        chai.request(server)
                            .get('/api/users')
                            .end((err, res) => {
                                res.should.have.status(200);
                                res.body.should.be.a('object');
                                res.body.users.should.be.a('array');
                                res.body.users.length.should.be.eql(3);

                                done();
                            });
                    });
                });
            });
        });
        
    });
});