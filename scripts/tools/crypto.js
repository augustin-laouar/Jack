import * as storage from './storage.js';

// DERIVED KEY
export async function generateDerivedKey(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const first32Bytes = hashArray.slice(0, 32);
  const keyBytes = new Uint8Array(first32Bytes)
  const key = await window.crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-CBC' },
    false, // not exportable
    ['encrypt', 'decrypt']
  );
  return key;
}

export async function encryptWithAES(data, key) {
    const encodedData = new TextEncoder().encode(data);
  
    const iv = window.crypto.getRandomValues(new Uint8Array(16));
  
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: 'AES-CBC',
        iv: iv
      },
      key,
      encodedData
    );
  
    const encryptedArray = new Uint8Array(encryptedData);
    const encryptedHex = Array.prototype.map
      .call(encryptedArray, byte => ('00' + byte.toString(16)).slice(-2))
      .join('');
  
    const ivHex = Array.prototype.map
      .call(iv, byte => ('00' + byte.toString(16)).slice(-2))
      .join('');
  
    const encryptedResult = ivHex + encryptedHex;
    return encryptedResult;
  }

  export async function decryptWithAES(encryptedData, key) {
    const ivHex = encryptedData.substr(0, 32);
    const encryptedHex = encryptedData.substr(32);
  
    const iv = new Uint8Array(ivHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const encryptedArray = new Uint8Array(encryptedHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: 'AES-CBC',
        iv: iv
      },
      key,
      encryptedArray
    );
    const decryptedString = new TextDecoder().decode(decryptedData);
    return decryptedString;
  }


  //HASH WITH SALT
function generateSalt(length = 16) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return Array.from(array).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function hashPassword(psw, salt) {
    const encoder = new TextEncoder();
    const data = encoder.encode(psw + salt);
    const hash = await window.crypto.subtle.digest('SHA-512', data);
    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

export async function hashPasswordWithSalt(psw) {
    const salt = generateSalt();
    const hashedPsw = await hashPassword(psw, salt);
    const combinedHash = `${salt}:${hashedPsw}`;
    return combinedHash;
}

export async function isValidHash(psw, combinedHash) {
    try {
        const [salt, hash] = combinedHash.split(':');
        const hashedPsw = await hashPassword(psw, salt);
        return hashedPsw === hash;
    } catch (e) {
        return false;
    }
}

