// Copyright 2016, EMC, Inc.

'use strict';

var fs = require('fs');
var path = require('path');
var jsonlint = require('jsonlint');

describe('esx-ks', function() {
    var subject = 'data/templates/esx-ks';
    var context = jsonlint.parse(
        fs.readFileSync(path.resolve(__dirname, '../samples/os-common-options.json')).toString()
    );
    context = _.defaults({
        esxBootConfigTemplateUri: 'esx-boot-cfg',
        postInstallCommands: ['cmd1', 'cmd2'],
        switchDevices: [
            {
                'switchName': 'vSwitch0',
                'uplinks': ['vmnic3', 'vmnic4']
            },
            {
                'switchName': 'vSwitch1',
                'uplinks': ['vmnic0', '3c:62:1c:ad:d6:ab']
            }
        ]
    }, context);

    it('should succeed to render', function() {
        helper.startTemplateTest(subject)
            .render(context)
            .expectSuccess();
    });

    ['users', 'networkDevices', 'kvm', 'rootSshKey', 'ntpServers', 'postInstallCommands',
            'hostname', 'domain', 'dnsServers', 'switchDevices'].forEach(function(key) {
        var cloneContext = _.cloneDeep(context);
        delete cloneContext[key];
        it('should still succeed to render if missing ' + key, function() {
            helper.startTemplateTest(subject)
                .render(cloneContext)
                .expectSuccess();
        });
    });
});
