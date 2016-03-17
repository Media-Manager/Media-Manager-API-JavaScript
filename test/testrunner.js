
var chai = require("chai");
require("../dist/mediamanager-external-library.js");
require("./mock-fns.js");
require("./test-mock-fns.js");
require("./test-util.js");
require("./test-external.js");
require("./test-template.js");

describe("#mediamanager.client(string)", function () {

    it("Should set the client short name of the global mediamanager object", function () {

        var client = "demo";
        mediamanager.external.client( client );

        chai.expect( mediamanager.sn ).to.equal( client );
    });
});

