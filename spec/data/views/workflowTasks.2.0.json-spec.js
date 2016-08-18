// Copyright 2016, EMC, Inc.

'use strict';

var templateName = require('path').basename(__filename).replace('-spec.js', '');
describe(templateName, function() {
    var subject = 'data/views/' + templateName;
    var context = {
        friendlyName: 'test graph',
        injectableName: 'Graph.test',
        implementsTask: 'Task.test',
        schemaRef: 'test-schema.json',
        options: {
            foo: "bar"
        },
        properties: {
            hello: "world"
        }
    };

    var expectResult = _.cloneDeep(context);

    it('should succeed to render', function() {
        helper.startTemplateTest(subject)
            .render(context)
            .expectJson(expectResult);
    });

    ['options', 'properties'].forEach(function(key) {
        it('should success if ' + JSON.stringify(key) + ' is missing', function() {
            var ctx = _.cloneDeep(context);
            var res = _.cloneDeep(expectResult);
            delete ctx[key];
            res[key] = {};
            helper.startTemplateTest(subject)
                .render(ctx)
                .expectJson(res);
        });
    });

    ['friendlyName', 'injectableName', 'schemaRef', 'implementsTask'].forEach(function(key) {
        it('should success if ' + JSON.stringify(key) + ' is missing', function() {
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
