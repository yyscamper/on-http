// Copyright 2016, EMC, Inc.

'use strict';

describe('install-centos.ipxe', function() {
    var subject = 'data/profiles/install-centos.ipxe';
    var context = {
        repo: 'http://172.31.128.1:9080/centos/7.0/os/x86_64',
        version: '7.0',
        installScriptUri: 'http://172.31.128.1:9080/api/current/templates/centos-ks',
        hostname: 'rackhd-test',
        comport: 'com1'
    };

    it('should succeed to render', function() {
        helper.startTemplateTest(subject)
            .render(context)
            .expectFile('spec/data/profiles/samples/install-centos-sample.ipxe');
    });

    ['repo', 'version', 'installScriptUri', 'hostname', 'comport'].forEach(function(key) {
        it('should fail to render if missing "' + key + '"', function() {
            var cloneContext = _.cloneDeep(context);
            delete cloneContext[key];
            helper.startTemplateTest(subject)
                .render(cloneContext)
                .expectFailure();
        });
    });
});
