// Copyright 2016, EMC, Inc.

'use strict';

var templateName = require('path').basename(__filename).replace('-spec.js', '');
describe(templateName, function() {
    var subject = 'data/views/' + templateName;
    var context = {
        message: 'test error message',
        status: '404',
        uuid: '123456',
        stack: [ 'first', 'second', 'third' ]
    };

    var expectResult = {
        message: 'test error message',
        status: '404',
        UUID: '123456',
        stack: [ 'first', 'second', 'third' ]
    };

    it('should succeed to render', function() {
        helper.startTemplateTest(subject)
            .render(context)
            .expectJson(expectResult);
    });

    it('should succeed if "stack" is missing', function() {
        var ctx = _.cloneDeep(context);
        var res = _.cloneDeep(expectResult);
        delete ctx.stack;
        delete res.stack;
        helper.startTemplateTest(subject)
            .render(ctx)
            .expectJson(res);
    });

    ['message', 'status'].forEach(function(key) {
        it('should fail if ' + JSON.stringify(key) + ' is missing', function() {
            var ctx = _.cloneDeep(context);
            delete ctx[key];
            helper.startTemplateTest(subject)
                .render(ctx)
                .expectFailure();
        });
    });
});
