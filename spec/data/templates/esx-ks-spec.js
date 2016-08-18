// Copyright 2016, EMC, Inc.

'use strict';

describe('esx-ks', function() {
    var path = require('path');
    var fs = require('fs');
    var jsonlint = require('jsonlint');

    var subject = 'data/templates/esx-ks';
    var context = jsonlint.parse(
        fs.readFileSync(
            path.resolve(__dirname, './samples/install_esx_render_context_full.json')
        ).toString()
    );

    it('should succeed to render', function() {
        helper.startTemplateTest(subject)
            .setIgnoreWhiteSpaces()
            .render(context)
            .expectFile('spec/data/templates/samples/esx-ks-full-sample.txt');
    });

    ['version', 'rootPlainPassword', 'installDisk', 'rackhdCallbackScript',
            'rackhdCallbackScript'].forEach(function(key) {
        var cloneContext = _.cloneDeep(context);
        delete cloneContext[key];
        it('should fail to render if missing "' + key + '"', function() {
            helper.startTemplateTest(subject)
                .render(cloneContext)
                .expectFailure();
        });
    });

    ['users', 'networkDevices', 'kvm', 'rootSshKey', 'ntpServers', 'postInstallCommands',
            'hostname', 'domain', 'dnsServers', 'switchDevices'].forEach(function(key) {
        var cloneContext = _.cloneDeep(context);
        delete cloneContext[key];
        it('should still succeed to render if missing "' + key + '"', function() {
            helper.startTemplateTest(subject)
                .render(cloneContext)
                .expectSuccess();
        });
    });
});
