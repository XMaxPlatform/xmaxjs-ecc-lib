'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var bs58 = require('bs58');
var ecurve = require('ecurve');
var secp256k1 = ecurve.getCurveByName('secp256k1');
var assert = require('assert');
var bigi = require('bigi');

var hash = require('./hash');
var config = require('./config');

module.exports = PublicKey;

/** @param {ecurve.Point} public key */
function PublicKey(Q) {

    if (typeof Q === 'string') {
        var publicKey = PublicKey.fromString(Q);
        assert(publicKey != null, 'Invalid public key');
        return publicKey;
    } else if (Buffer.isBuffer(Q)) {
        return PublicKey.fromBuffer(Q);
    } else if ((typeof Q === 'undefined' ? 'undefined' : _typeof(Q)) === 'object' && Q.Q) {
        return PublicKey(Q.Q);
    }

    if ((typeof Q === 'undefined' ? 'undefined' : _typeof(Q)) !== 'object' || typeof Q.compressed !== 'boolean') {
        throw new TypeError('Invalid public key');
    }

    function toBuffer() {
        var compressed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Q.compressed;

        return Q.getEncoded(compressed);
    }

    var pubdata = void 0; // cache

    /**
        Full public key
        @return {string} XMAXKey..
    */
    function toString() {
        var address_prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : config.address_prefix;

        if (pubdata) {
            return address_prefix + pubdata;
        }
        var pub_buf = toBuffer();
        var checksum = hash.ripemd160(pub_buf);
        var addy = Buffer.concat([pub_buf, checksum.slice(0, 4)]);
        pubdata = bs58.encode(addy);
        return address_prefix + pubdata;
    }

    function toUncompressed() {
        var buf = Q.getEncoded(false);
        var point = ecurve.Point.decodeFrom(secp256k1, buf);
        return PublicKey.fromPoint(point);
    }

    function toHex() {
        return toBuffer().toString('hex');
    }

    return {
        Q: Q,
        toString: toString,
        toUncompressed: toUncompressed,
        toBuffer: toBuffer,
        toHex: toHex
    };
}

PublicKey.isValid = function (text) {
    try {
        PublicKey(text);
        return true;
    } catch (e) {
        return false;
    }
};

PublicKey.fromBinary = function (bin) {
    return PublicKey.fromBuffer(new Buffer(bin, 'binary'));
};

PublicKey.fromBuffer = function (buffer) {
    return PublicKey(ecurve.Point.decodeFrom(secp256k1, buffer));
};

PublicKey.fromPoint = function (point) {
    return PublicKey(point);
};

/**
    @arg {string} public_key - like XMXXyz...
    @arg {string} address_prefix - like XMX
    @return PublicKey or `null` (if the public_key string is invalid)
    @deprecated fromPublicKeyString (use fromString instead)
*/
PublicKey.fromString = function (public_key) {
    var address_prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : config.address_prefix;

    try {
        return PublicKey.fromStringOrThrow(public_key, address_prefix);
    } catch (e) {
        return null;
    }
};

/**
    @arg {string} public_key - like XMXKey..
    @arg {string} address_prefix - like XMX
    @throws {Error} if public key is invalid
    @return PublicKey
*/
PublicKey.fromStringOrThrow = function (public_key) {
    var address_prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : config.address_prefix;

    var prefix = public_key.slice(0, address_prefix.length);
    assert.equal(address_prefix, prefix, 'Expecting public_key to begin with ' + address_prefix + ', instead got ' + prefix);
    public_key = public_key.slice(address_prefix.length);

    public_key = new Buffer(bs58.decode(public_key), 'binary');
    var checksum = public_key.slice(-4);
    public_key = public_key.slice(0, -4);
    var new_checksum = hash.ripemd160(public_key);
    new_checksum = new_checksum.slice(0, 4);
    assert.deepEqual(checksum, new_checksum, 'Checksum did not match, ' + (checksum.toString('hex') + ' != ' + new_checksum.toString('hex')));
    return PublicKey.fromBuffer(public_key);
};

PublicKey.fromHex = function (hex) {
    return PublicKey.fromBuffer(new Buffer(hex, 'hex'));
};

PublicKey.fromStringHex = function (hex) {
    return PublicKey.fromString(new Buffer(hex, 'hex'));
};