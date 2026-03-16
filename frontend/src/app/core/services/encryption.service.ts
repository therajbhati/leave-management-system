import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EncryptionService {
  private getKey(): CryptoJS.lib.WordArray {
    return CryptoJS.SHA256(String(environment.encryptionKey));
  }

  encrypt(data: any): string {
    const key = this.getKey();
    const iv = CryptoJS.lib.WordArray.random(16);
    const json = JSON.stringify(data);

    const encrypted = CryptoJS.AES.encrypt(json, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const ivHex = CryptoJS.enc.Hex.stringify(iv);
    const encryptedBase64 = encrypted.ciphertext.toString(CryptoJS.enc.Base64);

    return `${ivHex}:${encryptedBase64}`;
  }

  decrypt(encryptedStr: string): any {
    const key = this.getKey();
    const parts = encryptedStr.split(':');

    //  validate format before trying to decrypt
    if (parts.length !== 2) {
      throw new Error(
        `Invalid format. Expected "ivHex:base64", got: ${encryptedStr.substring(0, 30)}...`,
      );
    }

    const [ivHex, encryptedBase64] = parts;

    if (!ivHex || !encryptedBase64) {
      throw new Error('Missing IV or ciphertext');
    }

    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(encryptedBase64),
    });

    const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const utf8 = decrypted.toString(CryptoJS.enc.Utf8);

    //  check decryption produced actual text
    if (!utf8) {
      throw new Error('Decryption produced empty string — ENCRYPTION_KEY mismatch?');
    }

    return JSON.parse(utf8);
  }
}
