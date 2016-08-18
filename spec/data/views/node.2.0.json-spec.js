// Copyright 2016, EMC, Inc.

'use strict';

var templateName = require('path').basename(__filename).replace('-spec.js', '');
describe(templateName, function() {
    var subject = 'data/views/' + templateName;
    var context = {
        autoDiscover: true,
        id: 'testNodeId',
        identifiers: [
            '11:22:33:44:55:66',
            'aa:bb:cc:dd:ee:ff'
        ],
        basepath: 'http://172.31.128.1:9080/api/2.0',
        name: 'Node for testing',
        obms: [
            {
                service: 'ipmi-obm-service',
                id: 'obmId1'
            },
            {
                service: 'noop-obm-service',
                id: 'obmId2'
            }
        ],
        relations: [
            {
                relationType: 'enclosuredBy',
                info: 'relation information',
                targets: [ 't1', 't2']
            }
        ],
        sku: 'testSkuId',
        type: 'compute'
    };

    var expectResult = {
        //jshint ignore:start
        autoDiscover: "true",
        catalogs: 'http://172.31.128.1:9080/api/2.0/nodes/testNodeId/catalogs',
        id: 'testNodeId',
        identifiers: [
            '11:22:33:44:55:66',
            'aa:bb:cc:dd:ee:ff'
        ],
        name: 'Node for testing',
        relations: [],
        obms: [
            {
                service: 'ipmi-obm-service',
                ref: 'http://172.31.128.1:9080/api/2.0/obms/obmId1'
            },
            {
                service: 'noop-obm-service',
                ref: 'http://172.31.128.1:9080/api/2.0/obms/obmId2'
            }
        ],
        relations: [
            {
                relationType: 'enclosuredBy',
                info: 'relation information',
                targets: ['t1', 't2']
            }
        ],
        tags: 'http://172.31.128.1:9080/api/2.0/nodes/testNodeId/tags',
        pollers: 'http://172.31.128.1:9080/api/2.0/nodes/testNodeId/pollers',
        sku: 'http://172.31.128.1:9080/api/2.0/skus/testSkuId',
        type: 'compute',
        workflows: 'http://172.31.128.1:9080/api/2.0/nodes/testNodeId/workflows'
        //jshint ignore:end
    };

    it('should succeed to render', function() {
        helper.startTemplateTest(subject)
            .render(context)
            .toJson()
            .tap(function(result) {
                expect(result).to.deep.equal(expectResult);
            });
    });

    it('should succeed to render if obm is empty', function() {
        var ctx = _.cloneDeep(context);
        var res = _.cloneDeep(expectResult);
        ctx.obms = [];
        res.obms = [];
        helper.startTemplateTest(subject)
            .render(ctx)
            .toJson()
            .tap(function(result) {
                expect(result).to.deep.equal(res);
            });
    });

    it('should succeed to render if relation is empty', function() {
        var ctx = _.cloneDeep(context);
        var res = _.cloneDeep(expectResult);
        ctx.relations = [];
        res.relations = [];
        helper.startTemplateTest(subject)
            .render(ctx)
            .toJson()
            .tap(function(result) {
                expect(result).to.deep.equal(res);
            });
    });

    it('should succeed to render if identifiers is empty', function() {
        var ctx = _.cloneDeep(context);
        var res = _.cloneDeep(expectResult);
        ctx.identifiers = [];
        res.identifiers = [];
        helper.startTemplateTest(subject)
            .render(ctx)
            .toJson()
            .tap(function(result) {
                expect(result).to.deep.equal(res);
            });
    });

    it('should generate empty identifers if identifiers is not specified', function() {
        var ctx = _.cloneDeep(context);
        var res = _.cloneDeep(expectResult);
        delete ctx.identifiers;
        res.identifiers = [];
        helper.startTemplateTest(subject)
            .render(ctx)
            .toJson()
            .tap(function(result) {
                expect(result).to.deep.equal(res);
            });
    });

    it('should succeed to render if sku is null', function() {
        var ctx = _.cloneDeep(context);
        var res = _.cloneDeep(expectResult);
        ctx.sku = null;
        res.sku = null;
        helper.startTemplateTest(subject)
            .render(ctx)
            .toJson()
            .tap(function(result) {
                expect(result).to.deep.equal(res);
            });
    });

    it('should succeed to render if sku is missing', function() {
        var ctx = _.cloneDeep(context);
        var res = _.cloneDeep(expectResult);
        delete ctx.sku;
        delete res.sku;
        helper.startTemplateTest(subject)
            .render(ctx)
            .toJson()
            .tap(function(result) {
                expect(result).to.deep.equal(res);
            });
    });
});
