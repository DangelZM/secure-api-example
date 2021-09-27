const {privateDecrypt} = require('crypto');
const getKeys = require('./helpers/getKeys');
const passphrase = "secret password";

let request = require('supertest');
request = request('http://localhost:9080/api');

const {assert} = require('chai');
const patterns = {
  id: new RegExp('^[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12}')
}

const payload = {
  firstname: 'John',
  lastname: 'Dow',
  passport: '4141414141414141414141'
}

let id;
let encryptedDataKey;
let publicKey;
let privateKey
describe('Api Controller', () => {
  before(async () => {
    const keys = await getKeys(passphrase);
    publicKey = keys.publicKey;
    privateKey = keys.privateKey;
  });

  it('should be able to save data', (done) => {
    request
      .post(`/`)
      .send({
        publicKey: Buffer.from(publicKey).toString('base64'),
        payload
      })
      .expect(201)
      .expect((res) => {
        assert.isObject(res.body);

        assert.property(res.body, 'id');
        assert.match(res.body.id, patterns.id);
        id = res.body.id;

        assert.property(res.body, 'encryptedDataKey');
        assert.isString(res.body.encryptedDataKey);
        encryptedDataKey = res.body.encryptedDataKey;
      })
      .end(done);
  });

  it('should be able to get data', (done) => {
    const key = privateDecrypt(
      {key: privateKey.toString(), passphrase},
      Buffer.from(encryptedDataKey, 'base64')
    ).toString();

    request.get(`/${id}?key=${key}`)
      .expect(200)
      .expect((res) => {
        assert.isObject(res.body);
        assert.deepEqual(res.body, payload);
      })
      .end(done);
  });

  it('should reject invalid key', (done) => {
    request.get(`/${id}?key=wrongkey`)
      .expect(401)
      .end(done);
  });
});
