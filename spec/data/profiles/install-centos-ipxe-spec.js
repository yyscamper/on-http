// Copyright 2016, EMC, Inc.

'use strict';

var jsonlint = require('jsonlint');
var fs = require('fs');
var path = require('path');

describe('install-centos.ipxe', function() {
    var subject = 'data/profiles/install-centos.ipxe';
    var context = jsonlint.parse(
        fs.readFileSync(path.resolve(__dirname, '../samples/os-common-options.json')).toString()
    );

    it('should succeed to render', function() {
        helper.startTemplateTest(subject)
            .render(context)
            .expectSuccess();
    });
});
