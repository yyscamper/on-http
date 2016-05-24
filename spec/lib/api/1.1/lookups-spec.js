// Copyright 2015, EMC, Inc.
/* jshint node:true */

'use strict';

describe('Http.Api.Lookup', function () {
    var waterline, sandbox;

    var data = [
        {
            id: '123',
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
            macAddress: '00:11:22:33:44:55',
            ipAddress: '127.0.0.1',
            node: '123'
        },
        {
            id: 'abc',
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
            macAddress: '66:11:22:33:44:55',
            ipAddress: '127.0.0.10',
            node: 'abc'
        }
    ];

    before('start HTTP server', function () {
        this.timeout(5000);
        sandbox = sinon.sandbox.create();
        return helper.startServer();
    });

    before(function () {
        waterline = helper.injector.get('Services.Waterline');
    });

    afterEach(function () {
        sandbox.restore();
    });

    after('stop HTTP server', function () {
        return helper.stopServer();
    });

    describe('/api/1.1/lookups', function () {
        describe('GET', function () {
            it('should should call waterline.lookups.findByTerm', function() {
                sandbox.stub(waterline.lookups, 'findByTerm').resolves(data);

                return helper.request().get('/api/1.1/lookups')
                    .expect('Content-Type', /^application\/json/)
                    .expect(200)
                    .expect(function () {
                        expect(waterline.lookups.findByTerm).to.have.been.calledWith(undefined);
                    });
            });

            it('should call waterline.lookups.findByterm with 123', function() {
                sandbox.stub(waterline.lookups, 'findByTerm').resolves(data);

                return helper.request().get('/api/1.1/lookups?q=123')
                    .expect('Content-Type', /^application\/json/)
                    .expect(200)
                    .expect(function () {
                        expect(waterline.lookups.findByTerm).to.have.been.calledWith('123');
                    });
            });
        });

        describe('POST', function () {
            it('should call waterline.lookups.create', function() {
                sandbox.stub(waterline.lookups, 'create').resolves(data[0]);

                return helper.request().post('/api/1.1/lookups')
                    .send(data[0])
                    .expect('Content-Type', /^application\/json/)
                    .expect(200)
                    .expect(function () {
                        expect(waterline.lookups.create).to.been.calledWith(sinon.match(data[0]));
                    });
            });
        });

        describe('PUT', function () {
            it('should create a new lookup entry', function() {
                var entry = data[0];
                sandbox.stub(waterline.lookups, 'findOne').resolves();
                sandbox.stub(waterline.lookups, 'create',
                    function(data) {
                        var result = _.cloneDeep(data);
                        result.id = '112233445566';
                        return Promise.resolve(result);
                    }
                );
                sandbox.spy(waterline.lookups, 'updateOneById');

                return helper.request().put('/api/1.1/lookups')
                    .send(entry)
                    .expect('Content-Type', /^application\/json/)
                    .expect(200)
                    .expect(function (data) {
                        expect(waterline.lookups.findOne).to.have.been.called;
                        expect(waterline.lookups.updateOneById).to.not.have.been.called;
                        expect(waterline.lookups.create).to.have.callCount(1)
                            .and.been.calledWith(entry);
                        expect(data.body).to.have.property('ipAddress')
                            .to.equal(entry.ipAddress);
                        expect(data.body).to.have.property('macAddress')
                            .to.equal(entry.macAddress);
                        expect(data.body).to.have.property('node')
                            .to.equal(entry.node);
                        expect(data.body).to.have.property('id')
                            .to.equal('112233445566');
                    });
            });

            it('should replace the record if there is duplicated macAddress', function() {
                var origData = data[0];
                var newData = {
                    ipAddress: '172.31.128.98',
                    macAddress: origData.macAddress,
                    node: origData.node
                };
                sandbox.stub(waterline.lookups, 'findOne').resolves(origData);
                sandbox.stub(waterline.lookups, 'updateOneById',
                    function(id, data) {
                        var result = _.cloneDeep(data);
                        result.id = id;
                        return Promise.resolve(result);
                    }
                );
                sandbox.spy(waterline.lookups, 'create');
                return helper.request().put('/api/1.1/lookups')
                    .send(newData)
                    .expect('Content-Type', /^application\/json/)
                    .expect(200)
                    .expect(function(data) {
                        expect(waterline.lookups.findOne).to.have.been.called;
                        expect(waterline.lookups.updateOneById).to.have.callCount(1)
                            .and.been.calledWith(origData.id, newData);
                        expect(waterline.lookups.create).to.not.have.been.called;
                        expect(data.body).to.have.property('ipAddress')
                            .to.equal(newData.ipAddress);
                        expect(data.body).to.have.property('macAddress')
                            .to.equal(newData.macAddress);
                        expect(data.body).to.have.property('node')
                            .to.equal(newData.node);
                        expect(data.body).to.have.property('id')
                            .to.equal(origData.id);
                    });
            });

            it('should replace the record if there is duplicated ipAddress', function() {
                var origData = data[0];
                var newData = {
                    ipAddress: origData.ipAddress,
                    macAddress: '00:22:12:cc:bb:17',
                    node: origData.node
                };
                sandbox.stub(waterline.lookups, 'findOne').resolves(origData);
                sandbox.stub(waterline.lookups, 'updateOneById',
                    function(id, data) {
                        var result = _.cloneDeep(data);
                        result.id = id;
                        return Promise.resolve(result);
                    }
                );
                sandbox.spy(waterline.lookups, 'create');
                return helper.request().put('/api/1.1/lookups')
                    .send(newData)
                    .expect('Content-Type', /^application\/json/)
                    .expect(200)
                    .expect(function(data) {
                        expect(waterline.lookups.findOne).to.have.been.called;
                        expect(waterline.lookups.updateOneById).to.have.callCount(1)
                            .and.been.calledWith(origData.id, newData);
                        expect(waterline.lookups.create).to.not.have.been.called;
                        expect(data.body).to.have.property('ipAddress')
                            .to.equal(newData.ipAddress);
                        expect(data.body).to.have.property('macAddress')
                            .to.equal(newData.macAddress);
                        expect(data.body).to.have.property('node')
                            .to.equal(newData.node);
                        expect(data.body).to.have.property('id')
                            .to.equal(origData.id);
                    });
            });

            it('should still create new record if there is duplicated node', function() {
                var origData = data[0];
                var newData = {
                    ipAddress: '172.31.188.99',
                    macAddress: '99:82:cd:76:89:12',
                    node: origData.node
                };
                sandbox.stub(waterline.lookups, 'findOne').resolves();
                sandbox.stub(waterline.lookups, 'create',
                    function(data) {
                        var result = _.cloneDeep(data);
                        result.id = '112233445566';
                        return Promise.resolve(result);
                    }
                );
                sandbox.spy(waterline.lookups, 'updateOneById');
                return helper.request().put('/api/1.1/lookups')
                    .send(newData)
                    .expect('Content-Type', /^application\/json/)
                    .expect(200)
                    .expect(function(data) {
                        expect(waterline.lookups.findOne).to.have.been.called;
                        expect(waterline.lookups.updateOneById).to.have.callCount(0);
                        expect(waterline.lookups.create).to.have.callCount(1)
                            .and.been.calledWith(newData);
                        expect(data.body).to.have.property('ipAddress')
                            .to.equal(newData.ipAddress);
                        expect(data.body).to.have.property('macAddress')
                            .to.equal(newData.macAddress);
                        expect(data.body).to.have.property('node')
                            .to.equal(newData.node);
                        expect(data.body).to.have.property('id')
                            .to.equal('112233445566');
                    });
            });
        });
    });

    describe('/api/1.1/lookups/:id', function () {
        describe('GET', function () {
            it('should call waterline.lookups.needOneById with 123', function() {
                sandbox.stub(waterline.lookups, 'needOneById').resolves(data[0]);

                return helper.request().get('/api/1.1/lookups/123')
                    .expect('Content-Type', /^application\/json/)
                    .expect(200)
                    .expect(function () {
                        expect(waterline.lookups.needOneById).to.have.been.calledWith('123');
                    });
            });
        });

        describe('PATCH', function () {
            it('should call waterline.lookups.updateOneById with 123', function() {
                sandbox.stub(waterline.lookups, 'updateOneById').resolves(data[0]);

                return helper.request().patch('/api/1.1/lookups/123')
                    .send(data[0])
                    .expect('Content-Type', /^application\/json/)
                    .expect(200)
                    .expect(function () {
                        expect(waterline.lookups.updateOneById).to.have.been.calledWith('123', sinon.match(data[0]));
                    });
            });
        });

        describe('DELETE', function () {
            it('should call waterline.lookups.destroyOneById with 123', function() {
                sandbox.stub(waterline.lookups, 'destroyOneById').resolves(data[0]);

                return helper.request().delete('/api/1.1/lookups/123')
                    .expect('Content-Type', /^application\/json/)
                    .expect(200)
                    .expect(function () {
                        expect(waterline.lookups.destroyOneById).to.have.been.calledWith('123');
                    });
            });
        });
    });
});

