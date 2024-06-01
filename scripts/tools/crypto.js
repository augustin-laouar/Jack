import * as storage from './storage.js';

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


// DERIVED KEY
export async function generateDerivedKey(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const first32Bytes = hashArray.slice(0, 32);
    const keyBytes = new Uint8Array(first32Bytes)
    const key = await window.crypto.subtle.importKey(
      "raw", // Format de la clé : bytes bruts
      keyBytes, // Suite de bytes passée en paramètre
      { name: "AES-CBC" }, // Algorithme AES-CBC
      true, // exportable
      ["encrypt", "decrypt"] // Opérations autorisées avec la clé
    );
    return key;
  }

export async function storeDerivedKey(derivedKey) {
    const derivedKeyData = await window.crypto.subtle.exportKey('raw', derivedKey);
    const derivedKeyString = Array.from(new Uint8Array(derivedKeyData))
      .map(byte => byte.toString(32).padStart(2, '0'))
      .join('');
    const jsonData = {derivedKey: derivedKeyString};
    await storage.store(jsonData);
}

export async function getDerivedKey() {
    const derivedKeyString = await storage.read('derivedKey');
    if (derivedKeyString) {
      const keyData = new Uint8Array(derivedKeyString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
      const derivedKey = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        {
          name: 'AES-CBC'
        },
        false,
        ['encrypt', 'decrypt']
      );
      return derivedKey;
    } 
    else {
      return null;
    }
  }

  export function deleteDerivedKey(){
    const zeros = Array.from(new Uint8Array(32))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
    const jsonData = {derivedKey: zeros};
    storage.store(jsonData);
  }
  

  // HASH
  //TODO : Add salt
  async function hashPassword(psw) {
    const encoder = new TextEncoder();
    const data = encoder.encode(psw);
    const hash = await window.crypto.subtle.digest('SHA-512', data);
    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  export async function storeHashedPassword(psw) {
    const hashedpsw = await hashPassword(psw);
    const jsonData = {masterPswHash: hashedpsw};
    await storage.store(jsonData);
  }
  
  export async function validPassword(psw) {
    try {
      const hashedpsw = await hashPassword(psw);
      const storedHash = await storage.get('masterPswHash');
      return hashedpsw === storedHash;
    } catch (error) {
      return false;
    }
  }