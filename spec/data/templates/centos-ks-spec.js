// Copyright 2016, EMC, Inc.

'use strict';

var fs = require('fs');
var path = require('path');
var jsonlint = require('jsonlint');

describe('centos-ks', function() {
    var subject = 'data/templates/centos-ks';
    var context = jsonlint.parse(
        fs.readFileSync(path.resolve(__dirname, '../samples/os-common-options.json')).toString()
    );

    it('should succeed to render', function() {
        helper.startTemplateTest(subject)
            .render(context)
            .expectSuccess();
    });

    ['users', 'networkDevices', 'kvm', 'installPartitions', 'rootSshKey',
            'dnsServers'].forEach(function(key) {
        var cloneContext = _.cloneDeep(context);
        delete cloneContext[key];
        it('should still succeed to render if missing "' + key + '"', function() {
            helper.startTemplateTest(subject)
                .render(cloneContext)
                .expectSuccess();
        });
    });
});
