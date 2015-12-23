var request = require("request"),
  Parse = global.Parse || require('parse/node').Parse;

module.exports = function(options) {
  var promise = new Parse.Promise();
  var callbacks = {
    success: options.success,
    error: options.error
  };
  delete options.success;
  delete options.error;
  if (options.uri && !options.url) {
    options.url = options.uri;
    delete options.uri;
  }
  if (typeof options.body === 'object') {
    options.body = JSON.stringify(options.body);
  }
  request(options, (error, response, body) => {
    var httpResponse = {};
    httpResponse.status = response.statusCode;
    httpResponse.headers = response.headers;
    httpResponse.buffer = new Buffer(response.body);
    httpResponse.cookies = response.headers["set-cookie"];
    httpResponse.text = response.body;
    try {
      httpResponse.data = JSON.parse(response.body);
    } catch (e) {}
    // Consider <200 && >= 400 as errors 
    if (error || httpResponse.status <200 || httpResponse.status >=400) {
      if (callbacks.error) {
        return callbacks.error(httpResponse);
      }
      return promise.reject(httpResponse);
    } else {
      if (callbacks.success) {
        return callbacks.success(httpResponse);
      }
      return promise.resolve(httpResponse);
    }
  });
  return promise;
};