// Copyright 2016, EMC, Inc.

'use strict';

var templateName = require('path').basename(__filename).replace('-spec.js', '');
describe(templateName, function() {
    var subject = 'data/views/' + templateName;
    var context = {
        basename: 'testName',
        uuid: '11-22-33-aa-bb',
        md5: '112233',
        sha256: '33445566'
    };

    var expectResult = {
        name: 'testName',
        uuid: '11-22-33-aa-bb',
        md5: '112233',
        sha256: '33445566'
    };

    it('should succeed to render', function() {
        helper.startTemplateTest(subject)
            .render(context)
            .expectJson(expectResult);
    });

    ['basename', 'uuid', 'md5', 'sha256'].forEach(function(key) {
        it('should fail if ' + JSON.stringify(key) + ' is missing', function() {
            var ctx = _.cloneDeep(context);
            delete ctx[key];
            helper.startTemplateTest(subject)
                .render(ctx)
                .expectFailure();
        });
    });
});
