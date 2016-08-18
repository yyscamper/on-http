// Copyright 2016, EMC, Inc.

'use strict';

describe('diskboot.ipxe', function() {
    var subject = 'data/profiles/diskboot.ipxe';
    var context = {};

    it('should succeed to render', function() {
        helper.startTemplateTest(subject)
            .render(context)
            .expect('echo Diskboot');
    });
});


