/*!
 * Functions used for testing functions 
 * or writing mock functions.
 */

var R = require("ramda");
var md5 = require("md5");
var chai = require("chai");
require("../dist/mediamanager-external-library.js");


/**
 * Parse a string of GET parameters 
 * (without a starting "?"), into 
 * an object with name:value pairs
 * of the params.
 *
 * @param {string} paramString String of GET parameters to parse into an object.
 * @return {object} Object of parsed GET params.
 */
parseGetParams = function (paramString) {
    return paramString.split("&").reduce(function (paramObject, pairString) {

        var pair = pairString.split("=");
        var key = pair[0];
        var value = pair[1] || "";

        paramObject[key] = value;

        return paramObject;
    }, {});
};

/**
 * Add given object
 * of get parameters
 * to the given string url
 * without overwriting any 
 * GET parameters in said url.
 *
 * @param {string} url URL to modify -- not mutate!
 * @param {object} newParams Object of new params to add to the URL.
 * @return {string} String of URL with modified GET parameters. Old ones not removed, but maybe overwritten by conflicting new ones.
 */
addGetParams = function (url, newParams) {

    url = url.trim();
    var oldParamString = url.split("?")[1] || "";
    var oldParams = parseGetParams( oldParamString );

    var params = R.reject(R.isEmpty, R.merge(oldParams, newParams));
    var paramsString = Object.keys(params).length == 0 ? "" : "?" + mediamanager.external.util.serialize( params );

    var hasQuestionMark = url.indexOf("?") >= url.length-1;

    url = hasQuestionMark ? url.replace(/\?.*$/, paramsString) : url + paramsString;

    return url;
};

/**
 * Get the parameters of a function.
 *
 * @param {function} fn Function from which to get params.
 * @return {array} Ordered names (by appearance) of the parameters for the given function.
 */
getFnParams = function (fn) {

    var fnString = fn.toString();
    var fnParamRegex = /function[^\(]*\(([^\)]+)\)\s*{/;
    var fnParamNames = R.last(fnString.match( fnParamRegex ) || "").split(/,\s?/);

    return fnParamNames;
};
/**
 * Primitive/basic dependency
 * injection to a given function.
 * Injects the given dependencies
 * into the given function.
 * 
 * @param {function} fn Function to inject into.
 * @param {object} depVals Values to inject with.
 * @param {object} context Optional object for context/scope of the function.
 * @return {undefined}
 */
inject = function (fn, depVals, context) {

    var fnDepNames = getFnParams(fn);
    var fnContext = context || null;
    var fnDeps = R.map(function (depName) {
        return depVals[ depName ];
    }, fnDepNames);

    return fn.apply(fnContext, fnDeps);
};

/**
 * Setup tests for each given api function.
 *
 * @param {object} mmObject The media manager object holding the api functions to test.
 * @param {array} apiTests List of apis to test.
 * @return {undefined}
 */
setupApiTests = function (mmObject, apiTests, defaultTestArgs) {
    apiTests.forEach(function (apiTest) {

        var name = apiTest.name;
        var params = apiTest.params || null;
        var type = mmObject === mediamanager.external.template ? "template" : "playlist";

        describe("#mediamanager.external." + type + "." + name, function () {

            it("Should execute onComplete without error", function () {

                var expected = true;
                var result = false;
                defaultTestArgs.onComplete = function () {
                    result = expected;
                };
                var testFn = mmObject[ name ];
                var testFnArgs = R.merge(defaultTestArgs, apiTest);

                inject(testFn, testFnArgs, mediamanager.external.template); // function, args, context

                chai.expect( result ).to.equal( expected );
            });
        });
    });
};

/**
 * Functions to generate
 * random data types.
 *
 * @type {object}
 */
random = {
    /**
     * Generate a random string
     *
     * @return {string}
     */
    string: function () {
        return md5(Date.now() * random.number(10));
    },
    /**
     * Generate a random number.
     *
     * @param {number} n Range for randomisation from 0 to n.
     * @return {number}
     */
    number: function (n) {
        return Math.floor(Math.random() * (n || 100));
    },
    /**
     * Generate a random boolean.
     *
     * @return {boolean} 
     */
    bool: function () {
        return Math.round(Math.random()) == true; // turns it into a boolean
    },
    /**
     * Randomly return a string
     * of the random object.
     * 
     * @param {array} omit Types to be omitted.
     * @return {string} Type of random data.
     */
    type: function (omit) {

        var ommitTypes = R.append('type', omit);
        var cleaned = R.omit(ommitTypes, random);
        var keys = Object.keys(cleaned);
        var randomIndex = random.number( keys.length - 1 );
        var randomKey = keys[ randomIndex ];

        return randomKey;
    },
    /**
     * Generate random array
     * with items of a given type.
     *
     * Acceptable types are 'string', 'number',
     * and 'bool'.
     *
     * @param {string} type Type of item.
     * @return {array} 
     */
    array: function (type) {

        var randArray = R.range(0, random.number(10));

        return R.map(function (item) {
            return random[ type || random.type(['array', 'object', 'query', 'advancedTags']) ]();
        }, randArray);
    },
    /**
     * Generate a random 
     * object with random string
     * keys and random values.
     * Type of values can be optionally enforced.
     *
     * @param {string} type Type of items.
     * @return {undefined}
     */
    object: function () {

        var randKeys = random.array('string');
        var randPairs = R.map(function (key) {

            var randomType = random.type(['array', 'object', 'query', 'advancedTags']);
            var randomValue = random[ randomType ]();

            return [key, randomValue];
        }, randKeys);

        return R.fromPairs(randPairs);
    },
    /**
     * Generate a random query string.
     *
     * @return {string} Random query string of GET params.
     */
    query: function () {
        var randomRange = R.range(0, random.number(10));
        var queryList = R.map(function (n) {
            return random.string() + "=" + random[ random.type(['object', 'array', 'query', 'advancedTags']) ]()
        }, randomRange);

        return R.join("&", queryList);
    },
    /**
     * Generate a string of
     * random advanced tags.
     *
     * @return {string} Random string of advanced tags for a query.
     */
    advancedTags: function () {

        var randomRange = R.range(0, random.number(10));
        var advancedTagsList = R.map(function (n) {
            return random.string() + "=" + random.string()
        }, randomRange);

        return R.join(";", advancedTagsList);
    }
};
