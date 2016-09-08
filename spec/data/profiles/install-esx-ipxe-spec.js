// Copyright 2016, EMC, Inc.

'use strict';

var jsonlint = require('jsonlint');
var fs = require('fs');
var path = require('path');

describe('install-esx.ipxe', function() {
    var subject = 'data/profiles/install-esx.ipxe';
    var context = jsonlint.parse(
        fs.readFileSync(path.resolve(__dirname, '../samples/os-common-options.json')).toString()
    );
    context = _.defaults({
        mbootFile: 'http://172.31.128.1:9080/esxi/6.0/mboot.c32',
        esxBootConfigTemplateUri: 'http://172.31.128.1:9080/api/current/templates/esx-boot-cfg'
    }, context);

    it('should succeed to render', function() {
        helper.startTemplateTest(subject)
            .render(context)
            .expectSuccess();
    });
});
