// Copyright 2016, EMC, Inc.

'use strict';

describe('photon-os-ks', function() {
    var fs = require('fs');
    var jsonlint = require('jsonlint');
    var path = require('path');

    var subject = 'data/templates/install-photon/photon-os-ks';
    var context = jsonlint.parse(
        fs.readFileSync(
            path.resolve(__dirname, '../samples/install_photon_os_render_context_full.json')
        ).toString()
    );

    it('should succeed to render', function() {
        helper.startTemplateTest(subject)
            .render(context)
            .expectJsonFile('spec/data/templates/samples/photon-os-ks-full-sample.json');
    });

    ['installType', 'rootPassword', 'installDisk', 'server', 'port',
            'rackhdCallbackScript'].forEach(function(key) {
        var cloneContext = _.cloneDeep(context);
        delete cloneContext[key];
        it('should fail to render if missing "' + key + '"', function() {
            helper.startTemplateTest(subject)
                .render(cloneContext)
                .expectFailure();
        });
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
