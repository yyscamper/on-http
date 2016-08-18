// Copyright 2016, EMC, Inc.

'use strict';

var templateName = require('path').basename(__filename).replace('-spec.js', '');
describe(templateName, function() {
    var subject = 'data/views/' + templateName;

    it('should succeed to render', function() {
        helper.startTemplateTest(subject)
            .render( { collection: [1, 2, 3] })
            .expectJson([1, 2, 3]);
    });

    it('should succeed if collection is empty', function() {
        helper.startTemplateTest(subject)
            .render( { collection: [] })
            .expectJson([]);
    });

    it('should fail if collection is missing', function() {
        helper.startTemplateTest(subject)
            .render({})
            .expectFailure();
    });
});
