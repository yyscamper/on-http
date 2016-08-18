// Copyright 2016, EMC, Inc.

'use strict';

var templateName = require('path').basename(__filename).replace('-spec.js', '');
describe(templateName, function() {
    var subject = 'data/views/' + templateName;
    var context = {
        id: 'testId',
        node: 'testNode',
        basepath: 'http://172.31.128.1:8080/api/2.0',
        source: 'foo',
        data: {
            k1: 123,
            k2: 'abc',
            k3: true,
            k4: ['x', 'y'],
            k5: {
                m1: 0,
                m2: 'test'
            }
        }
    };

    var expectResult = {
        id: 'testId',
        node: 'http://172.31.128.1:8080/api/2.0/nodes/testNode',
        source: 'foo',
        data: {
            k1: 123,
            k2: 'abc',
            k3: true,
            k4: ['x', 'y'],
            k5: {
                m1: 0,
                m2: 'test'
            }
        }
    };

    it('should succeed to render', function() {
        helper.startTemplateTest(subject)
            .render(context)
            .toJson()
            .tap(function(result) {
                expect(result).to.deep.equal(expectResult);
            });
    });

    it('should succeed to render if source is null', function() {
        var ctx = _.cloneDeep(context);
        var res = _.cloneDeep(expectResult);
        ctx.source = null;
        res.source = null;
        helper.startTemplateTest(subject)
            .render(ctx)
            .toJson()
            .tap(function(result) {
                expect(result).to.deep.equal(res);
            });
    });

    it('should succeed to render if data is null', function() {
        var ctx = _.cloneDeep(context);
        var res = _.cloneDeep(expectResult);
        ctx.data = null;
        res.data = null;
        helper.startTemplateTest(subject)
            .render(ctx)
            .toJson()
            .tap(function(result) {
                expect(result).to.deep.equal(res);
            });
    });

    ['source', 'data', 'id', 'node', 'basepath'].forEach(function(key) {
        it('should fail to render if "' + key + '" is missing', function() {
            var ctx = _.cloneDeep(context);
            delete ctx[key];
            helper.startTemplateTest(subject)
                .render(ctx)
                .expectFailure();
        });
    });
});
