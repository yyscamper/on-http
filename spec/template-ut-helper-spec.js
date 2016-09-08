// Copyright 2016, EMC, Inc.

'use strict';

describe('template-ut-helper', function() {
    var TemplateUtHelper = require('./template-ut-helper.js');
    var instance;
    var sandbox;
    var fs = require('fs');

    var t1 = "foo=<%=a%>;bar=<%=b%>";
    var r1 = "foo=1;bar=2";
    var c = { a : 1, b : 2 };

    before(function() {
        sandbox = sinon.sandbox.create();
    });

    beforeEach(function() {
        sandbox.restore();
        instance = new TemplateUtHelper();
    });

    describe('render', function() {
        it('should generate rendered result and return this', function() {
            var ret = instance.setTemplate(t1).render(c).expectSuccess();
            expect(ret).to.deep.equal(instance);
        });

        it('should not throw error even render fails', function() {
            instance.setTemplate("<%=notExist%>").render(c);
        });

        it('should throw error if render context is not object', function() {
            [1, 'abc', [1, 2]].forEach(function(val) {
                expect(function() {
                    instance.setTemplate(t1).render(val);
                }).to.throw(Error);
            });
        });
    });

    describe('tap', function() {
        it('should peek the generated result and return this', function() {
            var ret = instance.setTemplate(t1).render(c).tap(function(result) {
                expect(result).to.equal(r1);
            });
            expect(ret).to.deep.equal(instance);
        });

        it('should fail if the tap argument is not function', function() {
            [1, 'abc', { a: 1}, [1, 2], null].forEach(function(val) {
                expect(function() {
                    instance.setTemplate(t1).render(c).tap(val);
                }).to.throw(Error);
            });
        });
    });

    describe('expectSuccess', function() {
        it('should pass if render succeeds and return this', function() {
            var ret = instance.setTemplate(t1).render(c).expectSuccess();
            expect(ret).to.deep.equal(instance);
        });

        it('should fail if render fails', function() {
            expect(function() {
                instance.setTemplate("<%=NotExist%>").render(c).expectSuccess();
            }).to.throw(Error);
        });

        it('should fail if not call render before', function() {
            expect(function() {
                instance.setTemplate(t1).expectSuccess();
            }).to.throw(/call render before/);
        });
    });

    describe('expectFailure', function() {
        it('should pass if render fails and return this', function() {
            var ret = instance.setTemplate("<%=NotExist%>").render(c).expectFailure();
            expect(ret).to.deep.equal(instance);
        });

        it('should fail if render succeeds', function() {
            expect(function() {
                instance.setTemplate(t1).render(c).expectFailure();
            }).to.throw(/template render succeeds/);
        });

        it('should fail if not call render before', function() {
            expect(function() {
                instance.setTemplate("<%=NotExist%>").expectFailure();
            }).to.throw(/call render before/);
        });
    });

    describe('setIgnoreWhiteSpaces', function() {
        var t = "  \n\n foo=<%=a%>  \n\n\r\n  bar=<%=b%>\n\n\n";
        var r = "foo=1\nbar=2";

        it('should ignore white spaces by setIgnoreWhiteSpaces and return this', function() {
            var ret = instance.setTemplate(t).setIgnoreWhiteSpaces().render(c).expect(r);
            expect(ret).to.deep.equal(instance);
        });

        it('should ignore white spaces by setFlags and return this', function() {
            var ret = instance.setTemplate(t)
                .setFlags( { ignoreWhiteSpaces: true } )
                .render(c)
                .expect(r);
            expect(ret).to.deep.equal(instance);
        });
    });

    describe('setBlankLines', function() {
        var t = "  \n\n foo=<%=a%>  \n\n\r\n  bar=<%=b%>\n\n\n";
        var r = " foo=1  \n  bar=2\n";
        it('should ignore blank lines by setIgnoreBlankLines and return this', function() {
            var ret = instance.setTemplate(t).setIgnoreBlankLines().render(c).expect(r);
            expect(ret).to.deep.equal(instance);
        });

        it('should ignore blank lines by setFlags and return this', function() {
            var ret = instance.setTemplate(t)
                .setFlags( { ignoreBlankLines: true } )
                .render(c)
                .expect(r);
            expect(ret).to.deep.equal(instance);
        });
    });

    describe('expect', function() {
        it('should pass and return this', function() {
            var ret = instance.setTemplate(t1).render(c).expect(r1);
            expect(ret).to.deep.equal(instance);
        });

        it('should fail if data is not matching', function() {
            expect(function() {
                instance.setTemplate(t1).render(c).expect('notexist');
            }).to.throw(Error);
        });

        it('should fail if not call render before', function() {
            expect(function() {
                instance.setTemplate(t1).expect(r1);
            }).to.throw(/call render before/);
        });
    });

    describe('expectJson', function() {
        var t = ' { "foo": <%=a%>, "bar": <%=b%> } ';
        var r = { foo: 1, bar: 2 };

        it('should compare with JSON data and return this', function() {
            var ret = instance.setTemplate(t).render(c).expectJson(r);
            expect(ret).to.deep.equal(instance);
        });

        it('should fail if expection input is not correct', function() {
            expect(function() {
                instance.setTemplate(t).render(c).expectJson({foo: 2, bar: 2});
            }).to.throw(Error);
        });

        it('should fail if template is not valid JSON', function() {
            expect(function() {
                instance.setTemplate("foo:<%=a%>").render(c).expectJson(r);
            }).to.throw(/Parse error/);
        });

        it('should fail if not call render before', function() {
            expect(function() {
                instance.setTemplate(t).expectJson(r);
            }).to.throw(/call render before/);
        });
    });

    describe('toJson', function() {
        var t = ' { "foo": <%=a%>, "bar": <%=b%> } ';
        var r = { foo: 1, bar: 2 };

        it('should generate correct JSON object and return this', function() {
            var ret = instance.setTemplate(t)
                .render(c)
                .toJson()
                .tap(function(result) {
                    expect(result).to.deep.equal(r);
                });
            expect(ret).to.deep.equal(instance);
        });

        it('should fail for invalid JSON template', function() {
            expect(function() {
                instance.setTemplate('"foo: <%=a%>')
                    .render(c)
                    .toJson();
            }).to.throw(/Parse error/);
        });

        it('should fail if not call render before', function() {
            expect(function() {
                instance.setTemplate(t).toJson();
            }).to.throw(/call render before/);
        });
    });

    describe('expectFormat', function() {
        var t = ' { "foo": <%=a%>, "bar": <%=b%> } ';

        it('should succeed to expect JSON format and return this', function() {
            var ret = instance.setTemplate(t).render(c).expectFormat('json');
            expect(ret).to.deep.equal(instance);
        });

        it('should succeed to expect raw format', function() {
            instance.setTemplate(t).render(c).expectFormat('raw');
            instance.setTemplate("abc<%=a%>").render(c).expectFormat('raw');
        });

        it('should fail if input format is not supported', function() {
            expect(function() {
                instance.setTemplate(t).render(c).expectFormat('NotSupport');
            }).to.throw(/invalid input format/);
        });

        it('should be case insensitive', function() {
            instance.setTemplate(t).render(c).expectFormat('Json');
            instance.setTemplate(t).render(c).expectFormat('JSON');
            instance.setTemplate(t).render(c).expectFormat('JsoN');
        });

        it('should fail if not call render before', function() {
            expect(function() {
                instance.setTemplate(t).expectFormat('json');
            }).to.throw(/call render before/);
        });
    });

    describe('setTemplateFile', function() {
        it('should load template data from file and return this', function() {
            sandbox.stub(fs, 'readFileSync').withArgs('/the/file/path').returns(t1);
            var ret = instance.setTemplateFile('/the/file/path').render(c).expect(r1);
            expect(ret).to.deep.equal(instance);
        });

        it('should work well in workingDir', function() {
            sandbox.stub(fs, 'readFileSync')
                .withArgs('/the/file/path').returns(t1)
                .withArgs('file/path').throws();
            instance.setWorkingDir('/the').setTemplateFile('file/path').render(c).expect(r1);
            expect(fs.readFileSync).to.be.calledWith('/the/file/path');
        });

        it('should throw error if file is not exising', function() {
            sandbox.stub(fs, 'readFileSync').withArgs('/the/file/path').throws(
                new Error('The file is not existing'));
            expect(function() {
                instance.setTemplateFile('/the/file/path').render(c).expect(r1);
            }).to.throw('The file is not existing');
        });

        it('should throw error if filepath is not string', function() {
            [null, 123, [1, 2], {a: 1}].forEach(function(val) {
                expect(function() {
                    instance.setTemplateFile(val);
                }).to.throw(Error);
            });
        });
    });

    describe('expectFile', function() {
        it('should load expection data from file and return this', function() {
            sandbox.stub(fs, 'readFileSync').withArgs('/the/expect/file/path').returns(r1);
            var ret = instance.setTemplate(t1).render(c).expectFile('/the/expect/file/path');
            expect(ret).to.deep.equal(instance);
        });

        it('should work well in workingDir', function() {
            sandbox.stub(fs, 'readFileSync').withArgs('/the/expect/file/path').returns(r1);
            instance.setWorkingDir('/the/expect').setTemplate(t1).render(c).expectFile('file/path');
        });

        it('should fail if filepath is not string', function() {
            [null, 123, [1, 2], {a: 1}, ''].forEach(function(val) {
                expect(function() {
                    instance.setWorkingDir('').setTemplate(t1).render(c).expectFile(val);
                }).to.throw(Error);
            });
        });

        it('should fail if read file fails', function() {
            sandbox.stub(fs, 'readFileSync').throws(new Error('Mock Read File Error'));
            expect(function() {
                instance.setTemplate(t1).render(c).expectFile('/the/expect/file/path');
            }).to.throw('Mock Read File Error');
        });

        it('should fail if not call render before', function() {
            sandbox.stub(fs, 'readFileSync').withArgs('/the/expect/file/path').returns(r1);
            expect(function() {
                instance.setTemplate(t1).expectFile('/the/expect/file/path');
            }).to.throw(/call render before/);
        });
    });

    describe('expectJsonFile', function() {
        var t = ' { "foo": <%=a%>, "bar": <%=b%> } ';
        var r = '{"foo":1, "bar":2}';

        it('should read & parse JSON data from file and return this', function() {
            sandbox.stub(fs, 'readFileSync').withArgs('/the/file/path').returns(r);
            var ret = instance.setTemplate(t).render(c).expectJsonFile('/the/file/path');
            expect(ret).to.deep.equal(instance);
        });

        it('should work well in workingDir', function() {
            sandbox.stub(fs, 'readFileSync').withArgs('/the/file/path').returns(r);
            instance.setWorkingDir('/the').setTemplate(t).render(c).expectJsonFile('file/path');
        });

        it('should fail if input file is not valid JSON', function() {
            sandbox.stub(fs, 'readFileSync').withArgs('/the/file/path').returns("a:1");
            expect(function() {
                instance.setTemplate(t).render(c).expectJsonFile('/the/file/path');
            }).to.throw(/Parse error/);
        });

        it('should fail if read file fails', function() {
            sandbox.stub(fs, 'readFileSync').throws(new Error('Mock Read File Error'));
            expect(function() {
                instance.setTemplate(t1).render(c).expectJsonFile('/the/file/path');
            }).to.throw('Mock Read File Error');
        });

        it('should fail if not call render before', function() {
            sandbox.stub(fs, 'readFileSync').withArgs('/the/file/path').returns(r);
            expect(function() {
                instance.setTemplate(t1).expectJsonFile('/the/file/path');
            }).to.throw(/call render before/);
        });
    });

    describe('save', function() {
        it('should write file and return this', function() {
            sandbox.stub(fs, 'writeFileSync');
            var ret = instance.setTemplate(t1).render(c).save('/the/file/path');
            expect(fs.writeFileSync).to.be.calledWith('/the/file/path', r1);
            expect(ret).to.deep.equal(instance);
        });

        it('should work well in workingDir', function() {
            sandbox.stub(fs, 'writeFileSync')
                .withArgs('/the/file/path').returns()
                .withArgs('file/path').throws();
            instance.setWorkingDir('/the').setTemplate(t1).render(c).save('file/path');
            expect(fs.writeFileSync).to.be.calledWith('/the/file/path', r1);
        });

        it('should fail if write file fails', function() {
            sandbox.stub(fs, 'writeFileSync').throws(new Error('write file error'));
            expect(function() {
                instance.setTemplate(t1).render(c).save('/the/file/path');
            }).to.throw('write file error');
        });

        it('should fail if not call render before', function() {
            sandbox.stub(fs, 'writeFileSync');
            expect(function() {
                instance.setTemplate(t1).save('/the/file/path');
            }).to.throw(/call render before/);
        });
    });

    describe('setWorkingDir', function() {
        it('should set default workingDir to empty', function() {
            sandbox.stub(fs, 'readFileSync').withArgs('/the/expect/file/path').returns(r1);
            var ret = instance.setTemplate(t1).render(c).expectFile('/the/expect/file/path');
            expect(ret).to.deep.equal(instance);
        });

        it('should return this', function() {
            expect(instance.setWorkingDir('/foo/bar')).to.deep.equal(instance);
        });
    });

    describe('setCommonContext', function() {
        it('should fetch options from common context', function() {
            instance.setTemplate("foo=<%=foo%>,bar=<%=bar%>")
                .setCommonContext({foo:1, bar:2})
                .render({})
                .expect("foo=1,bar=2");
            instance.setTemplate("foo=<%=foo%>,bar=<%=bar%>")
                .setCommonContext({foo:3})
                .render({bar:4})
                .expect("foo=3,bar=4");
            instance.setTemplate("foo=<%=foo%>,bar=<%=bar%>")
                .setCommonContext({foo:5, bar:6})
                .render({bar:7})
                .expect("foo=5,bar=7");
        });
    });
});
