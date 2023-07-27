
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





  




  //LocalStorage
  export async function storeLogs(url, id, psw) {
    try{
      var aesKey = await generateDerivedKey("titi"); // ici mettre get derived key
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
  