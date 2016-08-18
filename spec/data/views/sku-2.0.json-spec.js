// Copyright 2016, EMC, Inc.

'use strict';

var templateName = require('path').basename(__filename).replace('-spec.js', '');
describe(templateName, function() {
    var subject = 'data/views/' + templateName;
    var context = {
        name: 'Test Server',
        id: 'testId',
        httpStaticRoot: 'http/static',
        httpTemplateRoot: 'http/templates',
        workflowRoot: 'workflows/graphs',
        taskRoot: 'workflows/tasks',
        httpProfileRoot: 'http/profiles',
        skuConfig: {
            k1: 'one',
            k2: {
                m1: 'two'
            },
            k3: ['three', 'four']
        },
        discoveryGraphName: 'Graph.Test',
        discoveryGraphOptions: {
            o1: 'a',
            o2: 1,
            o3: {
                p1: 'b',
                p2: 'c'
            }
        },
        rules: [
            {
                path: 'a.b.c',
                contains: 'foo'
            },
            {
                path: 'x.y',
                contains: 'bar'
            }
        ]
    };

    var expectResult = _.cloneDeep(context);

    it('should succeed to render', function() {
        helper.startTemplateTest(subject)
            .render(context)
            .toJson()
            .tap(function(result) {
                expect(result).to.deep.equal(expectResult);
            });
    });

    ['name', 'id', 'rules'].forEach(function(key) {
        it('should fail to render if "' + key + '" is missing', function() {
            var ctx = _.cloneDeep(context);
            delete ctx[key];
            helper.startTemplateTest(subject)
                .render(ctx)
                .expectFailure();
        });
    });

    ['httpStaticRoot', 'httpTemplateRoot', 'taskRoot', 'workflowRoot', 'httpProfileRoot',
        'skuConfig', 'discoveryGraph', 'discoveryGraphOptions'].forEach(function(key) {
        it('should succeed to render if "' + key + '" is missing', function() {
            var ctx = _.cloneDeep(context);
            var res = _.cloneDeep(expectResult);
            delete ctx[key];
            delete res[key];
            helper.startTemplateTest(subject)
                .render(ctx)
                .expectJson(res);
        });
    });

});
