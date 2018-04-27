const bs58 = require('bs58');
const ecurve = require('ecurve');
const secp256k1 = ecurve.getCurveByName('secp256k1');
const assert = require('assert');
const bigi = require('bigi');

const hash = require('./hash');
const config = require('./config');


module.exports = PublicKey

/** @param {ecurve.Point} public key */
function PublicKey(Q) {

    if(typeof Q === 'string') {
        const publicKey = PublicKey.fromString(Q)
        assert(publicKey != null, 'Invalid public key')
        return publicKey
    } else if(Buffer.isBuffer(Q)) {
        return PublicKey.fromBuffer(Q)
    } else if(typeof Q === 'object' && Q.Q) {
      return PublicKey(Q.Q)
    }

    if(typeof Q !== 'object' || typeof Q.compressed !== 'boolean') {
        throw new TypeError('Invalid public key')
    }

    function toBuffer(compressed = Q.compressed) {
        return Q.getEncoded(compressed);
    }

    let pubdata // cache
    
    /**
        Full public key
        @return {string} XMAXKey..
    */
    function toString(address_prefix = config.address_prefix) {
        if(pubdata) {
            return address_prefix + pubdata
        }
        const pub_buf = toBuffer();
        const checksum = hash.ripemd160(pub_buf);
        const addy = Buffer.concat([pub_buf, checksum.slice(0, 4)]);
        pubdata = bs58.encode(addy)
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
        Q,
        toString,
        toUncompressed,
        toBuffer,
        toHex
    }
}

PublicKey.isValid = function(text) {
    try {
        PublicKey(text)
        return true
    } catch(e) {
        return false
    }
}

PublicKey.fromBinary = function(bin) {
    return PublicKey.fromBuffer(new Buffer(bin, 'binary'));
}

PublicKey.fromBuffer = function(buffer) {
    return PublicKey(ecurve.Point.decodeFrom(secp256k1, buffer));
}

PublicKey.fromPoint = function(point) {
    return PublicKey(point);
}

/**
    @arg {string} public_key - like XMXXyz...
    @arg {string} address_prefix - like XMX
    @return PublicKey or `null` (if the public_key string is invalid)
    @deprecated fromPublicKeyString (use fromString instead)
*/
PublicKey.fromString = function(public_key, addres_sprefix = config.address_prefix) {
    try {
        return PublicKey.fromStringOrThrow(public_key, address_prefix)
    } catch (e) {
        return null;
    }
}

/**
    @arg {string} public_key - like XMXKey..
    @arg {string} address_prefix - like XMX
    @throws {Error} if public key is invalid
    @return PublicKey
*/
PublicKey.fromStringOrThrow = function(public_key, address_prefix = config.address_prefix) {
    var prefix = public_key.slice(0, address_prefix.length);
    assert.equal(
        address_prefix, prefix,
        `Expecting public_key to begin with ${address_prefix}, instead got ${prefix}`);
        public_key = public_key.slice(address_prefix.length);

    public_key = new Buffer(bs58.decode(public_key), 'binary');
    var checksum = public_key.slice(-4);
    public_key = public_key.slice(0, -4);
    var new_checksum = hash.ripemd160(public_key);
    new_checksum = new_checksum.slice(0, 4);
    assert.deepEqual(checksum, new_checksum,
      'Checksum did not match, ' +
      `${checksum.toString('hex')} != ${new_checksum.toString('hex')}`
    );
    return PublicKey.fromBuffer(public_key);
}

PublicKey.fromHex = function(hex) {
    return PublicKey.fromBuffer(new Buffer(hex, 'hex'));
}

PublicKey.fromStringHex = function(hex) {
    return PublicKey.fromString(new Buffer(hex, 'hex'));
}
