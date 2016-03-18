/*!
 * Tests for functions in
 * mediamanager.external object.
 */

var chai = require("chai");
var R = require("ramda");
require("./mock-utils.js");
require('./mock-fns.js');
require("../dist/mediamanager-external-library.js");

describe("#mediamanager.external.create( object )", function () {

    it("Should create an instance with prototype of mediamanager.external", function () {

        /*
        var spec = {
            name: "Daniel",
            age: 24,
            interests: [
                "Turtles",
                "Zombies",
                "Bird-watching"
            ]
        };
       */
        var spec = random.object();
        var result = mediamanager.external.create( spec );
        var resultProto = Object.getPrototypeOf( result );
        var fromSpecToExpected = function (expected, key) {

            var value = this[key];
            expected[key] = value;

            return expected;
        }.bind(spec);
        var expected = Object.keys(spec).reduce(fromSpecToExpected, Object.create(mediamanager.external));

        chai.expect( result ).to.not.equal( expected ); // check for different reference
        chai.expect( result ).to.deep.equal( expected ); // check for same values
        chai.expect( resultProto ).to.equal( mediamanager.external ); // check for same reference
        chai.expect( resultProto ).to.deep.equal( mediamanager.external ); // check for same values
    });
});

describe("#mediamanager.external.addFilter(string, mixed)", function () {

    var filters = {
        perPage: 5,
        primate: "Homo sapien"
    };

    it("Should return a new instance of the external object with the given filters", function () {

        var expected = mediamanager.external.addFilter('perPage', filters.perPage);
        var result = mediamanager.external.addFilter('perPage', filters.perPage);

        chai.expect( result ).to.not.equal( expected );
    });

    /*
     * Tests for each filter!
     */
    Object.keys(filters).forEach(function (key) {

        var value = filters[key];

        it("Should add the given filter", function () {

            var result = mediamanager.external.addFilter(key, value).globalFilters[ key ];
            var expected = value;

            chai.expect( result ).to.equal( expected );
        });
    });
});
