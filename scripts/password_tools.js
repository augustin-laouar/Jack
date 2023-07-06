
export async function storeLogs(url, id, psw) {
  const aesKey = await getAesKey();
  console.log(aesKey);

  const encryptedPsw = await encryptWithAES(psw, aesKey);

  localStorage.setItem("url_"+url, id + ';' + encryptedPsw);
  addNewUrl(url);
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

export function storeAesKey(key) {
  return window.crypto.subtle.exportKey('raw', key)
    .then(keyData => {
      const keyString = Array.from(new Uint8Array(keyData))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
      localStorage.setItem('aesKey', keyString);
    });
  }

  export async function getAesKey() {
    const aesKeyString = localStorage.getItem('aesKey');
    if (aesKeyString) {
      const keyData = new Uint8Array(aesKeyString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
      const aesKey = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        {
          name: 'AES-CBC'
        },
        false,
        ['encrypt', 'decrypt']
      );
      return aesKey;
    } else {
      return null;
    }
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



