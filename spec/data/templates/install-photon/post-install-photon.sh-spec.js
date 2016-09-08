// Copyright 2016, EMC, Inc.

'use strict';

describe('post-install-photon.sh', function() {
    var fs = require('fs');
    var jsonlint = require('jsonlint');
    var path = require('path');

    var subject = 'data/templates/install-photon/post-install-photon.sh';
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
            .expectSuccess();
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
