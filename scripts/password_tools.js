
export async function generateAESKey() {
  const keySize = 256;
  const key = await window.crypto.subtle.generateKey(
    {
      name: 'AES-CBC',
      length: keySize
    },
    true,
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

export async function encryptBytesWithAes(bytes, key){ //return str
  const iv = window.crypto.getRandomValues(new Uint8Array(16));
  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: 'AES-CBC',
      iv: iv
    },
    key,
    bytes
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


export async function decryptBytesWithAes(encryptedData, key) { //return bytes
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
  const decryptedArray = new Uint8Array(decryptedData);
  return decryptedArray;
}

export async function generateDerivedKey(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const first16Bytes = hashArray.slice(0, 16);
  const keyBytes = new Uint8Array(first16Bytes)
  const key = await window.crypto.subtle.importKey(
    "raw", // Format de la clé : bytes bruts
    keyBytes, // Suite de bytes passée en paramètre
    { name: "AES-CBC" }, // Algorithme AES-CBC
    false, // Non-extractable : la clé ne peut pas être exportée
    ["encrypt", "decrypt"] // Opérations autorisées avec la clé
  );
  return key;
}

export async function storeDerivedKey(derivedKey) {
  const derivedKeyData = await window.crypto.subtle.exportKey('raw', derivedKey);
  const derivedKeyString = Array.from(new Uint8Array(derivedKeyData))
    .map(byte => byte.toString(16).padStart(2, '0'))
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


export async function storeAesKeyEncrypted(aesKey) {
  const exportedAesKey = await window.crypto.subtle.exportKey('raw', aesKey);
  const aesKeyBytes = new Uint8Array(exportedAesKey);
  const derivedKey = await generateDerivedKey("titi"); // Récupère la clé dérivée
  const encryptedAesKey = await encryptBytesWithAes(aesKeyBytes, derivedKey); // Chiffre la clé AES avec la clé dérivée
  localStorage.setItem('encryptedAesKey', encryptedAesKey);
}

  export async function decryptAesKey(encryptedAesKey, derivedKey) {
    if (encryptedAesKey) {
    
      const decryptedAesKey = await window.crypto.subtle.decrypt(
        {
          name: 'AES-CBC',
          iv: window.crypto.getRandomValues(new Uint8Array(16))
        },
        derivedKey,
        encryptedAesKey
      );
  
      const aesKey = await window.crypto.subtle.importKey(
        'raw',
        decryptedAesKey,
        {
          name: 'AES-CBC'
        },
        true,
        ['encrypt', 'decrypt']
      );
  
      return aesKey;
    } else {
      return null;
    }
  }
  
  export async function getAesKey() {
    const derivedKey = await generateDerivedKey("titi"); // Récupère la clé dérivée
    console.log(derivedKey);
    const encryptedAesKeyString = localStorage.getItem('encryptedAesKey');
    if (encryptedAesKeyString) {
      const decryptedAesKey = await decryptBytesWithAes(encryptedAesKeyString, derivedKey); // Déchiffre la clé AES chiffrée
      console.log(decryptedAesKey);
      const aesKey = await window.crypto.subtle.importKey(
        'raw',
        decryptedAesKey, //tableau de bytes
        {
          name: 'AES-CBC'
        },
        false,
        ['encrypt', 'decrypt']
      );
      console.log('AesKey :');
      console.log(aesKey);
      return aesKey;
    } else {
      return null;
    }
  }
  

  
   
  
  export async function storeLogs(url, id, psw) {
    try{
      var aesKey = await getAesKey();
      console.log(aesKey);
      const encryptedPsw = await encryptWithAES(psw, aesKey);
      localStorage.setItem("url_"+url, id + ';' + encryptedPsw);
      addNewUrl(url);
    }
    catch(error){
      console.log(error);
    }
  
  }
  
  export function storeUrlList(urlList) {
    // Convertir la liste en une chaîne de caractères
    const urlListString = urlList.join(';');
  
    // Stocker la chaîne de caractères dans le localStorage
    localStorage.setItem('urlList', urlListString);
  }
  
  export function getUrlList() {
    const urlListString = localStorage.getItem('urlList');
  
    if (urlListString) {
      const urlList = urlListString.split(';');
      return urlList;
    } else {
      return [];
    }
  }
  
  export function addNewUrl(url) {
    var urlList = getUrlList();
    // Vérification si l'URL existe déjà dans la liste
    if (!urlList.includes("url_"+url)) {
      urlList.push(url);
      storeUrlList(urlList);
    }
  }
  
  
  
  
  
  


