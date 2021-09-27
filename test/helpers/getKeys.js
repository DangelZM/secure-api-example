const {promisify} = require('util');
const {generateKeyPair} = require('crypto');
const asyncGenerateKeyPair = promisify(generateKeyPair);

module.exports = async (passphrase) => {
  const {publicKey, privateKey} = await asyncGenerateKeyPair('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
      cipher: 'aes-256-cbc',
      passphrase
    }
  });
  return {publicKey, privateKey};
}
