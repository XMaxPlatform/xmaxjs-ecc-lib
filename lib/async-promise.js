"use strict";

/**

  Execute a func asynchronously and return promise to receive the result. 
  The function does not expect to have a callback parameter.

  @arg {function} func - non-callback function

  @example asyncPromise(myfunction)
*/
module.exports = function (func) {
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        try {
          resolve(func.apply(undefined, args));
        } catch (err) {
          reject(err);
        }
      });
    });
  };
};