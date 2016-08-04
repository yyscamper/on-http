// Copyright 2015, EMC, Inc.
/* jshint node:true */

'use strict';

describe('Http.Api.Workflows', function () {
    var waterline;
    var workflowApiService;
    var arpCache = { 
        getCurrent: sinon.stub().resolves([])
    };

    before('start HTTP server', function () {
        var self = this;
        this.timeout(5000);

        waterline = {
            start: sinon.stub(),
            stop: sinon.stub(),
            lookups: {
                setIndexes: sinon.stub()
            }
        };
        this.sandbox = sinon.sandbox.create();

        return helper.startServer([
            dihelper.simpleWrapper(waterline, 'Services.Waterline'),
            dihelper.simpleWrapper(arpCache, 'ARPCache')
        ])
        .then(function() {
            workflowApiService = helper.injector.get('Http.Services.Api.Workflows');
            self.sandbox.stub(workflowApiService, 'defineTask').resolves();
            self.sandbox.stub(workflowApiService, 'defineTaskGraph').resolves();
            self.sandbox.stub(workflowApiService, 'getGraphDefinitions').resolves();
            self.sandbox.stub(workflowApiService, 'getTaskDefinitions').resolves();
        });
    });

    after('stop HTTP server', function () {
        return helper.stopServer();
    });

    beforeEach('set up mocks', function () {
        waterline.nodes = {
            findByIdentifier: sinon.stub().resolves()
        };
        waterline.graphobjects = {
            find: sinon.stub().resolves([]),
            findByIdentifier: sinon.stub().resolves(),
            needOne: sinon.stub().resolves()
        };
        waterline.lookups = {
            // This method is for lookups only and it
            // doesn't impact behavior whether it is a
            // resolve or a reject since it's related
            // to logging.
            findOneByTerm: sinon.stub().rejects()
        };
    });

    afterEach('clean up mocks', function () {
        this.sandbox.reset();
    });

    describe('GET /workflows', function () {
        it('should return a list of persisted graph objects', function () {
            var graph = { name: 'foobar' };
            waterline.graphobjects.find.resolves([graph]);

            return helper.request().get('/api/1.1/workflows')
            .expect('Content-Type', /^application\/json/)
            .expect(200, [graph]);
        });
    });

    describe('GET /workflows/:id', function () {
        it('should return a single persisted graph', function () {
            var graph = { name: 'foobar' };
            waterline.graphobjects.needOne.resolves(graph);

            return helper.request().get('/api/1.1/workflows/12345')
            .expect('Content-Type', /^application\/json/)
            .expect(200, graph)
            .expect(function () {
                expect(waterline.graphobjects.needOne).to.have.been.calledOnce;
                expect(waterline.graphobjects.needOne)
                    .to.have.been.calledWith({ instanceId: '12345' });
            });
        });

        it('should return a 404 if not found', function () {
            var Errors = helper.injector.get('Errors');
            waterline.graphobjects.needOne.rejects(new Errors.NotFoundError('test'));

            return helper.request().get('/api/1.1/workflows/12345')
            .expect('Content-Type', /^application\/json/)
            .expect(404);
        });
    });

    describe('PUT /workflows', function () {
        it('should persist a task graph', function () {
            var graph = { name: 'foobar' };
            workflowApiService.defineTaskGraph.resolves(graph);

            return helper.request().put('/api/1.1/workflows')
            .send(graph)
            .expect('Content-Type', /^application\/json/)
            .expect(200, graph);
        });
    });

    describe('PUT /workflows/tasks', function () {
        it('should persist a task', function () {
            var task = { injectableName: 'foobar' };
            workflowApiService.defineTask.resolves(task);

            return helper.request().put('/api/1.1/workflows/tasks')
            .send(task)
            .expect('Content-Type', /^application\/json/)
            .expect(200, task);
        });
    });

    describe('GET /workflows/tasks/library', function () {
        it('should retrieve the task library', function () {
            var task = { injectableName: 'foobar' };
            workflowApiService.getTaskDefinitions.resolves([task]);

            return helper.request().get('/api/1.1/workflows/tasks/library')
            .expect('Content-Type', /^application\/json/)
            .expect(200, [task]);
        });
    });

    describe('GET /workflows/tasks/library/:id', function () {
        it('should retrieve a task from the task library', function () {
            var task = { injectableName: 'foobar' };
            workflowApiService.getTaskDefinitions.withArgs('foobar').resolves([task]);

            return helper.request().get('/api/1.1/workflows/tasks/library/foobar')
            .expect('Content-Type', /^application\/json/)
            .expect(200, task)
            .expect(function () {
                expect(workflowApiService.getTaskDefinitions).to.have.been.calledOnce;
                expect(workflowApiService.getTaskDefinitions).to.have.been.calledWith('foobar');
            });
        });

        it('should get NotFoundError if task definition is not existing', function () {
            workflowApiService.getTaskDefinitions.withArgs('foobar').resolves([]);

            return helper.request().get('/api/1.1/workflows/tasks/library/foobar')
            .expect('Content-Type', /^application\/json/)
            .expect(404)
            .expect(function () {
                expect(workflowApiService.getTaskDefinitions).to.have.been.calledOnce;
                expect(workflowApiService.getTaskDefinitions).to.have.been.calledWith('foobar');
            });
        });
    });

    describe('GET /workflows/library', function () {
        it('should retrieve the graph library', function () {
            var graph1 = { injectableName: 'foo' };
            var graph2 = { injectableName: 'bar' };
            workflowApiService.getGraphDefinitions.resolves([graph1, graph2]);

            return helper.request().get('/api/1.1/workflows/library')
            .expect('Content-Type', /^application\/json/)
            .expect(200, [graph1, graph2]);
        });
    });

    describe('GET /workflows/library/:id', function () {
        it('should retrieve a graph from the graph library', function () {
            var graph = { injectableName: 'foobar' };
            workflowApiService.getGraphDefinitions.withArgs('foobar').resolves([graph]);

            return helper.request().get('/api/1.1/workflows/library/foobar')
            .expect('Content-Type', /^application\/json/)
            .expect(200, graph)
            .expect(function () {
                expect(workflowApiService.getGraphDefinitions).to.have.been.calledOnce;
                expect(workflowApiService.getGraphDefinitions).to.have.been.calledWith('foobar');
            });
        });

        it('should return 404 if graph definition is not existing', function () {
            var graph = { injectableName: 'foobar' };
            workflowApiService.getGraphDefinitions.withArgs('foobar').resolves([]);

            return helper.request().get('/api/1.1/workflows/library/foobar')
            .expect('Content-Type', /^application\/json/)
            .expect(404)
            .expect(function () {
                expect(workflowApiService.getGraphDefinitions).to.have.been.calledOnce;
                expect(workflowApiService.getGraphDefinitions).to.have.been.calledWith('foobar');
            });
        });
    });
});
