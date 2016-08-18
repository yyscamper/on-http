// Copyright 2016, EMC, Inc.

'use strict';

describe('boot-livecd.ipxe', function() {
    var subject = 'data/profiles/boot-livecd.ipxe';
    var context = {
        repo: 'http://172.31.128.1:9080/ubuntu-livecd',
        version: 'ubuntu-livecd-trusty'
    };

    it('should succeed to render', function() {
        helper.startTemplateTest(subject)
            .render(context)
            .expectFile('spec/data/profiles/samples/boot-livecd-sample.ipxe');
    });

    ['repo', 'version'].forEach(function(key) {
        it('should fail to render if missing "' + key + '"', function() {
            var cloneContext = _.cloneDeep(context);
            delete cloneContext[key];
            helper.startTemplateTest(subject)
                .render(cloneContext)
                .expectFailure();
        });
    });
});


