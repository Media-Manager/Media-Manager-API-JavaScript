/*!
 * Define any mock functions or 
 * variables for the global mediamanager
 * object, used by the external
 * api library.
 */

var R = require("ramda");
var md5 = require("md5");
require("../dist/mediamanager-external-library.js");
require("./mock-utils.js");

// DEFINE IF NOT EXISTENT
mediamanager = global.mediamanager != null ? mediamanager: {};

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

        return keys[ randomIndex ];
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
            return random[ type || random.type(['array', 'object']) ]();
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

            var randomValue = random[ random.type() ]();

            return [key, randomValue];
        }, randKeys);

        return R.fromPairs(randPairs);
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

/**
 * Variables used for mock 
 * functions. 
 * Good for testing purposes. 
 * Works like a test config.
 *
 * @type {object}
 */
mockVars = {
    template: random.string(),
    video: random.string(),
    audio: random.string(),
    playlist: random.string(),
    filters: {
        perPage: random.number(),
        advanced_tags: random.advancedTags()
    }
};

/**
 * Set the shortname for a client.
 *
 * @param {string} client Shortname for client.
 * @return {undefined}
 */
mediamanager.client = function (client) {
    this.sn = client;
};

/**
 * Mock the request
 * function for testing purposes.
 * Immitates a GET request.
 *
 * Just passes response data
 * to the onComplete function.
 *
 * @param {string} url URL for get request.
 * @param {function} onComplete Callback function to execute when request succeeds.
 * @param {object} params GET Parameters to pass to the given URL.
 * @return {undefined} Returns nothing
 */
mediamanager.external.util.request = function (url, onComplete, params) {

    var baseURL = mediamanager.external.util.templateReplace(mediamanager.external.baseURL, {
        shortname: mediamanager.external.client()
    });
    var template = mockVars.template;
    var playlist = mockVars.playlist;
    var video = mockVars.video;
    var audio = mockVars.audio;
    params = mediamanager.external.util.extend(mockVars.filters, params || {});
    var requestUrl = addGetParams(url, params);
    var apis = [];

    /*
     * Template
     */
    // most viewed videos 
    apis.push({
        url: baseURL + "/template/" + template + "/videos/mostviewed",
        response: {}
    });
    // latest videos
    apis.push({
        url: baseURL + "/template/" + template + "/videos/latest",
        response: {}
    });
    // search videos
    apis.push({
        url: baseURL + "/template/" + template + "/video/search",
        response: {}
    });
    // single video 
    apis.push({
        url: baseURL + "/template/" + template + "/video/" + video,
        response: {}
    });
    // videos in template
    apis.push({
        url: baseURL + "/template/" + template + "/videos",
        response: {}
    });
    // audio in templatparams);
    apis.push({
        url: baseURL + "/template/" + template + "/audios",
        response: {}
    });
    // recommended video
    apis.push({
        url: baseURL + "/template/" + template + "/videos/recommend/" + video,
        response: {}
    });

    /*
     * Playlist
     */
    // videos in playlist
    apis.push({
        url: baseURL + "/playlist/" + playlist + "/videos",
        response: {}
    });
    // audios in playlist
    apis.push({
        url: baseURL + "/playlist/" + playlist + "/audios",
        response: {}
    });
    // single audio in playlist
    apis.push({
        url: baseURL + "/playlist/" + playlist + "/audio/" + audio,
        response: {}
    });
    // single audio in playlist
    apis.push({
        url: baseURL + "/playlist/" + playlist + "/video/" + video,
        response: {}
    });

    // find api matching url
    var api = apis.reduce(function (foundApi, api) {
        var url = addGetParams(api.url, params);
        if (requestUrl === url) {
            return api;
        }
        return foundApi;
    }, null);

    if (api !== null)
        onComplete( api.response );
    else
        throw new ReferenceError("mock-fns: request: api not found for " + requestUrl);
};
