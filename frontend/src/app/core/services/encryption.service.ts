import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../../environments/environment';

// ─────────────────────────────────────────────────────────────────
// EncryptionService
// Mirrors the backend AES-256-CBC logic exactly.
// Uses the same ENCRYPTION_KEY from environment variables.
// Format: "ivHex:encryptedBase64"
// ─────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class EncryptionService {
  // Derive 32-byte key from env string using SHA-256 (matches backend)
  private getKey(): CryptoJS.lib.WordArray {
    return CryptoJS.SHA256(environment.encryptionKey);
  }

  /**
   * Encrypt any JS object/value to "ivHex:encryptedBase64" string
   */
  encrypt(data: any): string {
    const key = this.getKey();
    const iv = CryptoJS.lib.WordArray.random(16); // 16 bytes = 128-bit IV
    const jsonStr = JSON.stringify(data);

    const encrypted = CryptoJS.AES.encrypt(jsonStr, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const ivHex = CryptoJS.enc.Hex.stringify(iv);
    const encryptedBase64 = encrypted.ciphertext.toString(CryptoJS.enc.Base64);

    return `${ivHex}:${encryptedBase64}`;
  }

  /**
   * Decrypt "ivHex:encryptedBase64" string back to original JS object
   */
  decrypt(encryptedStr: string): any {
    const key = this.getKey();
    const [ivHex, encryptedBase64] = encryptedStr.split(':');

    if (!ivHex || !encryptedBase64) {
      throw new Error('Invalid encrypted payload format');
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

    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
  }
}
