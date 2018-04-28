'use strict';

/* eslint-env mocha */
var assert = require('assert');

var ecc = require('.');

var PublicKey = ecc.PublicKey,
    PrivateKey = ecc.PrivateKey;


describe('Object API', function () {
  it('PrivateKey constructor', function () {
    PrivateKey.randomKey().then(function (privateKey) {
      assert(privateKey.toWif() === PrivateKey(privateKey.toWif()).toWif());
      assert(privateKey.toWif() === PrivateKey(privateKey.toBuffer()).toWif());
      assert(privateKey.toWif() === PrivateKey(privateKey).toWif());
      assert.throws(function () {
        return PrivateKey();
      }, /Invalid private key/);
    });
  });

  it('PublicKey constructor', function () {
    PrivateKey.randomKey().then(function (privateKey) {
      var publicKey = privateKey.toPublic();
      assert(publicKey.toString() === PublicKey(publicKey.toString()).toString());
      assert(publicKey.toString() === PublicKey(publicKey.toBuffer()).toString());
      assert(publicKey.toString() === PublicKey(publicKey).toString());
      assert.throws(function () {
        return PublicKey();
      }, /Invalid public key/);
    });
  });
});