'use strict';

var ejs = require('ejs');
var glob = require('glob');
var path = require('path');
var fs = require('fs');

describe('Templates Syntax Check', function() {
    var patterns = [
        '/data/profiles/*',
        '/data/templates/*'
    ];

    var files = _.reduce(patterns, function(acc, pattern) {
        acc.push(glob.sync(process.cwd() + pattern, {nodir: true}));
        return acc;
    }, []);

    _.forEach(_.flattenDeep(files), function(file) {
        it(path.basename(file), function() {
            var data = fs.readFileSync(file).toString();
            //Ejs compilation success proves the template has no syntax error
            ejs.compile(data, {compileDebug: true});
        });
    });
});
