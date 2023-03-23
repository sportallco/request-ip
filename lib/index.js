"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
var is = require('./is');
function getClientIpFromXForwardedFor(value) {
  if (!is.existy(value)) {
    return null;
  }
  if (is.not.string(value)) {
    throw new TypeError("Expected a string, got \"".concat(_typeof(value), "\""));
  }
  var getForwardedIps = function getForwardedIps(value) {
    var ips = value.split(',').map(function (ip) {
      return ip.trim();
    });
    var filteredIps = ips.reduce(function (ips, ip) {
      if (ip.includes(':')) {
        var _ip$split = ip.split(':'),
          _ip$split2 = _slicedToArray(_ip$split, 2),
          address = _ip$split2[0],
          port = _ip$split2[1];
        if (port && isNaN(parseInt(port))) {
          return ips;
        }
        ips.push(address);
      }
      ips.push(ip);
      return ips;
    }, []);
    return filteredIps;
  };
  var forwardedIps = getForwardedIps(value);
  for (var i = forwardedIps.length > 1 ? forwardedIps.length - 2 : 0; i < forwardedIps.length; i++) {
    if (is.ip(forwardedIps[i])) {
      return forwardedIps[i];
    }
  }
  return null;
}
function getClientIp(req) {
  if (req.headers) {
    if (is.ip(req.headers['x-client-ip'])) {
      return req.headers['x-client-ip'];
    }
    var xForwardedFor = getClientIpFromXForwardedFor(req.headers['x-forwarded-for']);
    if (is.ip(xForwardedFor)) {
      return xForwardedFor;
    }
    if (is.ip(req.headers['cf-connecting-ip'])) {
      return req.headers['cf-connecting-ip'];
    }
    if (is.ip(req.headers['fastly-client-ip'])) {
      return req.headers['fastly-client-ip'];
    }
    if (is.ip(req.headers['true-client-ip'])) {
      return req.headers['true-client-ip'];
    }
    if (is.ip(req.headers['x-real-ip'])) {
      return req.headers['x-real-ip'];
    }
    if (is.ip(req.headers['x-cluster-client-ip'])) {
      return req.headers['x-cluster-client-ip'];
    }
    if (is.ip(req.headers['x-forwarded'])) {
      return req.headers['x-forwarded'];
    }
    if (is.ip(req.headers['forwarded-for'])) {
      return req.headers['forwarded-for'];
    }
    if (is.ip(req.headers.forwarded)) {
      return req.headers.forwarded;
    }
    if (is.ip(req.headers['x-appengine-user-ip'])) {
      return req.headers['x-appengine-user-ip'];
    }
  }
  if (is.existy(req.connection)) {
    if (is.ip(req.connection.remoteAddress)) {
      return req.connection.remoteAddress;
    }
    if (is.existy(req.connection.socket) && is.ip(req.connection.socket.remoteAddress)) {
      return req.connection.socket.remoteAddress;
    }
  }
  if (is.existy(req.socket) && is.ip(req.socket.remoteAddress)) {
    return req.socket.remoteAddress;
  }
  if (is.existy(req.info) && is.ip(req.info.remoteAddress)) {
    return req.info.remoteAddress;
  }
  if (is.existy(req.requestContext) && is.existy(req.requestContext.identity) && is.ip(req.requestContext.identity.sourceIp)) {
    return req.requestContext.identity.sourceIp;
  }
  if (req.headers) {
    if (is.ip(req.headers['Cf-Pseudo-IPv4'])) {
      return req.headers['Cf-Pseudo-IPv4'];
    }
  }
  if (is.existy(req.raw)) {
    return getClientIp(req.raw);
  }
  return null;
}
function mw(options) {
  var configuration = is.not.existy(options) ? {} : options;
  if (is.not.object(configuration)) {
    throw new TypeError('Options must be an object!');
  }
  var attributeName = configuration.attributeName || 'clientIp';
  return function (req, res, next) {
    var ip = getClientIp(req);
    Object.defineProperty(req, attributeName, {
      get: function get() {
        return ip;
      },
      configurable: true
    });
    next();
  };
}
module.exports = {
  getClientIpFromXForwardedFor: getClientIpFromXForwardedFor,
  getClientIp: getClientIp,
  mw: mw
};