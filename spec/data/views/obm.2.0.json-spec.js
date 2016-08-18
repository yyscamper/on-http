// Copyright 2016, EMC, Inc.

'use strict';

var templateName = require('path').basename(__filename).replace('-spec.js', '');
describe(templateName, function() {
    var subject = 'data/views/' + templateName;
    var context = {
        id: 'testObmId',
        basepath: 'http://172.31.128.1:8080/api/2.0',
        node: 'testNodeId',
        service: 'ipmi-obm-service',
        config: {
            key1: 'any',
            key2: 'anyOther'
        }
    };

    var expectResult = {
        id: 'testObmId',
        node: 'http://172.31.128.1:8080/api/2.0/nodes/testNodeId',
        service: 'ipmi-obm-service',
        config: {
            key1: 'any',
            key2: 'anyOther'
        }
    };

    var ctx, res;

    beforeEach(function() {
        ctx = _.cloneDeep(context);
        res = _.cloneDeep(expectResult);
    });


    it('should succeed to render', function() {
        helper.startTemplateTest(subject)
            .render(ctx)
            .expectJson(res);
    });

    it('should succeed to render if "node" is null', function() {
        ctx.node = null;
        delete res.node;
        helper.startTemplateTest(subject)
            .render(ctx)
            .expectJson(res);
    });

    it('should succeed to render if "node" is missing', function() {
        delete ctx.node;
        delete res.node;
        helper.startTemplateTest(subject)
            .render(ctx)
            .expectJson(res);
    });

    ['service', 'config', 'id', 'basepath'].forEach(function(key) {
        it('should fail to render if "' + key + '" is missing', function() {
            delete ctx[key];
            helper.startTemplateTest(subject)
                .render(ctx)
                .expectFailure();
        });
    });
});
