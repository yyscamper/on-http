// Copyright 2016, EMC, Inc.

'use strict';

var templateName = require('path').basename(__filename).replace('-spec.js', '');
describe(templateName, function() {
    var subject = 'data/views/' + templateName;
    var context = {
        "config": {
            "command": "sdr"
        },
        "failureCount": 43,
        "id": "57ad36dad3b468eb1b70af9c",
        "lastFinished": "2016-08-18T16:20:09.787Z",
        "lastStarted": "2016-08-18T16:20:09.374Z",
        "node": "57ad3694edc56b041c69a6e5",
        "paused": false,
        "pollInterval": 60000,
        "name": "Pollers.IPMI",
        "basepath": "/api/2.0",

        "Constants": {
            "WorkItems": {
                "Pollers": {
                    "IPMI": "Pollers.IPMI"
                }
            }
        },
        _: _
    };

    var expectResult = {
        "config": {
            "command": "sdr"
        },
        "failureCount": 43,
        "id": "57ad36dad3b468eb1b70af9c",
        "lastFinished": "2016-08-18T16:20:09.787Z",
        "lastStarted": "2016-08-18T16:20:09.374Z",
        "node": "/api/2.0/nodes/57ad3694edc56b041c69a6e5",
        "paused": false,
        "pollInterval": 60000,
        "type": "ipmi"
    };

    it('should succeed to render', function() {
        helper.startTemplateTest(subject)
            .render(context)
            .expectJson(expectResult);
    });

    ['node', 'lastStarted', 'lastFinished'].forEach(function(key) {
        it('should success if ' + JSON.stringify(key) + ' is null', function() {
            var ctx = _.cloneDeep(context);
            var res = _.cloneDeep(expectResult);
            ctx[key] = null;
            res[key] = null;
            helper.startTemplateTest(subject)
                .render(ctx)
                .expectJson(res);
        });
    });
});
