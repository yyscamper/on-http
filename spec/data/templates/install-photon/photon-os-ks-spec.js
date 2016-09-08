// Copyright 2016, EMC, Inc.

'use strict';

describe('photon-os-ks', function() {
    var fs = require('fs');
    var jsonlint = require('jsonlint');
    var path = require('path');

    var subject = 'data/templates/install-photon/photon-os-ks';
    var context = jsonlint.parse(
        fs.readFileSync(
            path.resolve(__dirname, '../../samples/os-common-options.json')
        ).toString()
    );
    context = _.defaults({
        installType: "full"
    }, context);

    it('should succeed to render', function() {
        helper.startTemplateTest(subject)
            .render(context)
            .expectFormat('json');
    });

    ['hostname', 'installPartitions'].forEach(function(key) {
        var cloneContext = _.cloneDeep(context);
        delete cloneContext[key];
        it('should still succeed to render if missing "' + key + '"', function() {
            helper.startTemplateTest(subject)
                .render(cloneContext)
                .expectFormat('json');
        });
    });
});
