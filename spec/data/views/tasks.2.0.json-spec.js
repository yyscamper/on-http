// Copyright 2016, EMC, Inc.

'use strict';

var templateName = require('path').basename(__filename).replace('-spec.js', '');
describe(templateName, function() {
    var subject = 'data/views/' + templateName;
    var context = {
        identifier: 'testId',
        exit: "100",
        tasks: {
            injectableName: 'foo',
            options: {
                a: 1,
                b: 2
            }
        }
    };

    var expectResult = _.cloneDeep(context);

    it('should succeed to render', function() {
        helper.startTemplateTest(subject)
            .render(context)
            .expectJson(expectResult);
    });

    it('should succeed to render if "exit" is missing', function() {
        var ctx = _.cloneDeep(context);
        var res = _.cloneDeep(expectResult);
        delete ctx.exit;
        delete res.exit;
        helper.startTemplateTest(subject)
            .render(ctx)
            .expectJson(res);
    });

    ['identifier', 'tasks'].forEach(function(key) {
        it('should fail if ' + JSON.stringify(key) + ' is missing', function() {
            var ctx = _.cloneDeep(context);
            delete ctx[key];
            helper.startTemplateTest(subject)
                .render(ctx)
                .expectFailure();
        });
    });
});
