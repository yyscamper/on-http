// Copyright 2016, EMC, Inc.
'use strict';

module.exports = TemplateUnitTestHelper;

var ejs = require('ejs');
var fs = require('fs');
var path = require('path');
//jsonlint will report more beautiful error message and help identify problem
var jsonlint = require('jsonlint');

var SUPPORT_FORMATS = ['raw', 'json'];

/**
 * Remove all white spaces
 *
 * The white spaces including blank lines, heading and tailing white spaces for each line.
 *
 * @param {String} text - The data to process
 * @return {String} The data that has been removed all white spaces.
 */
function removeWhiteSpaces(text) {
    //remove all empty lines, heading & trailing white spaces
    text = text.trim();
    return text.replace(/\s*(?=\n|\r|\r\n)\s*/gm, '\n');
}

/**
 * Remove all blank lines
 *
 * Compare with removeWhiteSpaces, this function only remove blank lines, the heading and tailing
 * white spaces for each line will still be kept
 *
 * @param {String} text - The data to process
 * @return {String} The data that has been removed all white spaces.
 */
function removeBlankLines(text) {
    text = text.trim();
    return text.replace(/(?=\n|\r|\r\n)(\n|\r|\r\n)+/gm, '\n');
}

/**
 * Helper class that assists template unit-testing
 */
function TemplateUnitTestHelper() {
    this.reset();
}

/**
 * reset all parameters to default
 * @return {this}
 */
TemplateUnitTestHelper.prototype.reset = function() {
    this.workingDir = '';
    this.ejsOptions = { compileDebug: true };
    this.flags = {};
    this.renderResult = null;
    this.renderError = null;
    this.commonContext = {};
    return this;
};

/**
 * Check whether has valid render result
 * @return {Boolean} true if has valid render result, otherwise false
 */
TemplateUnitTestHelper.prototype._hasValidResult = function() {
    return (!this.renderError && _.isString(this.renderResult));
};

/**
 * Adjust the data by flags
 * @param {String} data - The data to be adjusted.
 * @return {String} The new data that has adjusted.
 */
TemplateUnitTestHelper.prototype._adjustData = function(data) {
    var newData = data;
    if (this.flags.ignoreWhiteSpaces) {
        newData = removeWhiteSpaces(newData);
    } else if (this.flags.ignoreBlankLines) {
        newData = removeBlankLines(newData);
    }
    return newData;
};

/**
 * Set the template that to be tested
 * @param {String} fileContent - The template content
 * @return {this}
 */
TemplateUnitTestHelper.prototype.setTemplate = function(fileContent) {
    this.template = ejs.compile(fileContent, this.ejsOptions);
    return this;
};

/**
 * Set the template that to be tested from file path
 * @param {String} filePath - The path of template file
 * @return {this}
 */
TemplateUnitTestHelper.prototype.setTemplateFile = function(filePath) {
    var realPath = path.resolve(this.workingDir, filePath);
    this.setTemplate(fs.readFileSync(realPath).toString());
    return this;
};

/**
 * Set the working directory
 *
 * If working directory is set, the following input file path should be use the relative path to
 * the working directory
 *
 * @param {String} dir - the working directory name
 * @return {this}
 */
TemplateUnitTestHelper.prototype.setWorkingDir = function(dir) {
    this.workingDir = dir;
    return this;
};

/**
 * Set the flags
 *
 * The flags will impact how to process the rendered result and input expectation data.
 * Now only following flags are supported:
 * - ignoreWhiteSpaces: ignore all white spaces while comparing render and result expectation data
 * - ignoreBlanklines: ignore all blank lines while comparing render result and expectation data
 *
 * @param {Object} flags - The flags to be set
 * @return {this}
 */
TemplateUnitTestHelper.prototype.setFlags = function(flags) {
    _.defaults(this.flags, flags);
    if (this._hasValidResult()) {
        this.renderResult = this._adjustData(this.renderResult);
    }
    return this;
};

/**
 * Set to ignore all white spaces during assertion
 * This is a shortcut for setFlags({ignoreWhiteSpaces: true})
 * @return {this}
 */
TemplateUnitTestHelper.prototype.setIgnoreWhiteSpaces = function() {
    this.setFlags({ ignoreWhiteSpaces: true });
    return this;
};

/**
 * Set to ignore all blank lines during assertion
 * This is a shortcut for setFlags({ignoreBlankLines: true})
 * @return {this}
 */
TemplateUnitTestHelper.prototype.setIgnoreBlankLines = function() {
    this.setFlags({ ignoreBlankLines: true });
    return this;
};

/**
 * Do template render
 *
 * The render will not throw error even if the render fails. The render result or error will be
 * stored and will be used in later assertion.
 *
 * @param {Object} context - The context that will be feed into template rendering
 * @return {this}
 */
TemplateUnitTestHelper.prototype.render = function(context) {
    if (context) {
        expect(context).to.be.an('Object');
    }
    else {
        context = {};
    }
    context = _.defaults(context, this.commonContext);
    if (!_.isFunction(this.template)) {
        throw new Error('The template has not been set before doing render');
    }
    try {
        this.renderResult = this._adjustData(this.template(context));
        this.renderError = null;
    }
    catch (err) {
        this.renderResult = null;
        this.renderError = err;
    }
    return this;
};

/**
 * The common check for both success and failure cases
 * @return {this} Return this if check succeeds.
 * @throw {Error} Throw error if check fails.
 */
TemplateUnitTestHelper.prototype._commonCheck = function() {
    if (this.renderResult || this.renderResult === '' || this.renderError) {
        return this;
    }
    throw new Error('You have to call render before doing assertion');
};

/**
 * Check no error has happened during rendering
 * @return {this} Return this if no rendering error.
 * @throw {Error} Throw error if has rendering error.
 */
TemplateUnitTestHelper.prototype._successCheck = function() {
    this._commonCheck();
    if (this.renderError) {
        throw this.renderError;
    }
    return this;
};

/**
 * Check error has happened during rendering
 * @return {this} Return this if has rendering error.
 * @throw {Error} Throw error if no rendering error.
 */
TemplateUnitTestHelper.prototype._failureCheck = function() {
    this._commonCheck();
    if (!this.renderError) {
        throw new Error('The template render succeeds, but you expect failure');
    }
    return this;
};

/**
 * Peek the render result
 * @param {Function} callback - The render result will be passed to the first argument of the
 * callback function
 * @return {this}
 */
TemplateUnitTestHelper.prototype.tap = function(callback) {
    expect(callback).to.be.a('Function');
    this._successCheck();
    callback(this.renderResult);
    return this;
};

/**
 * Assert there is failure happens for template rendering
 * @return {this}
 */
TemplateUnitTestHelper.prototype.expectFailure = function() {
    this._failureCheck();
    return this;
};

/**
 * Assert there is no failure happens for template rendering
 * @return {this}
 */
TemplateUnitTestHelper.prototype.expectSuccess = function() {
    this._successCheck();
    return this;
};

/**
 * Assert the render result equals to the input expectation.
 * @param {String} expectedResult - The input expectation value
 * @return {this}
 */
TemplateUnitTestHelper.prototype.expect = function(expectedResult) {
    expect(expectedResult).to.be.a('String');
    this._successCheck();
    expectedResult = this._adjustData(expectedResult);
    expect(this.renderResult).to.equal(expectedResult);
    return this;
};

/**
 * Assert the render result equals to content of input file
 * @param {String} expectedFilePath - The filepath that stores the expectation value.
 * @return {this}
 */
TemplateUnitTestHelper.prototype.expectFile = function(expectedFilePath) {
    expect(expectedFilePath).to.be.a('String');
    expect(expectedFilePath).to.not.be.empty;
    this._successCheck();
    var realPath = path.resolve(this.workingDir, expectedFilePath);
    var expectedResult = fs.readFileSync(realPath).toString();
    return this.expect(expectedResult);
};

/**
 * Assert the render result is JSON and equals to the input object
 * @param {JSON} expectedJson - The expected JSON data
 * @return {this}
 */
TemplateUnitTestHelper.prototype.expectJson = function(expectedJson) {
    this._successCheck();
    var resultJson = jsonlint.parse(this.renderResult);
    expect(resultJson).to.deep.equal(expectedJson);
    return this;
};

/**
 * Assert the render result is JSON and equals to the content of input file
 * @param {String} filePath - The input filepath that stores the expected JSON data
 * @return {this}
 */
TemplateUnitTestHelper.prototype.expectJsonFile = function(filePath) {
    expect(filePath).to.be.a('String');
    expect(filePath).to.not.be.empty;
    this._successCheck();
    var realPath = path.resolve(this.workingDir, filePath);
    var expectedResult = jsonlint.parse(fs.readFileSync(realPath).toString());
    return this.expectJson(expectedResult);
};

/**
 * Assert the render result conforms to the input format
 * @param {String} format - The expected format
 * @return {this}
 */
TemplateUnitTestHelper.prototype.expectFormat = function(format) {
    this._successCheck();

    format = format.toLowerCase();
    if (SUPPORT_FORMATS.indexOf(format) < 0) {
        throw new Error('invalid input format ' + JSON.stringify(format) +
            ', only support ' + SUPPORT_FORMATS.toString());
    }
    if (format === 'json') {
        jsonlint.parse(this.renderResult);
    }
    return this;
};

/**
 * Convert the render result to JSON object
 * @return {this}
 */
TemplateUnitTestHelper.prototype.toJson = function() {
    this._successCheck();
    if (!_.isString(this.renderResult)) {
        throw new Error('The cached render result is not string before converting to JSON');
    }
    this.renderResult = jsonlint.parse(this.renderResult);
    return this;
};

/**
 * Save the render result to a file
 * @param {String} filePath - The output file path
 * @return {this}
 */
TemplateUnitTestHelper.prototype.save = function(filePath) {
    expect(filePath).to.be.a('String');
    expect(filePath).to.not.be.empty;
    this._successCheck();
    var realPath = path.resolve(this.workingDir, filePath);
    fs.writeFileSync(realPath, this.renderResult);
    return this;
};

/**
 * Set the common context for rendering
 * @param {Object} context - The common context that sharedby everying rendering.
 * @return {this}
 */
TemplateUnitTestHelper.prototype.setCommonContext = function(context) {
    expect(context).to.be.an('Object');
    this.commonContext = context;
    return this;
};
