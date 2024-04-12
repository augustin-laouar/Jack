import * as errorManager from '../exception/passwordError.js';
const letterAndNumber = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const allCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=[]{}|:;"<>,.?/~`';

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
  /*export async function storeLogs(url, id, psw){
      const aesKey = await getDerivedKey();
      const encryptedPsw = await encryptWithAES(psw, aesKey);
      const encryptedId = await encryptWithAES(id, aesKey);
      localStorage.setItem("logs_"+url, encryptedId + ';' + encryptedPsw);
  }*/
  function generateRandomString(characters, length) {
    let randomString = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }
    return randomString;
  }

  function isInLogList(id, logsList){ 
    if(logsList.includes(id)){
      return true;
    }
    return false;
  }

  function generateNewId(){
    var logsList = getLogsList();
    var newId = generateRandomString(letterAndNumber,10);
    while(isInLogList(newId, logsList)){
      newId = generateRandomString(letterAndNumber, 10);
    }
    return newId;
  }

  export async function storeLogs(id, url, username, psw){
    console.log(url);
    console.log(username);
    console.log(psw);

    const aesKey = await getDerivedKey();
    const encryptedUrl = await encryptWithAES(url, aesKey);
    const encryptedUsername = await encryptWithAES(username, aesKey);
    const encryptedPsw = await encryptWithAES(psw, aesKey);
    localStorage.setItem("l_" + id , encryptedUrl + ';' + encryptedUsername + ';' + encryptedPsw);
}


  export function deleteLogs(id){
    localStorage.removeItem("l_" + id);
    var logsList = getLogsList();
    var index = logsList.indexOf(id);
    if(index !== -1){
      logsList.splice(index, 1);
    }
    storeLogsList(logsList);
  }



  export async function createLogs(url, username, psw) {
    try{
        const newId = generateNewId();
        pushIdInLogsList(newId);
        await storeLogs(newId, url, username, psw);
    }
    catch(error){
      throw errorManager.Error(2,1);
    }
  }
  
  export async function udpateLogs(id, url, username, psw) {
    try{
      var logsList = getLogsList();
      if(isInLogList(id, logsList)){
        await storeLogs(id, url, username, psw);
      }
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
  
  export function pushIdInLogsList(id) {
    var logsList = getLogsList();
    logsList.push(id);
    storeLogsList(logsList);
  }
  
  export async function getLogs(id){
    var encryptedData = localStorage.getItem("l_" + id);
    if(encryptedData === null){
      return null;
    }
    var encryptedData = encryptedData.split(';');
    var key = await getDerivedKey();
    const url = await decryptWithAESKey(encryptedData[0], key);
    const username = await decryptWithAESKey(encryptedData[1], key);
    const psw = await decryptWithAESKey(encryptedData[2], key);
    return {id: id, url: url, username: username, password: psw};
  }