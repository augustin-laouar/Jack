import * as errorManager from '../exception/passwordError.js';

//SIMPLE AES

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


export async function decryptWithAESKey(encryptedData, key) {
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
  localStorage.setItem('derivedKey', derivedKeyString);
}

export async function getDerivedKey() {
  const derivedKeyString = localStorage.getItem('derivedKey');
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
  } else {
    return null;
  }
}
//replace the key by 16 bytes at 0
export function deleteDerivedKey(){
  const zeros = Array.from(new Uint8Array(32))
  .map(byte => byte.toString(16).padStart(2, '0'))
  .join('');
  localStorage.setItem('derivedKey', zeros);
}




  




  //LocalStorage
  export async function storeLogs(url, id, psw){
      const aesKey = await getDerivedKey();
      const encryptedPsw = await encryptWithAES(psw, aesKey);
      const encryptedId = await encryptWithAES(id, aesKey);
      localStorage.setItem("logs_"+url, encryptedId + ';' + encryptedPsw);
  }

  export function deleteLogs(url){
    localStorage.removeItem("logs_" + url);
    var logsList = getLogsList();
    var index = logsList.indexOf(url);
    if(index !== -1){
      logsList.splice(index, 1);
    }
    storeLogsList(logsList);
  }



  export async function createLogs(url, id, psw) {
    try{
        addNewUrl(url);
        await storeLogs(url, id, psw);
    }
    catch(error){
      throw errorManager.Error(2,1);
    }
  
  }
  
  export function storeLogsList(logsList) {
    // Convertir la liste en une chaîne de caractères
    const logsListStr = logsList.join(';');
  
    // Stocker la chaîne de caractères dans le localStorage
    localStorage.setItem('logsList', logsListStr);
  }
  
  export function getLogsList() {
    const urlListString = localStorage.getItem('logsList');
    if (urlListString) {
      const urlList = urlListString.split(';');
      return urlList;
    } else {
      return [];
    }
  }
  
  export function addNewUrl(url) {
    var logsList = getLogsList();
    // Vérification si l'URL existe déjà dans la liste
    if (!logsList.includes(url)) {
      logsList.push(url);
      storeLogsList(logsList);
      return true;
    }
    return false;
  }
  
  export async function getLogs(logsUrl){
    var encryptedData = localStorage.getItem("logs_" + logsUrl);
    if(encryptedData === null){
      return null;
    }
    var encryptedData = encryptedData.split(';');
    var key = await getDerivedKey();
    var id = await decryptWithAESKey(encryptedData[0], key);
    var psw = await decryptWithAESKey(encryptedData[1], key);
    return {url : logsUrl, id : id, password : psw};
  }