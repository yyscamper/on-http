// Copyright 2016, EMC, Inc.

'use strict';

describe('centos-ks', function() {
    var subject = 'data/templates/centos-ks';
    var context = {
        //jshint ignore: start
        "version": "7",
        "repo": "http://172.31.128.1:9080/centos/7/os/x86_64",
        "rootPassword": "RackHDRocks!",
        "rootEncryptedPassword": "****Root***",
        "hostname": "rackhd-node",
        "domain": "example.com",
        "users": [
            {
                "name": "rackhd1",
                "password": "123456",
                "encryptedPassword": "******rackhd1*****",
                "uid": 1010,
                "sshKey": "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDJQ631/sw3D40h/6JfA+PFVy5Ofz6eu7caxbv0zdw4fTJsrFcOliHZTEtAvqx7Oa8gqSC6d7v61M0croQxtt1DGUcH2G4yhfdZOlK4pr5McwtX0T/APACdAr1HtP7Bt7u43mgHpUG4bHGc+NoY7cWCISkxl4apkYWbvcoJy/5bQn0uRgLuHUNXxK/XuLT5vG76xxY+1xRa5+OIoJ6l78nglNGrj2V+jH3+9yZxI43S9I3NOCl4BvX5Cp3CFMHyt80gk2yM1BJpQZZ4GHewkI/XOIFPU3rR5+toEYXHz7kzykZsqt1PtbaTwG3TX9GJI4C7aWyH9H+9Bt76vH/pLBIn rackhd@rackhd-demo"
            },
            {
                "name": "rackhd2",
                "password": "123456",
                "encryptedPassword": "*****rackhd2*****",
            }
        ],
        "rootSshKey": "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDJQ631/sw3D40h/6JfA+PFVy5Ofz6eu7caxbv0zdw4fTJsrFcOliHZTEtAvqx7Oa8gqSC6d7v61M0croQxtt1DGUcH2G4yhfdZOlK4pr5McwtX0T/APACdAr1HtP7Bt7u43mgHpUG4bHGc+NoY7cWCISkxl4apkYWbvcoJy/5bQn0uRgLuHUNXxK/XuLT5vG76xxY+1xRa5+OIoJ6l78nglNGrj2V+jH3+9yZxI43S9I3NOCl4BvX5Cp3CFMHyt80gk2yM1BJpQZZ4GHewkI/XOIFPU3rR5+toEYXHz7kzykZsqt1PtbaTwG3TX9GJI4C7aWyH9H+9Bt76vH/xyzmn rackhd@rackhd-demo",
        "dnsServers": ["172.12.88.91", "192.168.20.77"],
        "networkDevices": [
            {
                "device": "ens802f0",
                "ipv4": {
                    "ipAddr": "192.168.1.29",
                    "gateway": "192.168.1.1",
                    "netmask": "255.255.255.0",
                    "vlanIds": [104, 105]
                },
                "ipv6": {
                    "ipAddr": "fec0::6ab4:0:5efe:157.60.14.21",
                    "gateway": "fe80::5efe:131.107.25.1",
                    "netmask": "ffff.ffff.ffff.ffff.0.0.0.0",
                    "vlanIds": [101, 106]
                }
            },
            {
                "device": "ens802f1",
                "ipv4": {
                    "ipAddr": "192.168.11.89",
                    "gateway": "192.168.11.1",
                    "netmask": "255.255.255.0",
                    "vlanIds": [105, 109]
                },
                "ipv6": {
                    "ipAddr": "fec0::6ab4:0:5efe:159.45.14.11",
                    "gateway": "fe80::5efe:131.107.25.100",
                    "netmask": "ffff.ffff.ffff.ffff.0.0.0.0",
                    "vlanIds": [106, 108]
                }
            }
        ],
        "kvm": true,
        "installDisk": "/dev/sda",
        "installPartitions": [
            {
                "mountPoint": "/boot",
                "size": "500",
                "fsType": "ext3"
            },
            {
                "mountPoint": "swap",
                "size": "500",
                "fsType": "swap"
            },
            {
                "mountPoint": "/",
                "size": "auto",
                "fsType": "ext3"
            }
        ],
        "macaddress": "11:22:33:44:55:66",
        "rackhdCallbackScript": "rackhd.callback.sh",
        "server": "172.31.128.1",
        "port": "9080"
        //jshint ignore: end
    };

    it('should succeed to render', function() {
        helper.startTemplateTest(subject)
            .setIgnoreWhiteSpaces()
            .render(context)
            .expectFile('spec/data/templates/samples/centos-ks-full-sample.txt');
    });

    it('should generate autopart if no installPartitions', function() {
        var cloneContext = _.cloneDeep(context);
        delete cloneContext.installPartitions;
        helper.startTemplateTest(subject)
            .setIgnoreWhiteSpaces()
            .render(cloneContext)
            .expectFile('spec/data/templates/samples/centos-ks-autopart-sample.txt');
    });

    ['repo', 'version', 'rootEncryptedPassword', 'installDisk', 'server',
            'rackhdCallbackScript'].forEach(function(key) {
        var cloneContext = _.cloneDeep(context);
        delete cloneContext[key];
        it('should fail to render if missing "' + key + '"', function() {
            helper.startTemplateTest(subject)
                .render(cloneContext)
                .expectFailure();
        });
    });

    ['users', 'networkDevices', 'kvm', 'installPartitions', 'rootSshKey',
            'dnsServers'].forEach(function(key) {
        var cloneContext = _.cloneDeep(context);
        delete cloneContext[key];
        it('should still succeed to render if missing "' + key + '"', function() {
            helper.startTemplateTest(subject)
                .render(cloneContext)
                .expectSuccess();
        });
    });
});
