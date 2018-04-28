"use strict";

var Aes = require("./aes");
var PrivateKey = require("./private_key");
var PublicKey = require("./public_key");
var Signature = require("./signature");
var key_utils = require("./key_utils");
var config = require('./config');
var hash = require("./hash");

/**
    [Wallet Import Format](https://en.bitcoin.it/wiki/Wallet_import_format)
    @typedef {string} wif
*/
/**
    XMXKey..
    @typedef {string} pubkey
*/

/** @namespace */
var ecc = {
    /**
      Initialize by running some self-checking code.  This should take a
      second to gather additional CPU entropy used during private key
      generation.
        Initialization happens once even if called multiple times.
        @return {Promise}
    */
    initialize: PrivateKey.initialize,

    /**
      Does not pause to gather CPU entropy.
      @return {Promise<PrivateKey>} test key
    */
    unsafeRandomKey: function unsafeRandomKey() {
        return PrivateKey.unsafeRandomKey().then(function (key) {
            return key.toString();
        });
    },

    /**
        @arg {number} [cpuEntropyBits = 0] gather additional entropy
        from a CPU mining algorithm.  This will already happen once by
        default.
          @return {Promise<wif>}
          @example
    ecc.randomKey().then(privateKey => {
    console.log(privateKey.toString())
    })
    */
    randomKey: function randomKey(cpuEntropyBits) {
        return PrivateKey.randomKey(cpuEntropyBits).then(function (key) {
            return key.toString();
        });
    },

    /**
          @arg {string} seed - any length string.  This is private.  The same
        seed produces the same private key every time.  At least 128 random
        bits should be used to produce a good private key.
        @return {wif}
          @example ecc.seedPrivate('secret') === wif
    */
    seedPrivate: function seedPrivate(seed) {
        return PrivateKey.fromSeed(seed).toString();
    },

    /**
        @arg {wif} wif
        @return {pubkey}
          @example ecc.privateToPublic(wif) === pubkey
    */
    privateToPublic: function privateToPublic(wif) {
        return PrivateKey(wif).toPublic().toString();
    },

    /**
        @arg {pubkey} pubkey - like XMAXKey..
        @return {boolean} valid
          @example ecc.isValidPublic(pubkey) === true
    */
    isValidPublic: function isValidPublic(pubkey) {
        return PublicKey.isValid(pubkey);
    },

    /**
        @arg {wif} wif
        @return {boolean} valid
          @example ecc.isValidPrivate(wif) === true
    */
    isValidPrivate: function isValidPrivate(wif) {
        return PrivateKey.isValid(wif);
    },

    /**
        Create a signature using data or a hash.
          @arg {string|Buffer} data
        @arg {wif|PrivateKey} privateKey
        @arg {boolean} [hashData = true] - sha256 hash data before signing
        @return {string} hex signature
          @example ecc.sign('I am alive', wif)
    */
    sign: function sign(data, privateKey) {
        var hashData = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
        return Signature[hashData ? 'sign' : 'signHash'](data, privateKey).toHex();
    },

    /**
        Verify signed data.
          @arg {string|Buffer} signature - buffer or hex string
        @arg {string|Buffer} data
        @arg {pubkey|PublicKey} pubkey
        @arg {boolean} [hashData = true] - sha256 hash data before verify
        @return {boolean}
          @example ecc.verify(signature, 'I am alive', pubkey) === true
    */
    verify: function verify(signature, data, pubkey) {
        var hashData = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

        signature = Signature.from(signature);
        var verify = signature[hashData ? 'verify' : 'verifyHash'];
        return verify(data, pubkey);
    },

    /**
        Recover the public key used to create the signature.
          @arg {String} signature (hex, etc..)
        @arg {String|Buffer} data
        @arg {boolean} [hashData = true] - sha256 hash data before recover
        @return {pubkey}
          @example ecc.recover(signature, 'I am alive') === pubkey
    */
    recover: function recover(signature, data) {
        var hashData = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

        signature = Signature.from(signature);
        var recover = signature[hashData ? 'recover' : 'recoverHash'];
        return recover(data).toString();
    },

    /** @arg {string|Buffer} data
        @arg {string} [encoding = 'hex'] - 'hex', 'binary' or 'base64'
        @return {string|Buffer} - Buffer when encoding is null, or string
          @example ecc.sha256('hashme') === '02208b..'
    */
    sha256: function sha256(data) {
        var encoding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'hex';
        return hash.sha256(data, encoding);
    }
};

module.exports = ecc;