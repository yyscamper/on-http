// Copyright 2015, EMC, Inc.

'use strict';

require('on-core/spec/helper');

var util = require('util');

var index = require('../index');

global.onHttpContext = index.onHttpContextFactory();

// Legacy
global.dihelper = onHttpContext.helper;

helper.startServer = function (overrides, endpointOpt) {
    overrides = (overrides || []).concat([
        onHttpContext.helper.simpleWrapper({
            publishLog: sinon.stub().resolves()
        }, 'Protocol.Logging'),
        onHttpContext.helper.simpleWrapper({
            lookupIpLease: sinon.stub().resolves('00:00:00:00:00:00')
        }, 'Protocol.Dhcp')
    ]);

    helper.setupInjector(_.flattenDeep([
        onHttpContext.prerequisiteInjectables,
        onHttpContext.injectables,
        overrides
    ]));

    helper.setupTestConfig();

    helper.injector.get('Services.Configuration')
        .set('enableUPnP', false)
        .set('skuPackRoot', 'spec/lib/services/sku-static')
        .set('httpEndpoints', [ _.merge( {}, 
            {
                'port': 8089,
                'httpsEnabled': false
            },
            endpointOpt )
        ]);

    index.injector = helper.injector;

    return helper.injector.get('app').start();
};

helper.stopServer = function () {
    return helper.injector.get('app').stop();
};

helper.request = function (url, options) {
    var agent = request(url || 'http://localhost:8089', options);

    // monkeypatch supertest objects to have a "then" function so they can be used as promises
    _.methods(agent).forEach(function (method) {
        var orig = agent[method];
        agent[method] = function () {
            var test = orig.apply(agent, arguments);

            test.then = function (successCallback, errorCallback) {
                var deferred = new Promise(function (resolve, reject) {
                    test.end(function(err, res) {
                        if (err) {
                            // if a status check fails, supertest will pass the res object as well.
                            // so, append some extra verbosity to the error for the report.
                            if (res) {
                                var output = res.body || res.text;
                                err.message +=
                                '\nResponse body:\n'+
                                util.inspect(output) +
                                '\n' + err.stack;
                            }
                            reject(err);
                            return;
                        } else {
                            resolve(res);
                        }
                    });
                });

                return deferred.then(successCallback, errorCallback);
            };
            return test;
        };
    });

    return agent;
};

helper.startTemplateTest = function (subject) {
    var TemplateUnitTestHelper = require('./template-ut-helper.js');
    var templateHelper = new TemplateUnitTestHelper();
    templateHelper.setWorkingDir(process.cwd());
    if (subject) {
        templateHelper.setTemplateFile(subject);
    }
    var baseUrl = 'http://127.31.128.1:9080/api/current';
    templateHelper.setCommonContext({
        server: '172.31.128.1',
        port: 9080,
        ipaddress: '172.31.128.8',
        netmask: '255.255.255.0',
        gateway: '10.1.1.1',
        macaddress: '11:22:33:44:55:66',
        sku: {},
        env: {},
        api: {
            server: 'http://172.31.128.1:9080',
            base: baseUrl,
            templates: baseUrl + '/templates',
            profiles: baseUrl + '/profiles',
            lookups: baseUrl + '/lookups',
            files: baseUrl + '/files',
            nodes: baseUrl + '/nodes'
        },
        context: {},
        nodeId: 'testNode'
    });
    return templateHelper;
};
