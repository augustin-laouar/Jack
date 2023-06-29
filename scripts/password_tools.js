export async function storeLogs(url, id, psw) {
  const aesKey = await generateAESKey();
  const encryptedPsw = await encryptWithAES(psw, aesKey);

  localStorage.setItem(url, id + ';' + encryptedPsw);
  addNewUrl(url);
  storeAesKey(aesKey);
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
  if (!urlList.includes(url)) {
    urlList.push(url);
    storeUrlList(urlList);
  }
}

async function generateAESKey() {
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

async function encryptWithAES(data, key) {
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

function storeAesKey(key) {
  localStorage.setItem('aesKey', key);
}
