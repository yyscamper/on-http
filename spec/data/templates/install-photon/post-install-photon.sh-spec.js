// Copyright 2016, EMC, Inc.

'use strict';

describe('post-install-photon.sh', function() {
    var fs = require('fs');
    var jsonlint = require('jsonlint');
    var path = require('path');

    var subject = 'data/templates/install-photon/post-install-photon.sh';
    var context = jsonlint.parse(
        fs.readFileSync(
            path.resolve(__dirname, '../samples/install_photon_os_render_context_full.json')
        ).toString()
    );

    it('should succeed to render', function() {
        helper.startTemplateTest(subject)
            .setIgnoreWhiteSpaces()
            .render(context)
            .expectFile('spec/data/templates/samples/post-install-photon.sh-sample.txt');
    });

    ['networkDevices', 'dnsServers', 'users', 'domain'].forEach(function(key) {
        var cloneContext = _.cloneDeep(context);
        delete cloneContext[key];
        it('should still succeed to render if missing "' + key + '"', function() {
            helper.startTemplateTest(subject)
                .render(cloneContext)
                .expectSuccess();
        });
    });
});
