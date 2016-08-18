// Copyright 2016, EMC, Inc.

'use strict';

describe('install-esx.ipxe', function() {
    var subject = 'data/profiles/install-esx.ipxe';
    var context = {
        repo: 'http://172.31.128.1:9080/esxi/6.0',
        mbootFile: 'http://172.31.128.1:9080/esxi/6.0/mboot.c32',
        esxBootConfigTemplateUri: 'http://172.31.128.1:9080/api/current/templates/esx-boot-cfg'
    };

    it('should succeed to render', function() {
        helper.startTemplateTest(subject)
            .render(context)
            .expectFile('spec/data/profiles/samples/install-esx-sample.ipxe');
    });

    ['repo', 'mbootFile', 'esxBootConfigTemplateUri'].forEach(function(key) {
        it('should fail to render if missing "' + key + '"', function() {
            var cloneContext = _.cloneDeep(context);
            delete cloneContext[key];
            helper.startTemplateTest(subject)
                .render(cloneContext)
                .expectFailure();
        });
    });
});
