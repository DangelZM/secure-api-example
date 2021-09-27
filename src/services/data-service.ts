import {createCipheriv, publicEncrypt, randomBytes, pbkdf2, createDecipheriv} from "crypto";
import { v4 as uuid } from 'uuid';
import {promisify} from 'util';
const asyncRandomBytes = promisify(randomBytes);
const asyncPbkdf2 = promisify(pbkdf2);

import HttpStatus from "http-status";
import { OperationError } from "../common/operation-error";

const algorithm = 'aes256';
const inputEncoding = 'utf8';
const outputEncoding = 'hex';

export interface IUser {
  firstname: string,
  lastname: string,
  passport: string
}

export interface ISaveRequest {
  payload: IUser;
  publicKey: string;
}

export interface ISaveResponse {
  id: string;
  encryptedDataKey: string
}

const Storage: any = {};

export class DataService {
  public async save({payload, publicKey}: ISaveRequest): Promise<ISaveResponse> {
    const id = uuid();
    const data = JSON.stringify(payload);
    const plainPublicKey = Buffer.from(publicKey, 'base64');

    const keyBytes = await asyncRandomBytes(32);
    const key = keyBytes.toString('hex').slice(0, 32);
    const iv = await asyncRandomBytes(16);

    const cipher = createCipheriv(algorithm, key, iv);
    let ciphered = cipher.update(data, inputEncoding, outputEncoding);
    ciphered += cipher.final(outputEncoding);
    const encryptedData = iv.toString(outputEncoding) + ':' + ciphered;
    const encryptedDataKey = publicEncrypt(plainPublicKey, Buffer.from(key)).toString('base64');

    const saltBytes = await asyncRandomBytes(64);
    const salt = saltBytes.toString('base64');

    const hashBuffer = await asyncPbkdf2(key, salt, 10000, 512, 'sha512');
    const hash = hashBuffer.toString('base64');

    Storage[id] = {hash, salt, encryptedData};

    return {id, encryptedDataKey};
  }

  public async get(id: string, key: string) {
    if (!Storage[id]) throw new OperationError("NOT_FOUND", HttpStatus.NOT_FOUND);
    const {hash, salt, encryptedData} = Storage[id];

    const hashCheckBuffer = await asyncPbkdf2(key.toString(), salt, 10000, 512, 'sha512');
    const hashCheck = hashCheckBuffer.toString('base64');
    if (hashCheck !== hash) throw new OperationError("UNAUTHORIZED", HttpStatus.UNAUTHORIZED);

    const components = encryptedData.split(':');
    const iv = Buffer.from(components.shift(), outputEncoding);
    const decipher = createDecipheriv(algorithm, key.toString(), iv);
    let deciphered = decipher.update(components.join(':'), outputEncoding, inputEncoding);
    deciphered += decipher.final(inputEncoding);
    return JSON.parse(deciphered);
  }
}
