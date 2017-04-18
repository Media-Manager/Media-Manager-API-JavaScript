/*!
 * Define any mock functions or 
 * variables for the global mediamanager
 * object, used by the external
 * api library.
 */
require("../dist/mediamanager-external-library.js");
require("./mock-utils.js");

// DEFINE IF NOT EXISTENT
mediamanager = global.mediamanager != null ? mediamanager: {};

/**
 * Variables used for mock 
 * functions. 
 * Good for testing purposes. 
 * Works like a test config.
 *
 * @type {object}
 */
mockVars = {
    template: "55cdea6f140ba095488b4581",
    video: "55e5c930150ba085738b456b",
    audio: "55e5c930150ba085738b456b",
    playlist: "55e07803140ba06c7e8b4574",
    filters: {
        perPage: 5,
        advanced_tags: "fund_manager=apples"
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
