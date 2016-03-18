/*!
 * Tests for mock functions
 * used by other tests.
 */

var chai = require("chai");
require("../dist/mediamanager-external-library.js");
require("./mock-utils.js");
require("./mock-fns.js");

describe("#mediamanager.client(string)", function () {

    it("Should set the short name of the mediamanager object", function () {

        var shortname = random.string();
        mediamanager.client( shortname );

        chai.expect( mediamanager.sn ).to.equal( shortname );
    });
});

describe("#mediamanager.external.util.request(string, function[, object])", function () {

    it("Should throw an error if no api url found", function () {

        var expected = "mock-fns: request: api not found";
        var result = function () {

            var url = "this is a fake url that would never ever exist!";
            var onComplete = function () {};

            mediamanager.external.util.request(url, onComplete);
        };

        chai.expect( result ).to.throw( expected );
    });

    it("Should execute the onComplete function", function () {

        var baseUrl = mediamanager.external.util.templateReplace(mediamanager.external.baseURL, {
            shortname: mediamanager.external.client()
        });
        var url = baseUrl + "/template/" + mockVars.template + "/video/" + mockVars.video;
        var result = false;
        var expected = true;
        var onComplete = function () {
            result = expected; // don't normally mess around with state like in other scopes like this!
        };

        mediamanager.external.util.request(url, onComplete);

        chai.expect( result ).to.equal( expected );
    });
});

describe("#parseGetParams(string)", function () {

    var normalTestString = random.query();
    var abnormalTestString= "?" + normalTestString;
    var testObject = parseGetParams(normalTestString);

    it("Should parse a string of GET parameters without '?' correctly", function () {

        var result = parseGetParams( normalTestString );
        var expected = testObject;

        chai.expect( result ).to.deep.equal( expected );
    });

    it("Should parse all values as strings", function () {

        var result = parseGetParams( normalTestString );

        Object.keys(result).forEach(function (key, i) {
            chai.expect( typeof result[key] ).to.equal("string");
        });
    });

    it("Should fail with a starting question mark", function () {

        var result = parseGetParams( abnormalTestString );
        var expected = testObject;

        chai.expect( result ).to.not.deep.equal( expected );
    });
});

describe("#addGetParams(string, object)", function () {

    var newParams = random.object();
    var oldParams = random.object();
    var oldParamString = mediamanager.external.util.serialize( oldParams );
    var newParamString = mediamanager.external.util.serialize( newParams );
    var url = "https://example.com/apples/are/cool?" + oldParamString;
    var emptyUrl = "https://example.com/apples/are/cool";

    it("Should not replace the old GET Params", function () {

        var result = addGetParams(url, newParams).indexOf( oldParamString ) > -1;
        var expected = true;

        chai.expect( result ).to.equal( expected );
    });

    it("Should add new GET params", function () {

        var result = addGetParams(url, newParams).indexOf( newParamString ) > -1;
        var expected = true;

        chai.expect( result ).to.equal( expected );
    });

    it("Should add GET params if no ? set", function () {

        var result = addGetParams(emptyUrl, newParams).indexOf( newParamString ) > -1;
        var expected = true;

        chai.expect( result ).to.equal( expected );
    });
});

describe("#getFnParams(function)", function () {

    var expectedDeps = ["a", "b", "c"];
    var anon = function (a, b, c) {};
    var named = function named (a, b, c) {};
    var anonNoSpace = function(a,b,c){};
    var namedNoSpace = function named(a,b,c){};

    it("Should parse dependencies of anonymous functions", function () {
        var result = getFnParams(anon);
        chai.expect( result ).to.deep.equal( expectedDeps );
    });

    it("Should parse dependencies of named functions", function () {
        var result = getFnParams(named);
        chai.expect( result ).to.deep.equal( expectedDeps );
    });

    it("Should parse dependencies of anonymous functions with no spaces", function () {
        var result = getFnParams(anonNoSpace);
        chai.expect( result ).to.deep.equal( expectedDeps );
    });

    it("Should parse dependencies of named functions with no spaces", function () {
        var result = getFnParams(namedNoSpace);
        chai.expect( result ).to.deep.equal( expectedDeps );
    });
});

describe("#inject(function, object)", function () {

    var correctDeps = {
        number: 1,
        string: "I'm a string",
        object: {},
        array: []
    };
    var testFn = function testFn (number, string, object, array) {
        return typeof number === "number" &&
            typeof string === "string" &&
            typeof object === "object" &&
            !Array.isArray(object) &&
            Array.isArray(array);
    };

    it("Should inject dependencies of the correct type", function () {

        var result = inject(testFn, correctDeps);
        var expected = true;

        chai.expect( result ).to.equal( expected );
    });
});
