import * as pswTools from './password_tools.js';

export const baseUrl = 'https://api.mail.tm';


export class MailAccount {
    constructor(addr, psw, id, createdAt){
        this.address = addr;
        this.password = psw;
        this.token = '';
        this.id = id;
        this.createdAt = createdAt;

    }
}
//MESSAGES 
export class MessageMin {
  constructor(createdAt, from, subject, intro, id, seen, hasAttachments) {
    this.createdAt = createdAt;
    this.from = from;
    this.subject = subject;
    this.intro = intro;
    this.id = id;
    this.seen = seen;
    this.hasAttachments = hasAttachments;
  }
}
export class Message {
  constructor(context, id, type, accountId, attachments, bcc, cc, createdAt, downloadUrl, flagged, from, hasAttachments, html, messageId, isDeleted, msgId, retention, retentionDate, seen, size, subject, text, to, updatedAt, verifications) {
    this.context = context;
    this.id = id;
    this.type = type;
    this.accountId = accountId;
    this.attachments = attachments;
    this.bcc = bcc;
    this.cc = cc;
    this.createdAt = createdAt;
    this.downloadUrl = downloadUrl;
    this.flagged = flagged;
    this.from = from;
    this.hasAttachments = hasAttachments;
    this.html = html;
    this.messageId = messageId;
    this.isDeleted = isDeleted;
    this.msgId = msgId;
    this.retention = retention;
    this.retentionDate = retentionDate;
    this.seen = seen;
    this.size = size;
    this.subject = subject;
    this.text = text;
    this.to = to;
    this.updatedAt = updatedAt;
    this.verifications = verifications;
  }
}


export function initMessageFromJson(jsonResponse){
  const message = new Message(
    jsonResponse["@context"],
    jsonResponse["@id"],
    jsonResponse["@type"],
    jsonResponse["accountId"],
    jsonResponse["attachments"], 
    jsonResponse["bcc"], 
    jsonResponse["cc"], 
    jsonResponse["createdAt"],
    jsonResponse["downloadUrl"],
    jsonResponse["flagged"],
    jsonResponse["from"], 
    jsonResponse["hasAttachments"],
    jsonResponse["html"], 
    jsonResponse["id"],
    jsonResponse["isDeleted"],
    jsonResponse["msgid"],
    jsonResponse["retention"],
    jsonResponse["retentionDate"],
    jsonResponse["seen"],
    jsonResponse["size"],
    jsonResponse["subject"],
    jsonResponse["text"],
    jsonResponse["to"], 
    jsonResponse["updatedAt"],
    jsonResponse["verifications"]
  );
  return message;
}
export const maxEmailNumber = 10;


//FUNCTION TO REQUEST API


export async function sendRequest(url, method, params, token) {
    try {
      // Construire les paramètres de requête
      let queryParams = '';
      if (params) {
        const keys = Object.keys(params);
        queryParams = keys.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join('&');
      }
      var contentType = 'application/json';
      if(method === 'PATCH'){
        contentType = 'application/ld+json';
      }
      const requestOptions = {
        method: method,
        headers: {
          'Content-Type': contentType
        }
      };

      if (token) {
        requestOptions.headers['Authorization'] = `Bearer ${token}`;
      }
  
      // Ajouter les paramètres à l'URL pour les méthodes GET et DELETE
      if (method === 'GET' || method === 'DELETE') {
        url = `${url}?${queryParams}`;
      } else {
        requestOptions.body = JSON.stringify(params);
      }
      const response = await fetch(url, requestOptions);
      var data;
      try{
        data = await response.json();
      }
      catch{
        data = null;
      }
      // Récupérer le code de réponse HTTP
      const statusCode = response.status;
  
      if (response.ok) {
        return data;
      } else {
        throw new Error('La requête a échoué avec un code de statut HTTP ' + statusCode);
      }
    } catch (error) {
      console.error(error.message);
      throw new Error('Une erreur s\'est produite lors de l\'envoi de la requête.');
    }
  }


export async function getDomains() {
    try {
      const response = await sendRequest(baseUrl + '/domains', 'GET', null);
      return response["hydra:member"][0].domain;
    } catch (error) {
      throw new Error('Erreur récupération domaines');
    }
  }

export async function login(myMail){ //recupere le token qui permet de s'authentifier sur les futurs requests
    try{
        const params = {address : myMail.address, password : myMail.password};
        const response = await sendRequest(baseUrl + '/token', 'POST', params);
        myMail.token = response.token;
        return true;
    } catch(error){
        console.log(error);
        return false;
    }

}


export async function createAccount(addr, psw){
    try {
        var dom = await getDomains();
        var newAddr = addr + '@' + dom;
        const params = { address: newAddr, password: psw };
        var res = await sendRequest(baseUrl + '/accounts', 'POST', params);
        var currMail = new MailAccount(res.address, psw, res.id, res.createdAt);
        return {answer : true, mail : currMail};
    } catch (error) {
        console.log(error);
        return {answer : false, mail : null};
    }
}

export async function getAccount(myMail) {
  try{
    const params = {};
    response = await sendRequest(baseUrl + '/accounts/' + myMail.id, 'GET', params, myMail.token );
    return true;
  } catch(error){
    console.log(error);
    return false;
  }

}

export async function me(myMail){
  try{
    const params = {};
    response = await sendRequest(baseUrl + '/me', 'GET', params, myMail.token );
    return true;
  } catch(error){
    console.log(error);
    return false;
  }
}

export async function deleteAccount(myMail){
  try{
    const params = {};
    response = await sendRequest(baseUrl + '/accounts/' + myMail.id, 'DELETE', params, myMail.token );
    return true;
  } catch(error){
    console.log(error);
    return false;
  }
}

export async function getMessages(myMail, pageNumber = 1){ 
  try{
    const params = {page : pageNumber};
    var response = await sendRequest(baseUrl + '/messages', 'GET', params, myMail.token );
    console.log(response["hydra:totalItems"]);
    const totalItems = response["hydra:totalItems"];
    var hasMoreMessages = false;
    if(totalItems > pageNumber * 30){
      hasMoreMessages = true;
    }
    const messages = response["hydra:member"].map((msg) => {
      return new MessageMin(
        msg.createdAt,
        msg.from,
        msg.subject,
        msg.intro,
        msg.id,
        msg.seen,
        msg.hasAttachments
      );
    });
    return {messages, hasMoreMessages, totalItems};
  } catch(error){
    console.log(error);
    return null;
  }
}

export async function getMessage(myMail, messageId){
  try{
    const params = {};
    var response = await sendRequest(baseUrl + '/messages/' + messageId, 'GET', params, myMail.token );
    return initMessageFromJson(response);
  } catch(error){
    console.log(error);
    return null;
  }
}

export async function deleteMessage(myMail, messageId){
  try{
    const params = {};
    await sendRequest(baseUrl + '/messages/' + messageId, 'DELETE', params, myMail.token);
    return true;
  } catch(error){
    console.log(error);
    return false;
  }
}

export async function marksAsRead(myMail, messageId){
  try{
    const params = {
      "seen" : true
    };
    await sendRequest(baseUrl + '/messages/' + messageId, 'PATCH', params, myMail.token);
    return true;
  } catch(error){
    console.log(error);
    return false;
  }
}

export async function marksAsUnread(myMail, messageId){
  try{
    const params = {
      "seen" : false
    };
    await sendRequest(baseUrl + '/messages/' + messageId, 'PATCH', params, myMail.token);
    return true;
  } catch(error){
    console.log(error);
    return false;
  }
}



//FUNCTION FOR LOCAL STORAGE

export function storeEmailList(emailList) {
  // Convertir la liste en une chaîne de caractères
  const emailListString = emailList.join(';');

  // Stocker la chaîne de caractères dans le localStorage
  localStorage.setItem('emailList', emailListString);
}


export function getEmailList() {
  const emailListString = localStorage.getItem('emailList');

  if (emailListString) {
    const emailList = emailListString.split(';');
    return emailList;
  } else {
    return [];
  }
}


function minIdAvailable(emailList){
  if(emailList.length >= maxEmailNumber){
    throw Error('Bad call');
  }
  if(emailList.length === 0){
    return 1;
  }
  let min = 1;
  let found = false;

  while (!found) {
    found = true; 

    for (const id of emailList) {
      if (id == min) {
        found = false; 
        break;
      }
    }

    if (!found) {
      min++; 
    }
  }
  return min;
}

export function pushNewIdInEmailList() { //return 0 = error, else return the new ID added
  var emailList = getEmailList();
  if(emailList.length >= maxEmailNumber){
    return 0;
  }
  else{
    var minId = minIdAvailable(emailList);
    emailList.push(minId);
    storeEmailList(emailList);
    return minId;
  }
}

export async function storeAccount(emailId, myMail){ // not a secure function (no verification). Be careful using it
  const jsonEmail = JSON.stringify(myMail);
  const aesKey = await pswTools.getAesKey();
  const encryptedJsonEmail = await pswTools.encryptWithAES(jsonEmail, aesKey);
  localStorage.setItem(emailId, encryptedJsonEmail);
}


export async function createAndStoreAccount(addr, psw){
  if(getEmailList().length >= maxEmailNumber){
    throw Error('You have already '+ maxEmailNumber + 'email address');
  }
  var res = await createAccount(addr, psw);
  if(res.answer) {
    var newId = pushNewIdInEmailList();
    await storeAccount('email_' + newId, res.mail);
  }
  else{
    throw Error('Error during email creation. This email is maybe already taken.');
  }
}

function generateRandomString(characters, length) {
  let randomString = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  
  return randomString;
}

export async function createAndStoreRandomAccount() { 
  if(getEmailList().length >= maxEmailNumber){
    throw Error('You have already '+ maxEmailNumber + 'email address');
  }
  const letterAndNumber = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const allCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=[]{}|:;"<>,.?/~`';
  var addr = generateRandomString(letterAndNumber, 10);
  var psw = generateRandomString(allCharacters,15);
  var res = await createAccount(addr, psw);
  var tryCounter = 0;
  while(!res.answer) {
    if(tryCounter == 15){
      throw Error('Error during email creation.');
    }
    addr = generateRandomString(letterAndNumber, 10);
    tryCounter ++;
  }
  var newId = pushNewIdInEmailList();
  await storeAccount('email_' + newId, res.mail);
}

export async function getAccountStored(emailNumber){
  if(emailNumber >= maxEmailNumber){
    return null;
  }
  const aesKey = await pswTools.getAesKey();
  const decryptedJsonEmail = await pswTools.decryptWithAESKey(localStorage.getItem('email_' + emailNumber), aesKey);
  return JSON.parse(decryptedJsonEmail);
}

export async function getEmailAddressAssociated(emailNumber) {
  const res = await getAccountStored(emailNumber);
  return res.address;
}

export async function getEmailIdAssociated(emailNumber) {
  const res = await getAccountStored(emailNumber);
  return res.id;
}

export async function deleteAccountStored(emailNumber) {
  if(emailNumber >= maxEmailNumber){
    return;
  }

  //request API to delete this account
  var mailToDelete = await getAccountStored(emailNumber);
  var res = await deleteAccount(mailToDelete);
  if(!res){
    throw ('Error during deleting this email address');
  }

  //delete this account from available email list
  var emailList = getEmailList();
  var newEmailList = [];
  for(const id of emailList) {
    if(id !== emailNumber){
      newEmailList.push(id);
    }
  }
  storeEmailList(newEmailList);

  //set every value stored about this email at empty
  mail = new MailAccount('','','','');
  var jsonEmail = JSON.stringify(mail);
  localStorage.setItem('email_' + emailNumber,  jsonEmail);
}


// MESSAGES

export async function downloadMessage(myMail, myMessage) {
  const requestOptions = {
    method: 'GET',
    headers: {
      'Accept': 'text/html'
    }
  };

  if (myMail.token) {
    requestOptions.headers['Authorization'] = `Bearer ${myMail.token}`;
  }

  const response = await fetch(baseUrl + myMessage.downloadUrl, requestOptions);
  const htmlContent = await response.text();
  return htmlContent;
  
}


function replaceAllOccurrences(text, regex, replacements) {
  let currentIndex = 0;
  const modifiedText = text.replace(regex, (match) => {
    const replacement = replacements[currentIndex % replacements.length];
    currentIndex++;
    return replacement;
  });
  return modifiedText;
}

function extractImgTags(htmlString) {
  const regex = /<img[\s\S]*?src=[\s\S]*?>/gi;
  const imgTags = htmlString.match(regex) || [];
  return imgTags;
}

function findAttachmentSrc(inputString) {
  const regex = /src="attachment:([a-zA-Z0-9]+)"/i;
  const match = inputString.match(regex);
  
  if (match) {
    const attachment = match[1];
    return attachment;
  }
  
  return null;
}

async function downloadAndEncodeImage(url, token) {
  try {
    const headers = new Headers();
    headers.set('Authorization', `Bearer ${token}`);

    const response = await fetch(url, { headers });
    const blob = await response.blob();

    const reader = new FileReader();
    reader.readAsDataURL(blob);

    return new Promise((resolve, reject) => {
      reader.onloadend = () => {
        const base64String = reader.result;
        resolve(base64String);
      };

      reader.onerror = () => {
        reject('Une erreur s\'est produite lors de la conversion de l\'image en base64.');
      };
    });
  } catch (error) {
    throw new Error('Une erreur s\'est produite lors du téléchargement de l\'image.');
  }
}
async function getNewSrc(oldTag, messageId, token) {
  const attachementId = findAttachmentSrc(oldTag);
  if(attachementId !== null){
    const downloadUrl = baseUrl + messageId + '/attachment/' + attachementId;
    try {
      const base64String = await downloadAndEncodeImage(downloadUrl, token);
      const replacementString = 'src="' + base64String + '"';
      return replacementString;
    } catch (error) {
      console.error(error);
    }
  }
  else{
    return null;
  }
}

async function replaceSrc(imgTags, messageId, token) {
  const modifiedImgTags = await Promise.all(imgTags.map(async (tag) => {
    const oldTag = tag;
    const replacementString = await getNewSrc(oldTag, messageId, token);
    if (replacementString !== null) {
      const newTag = tag.replace(/src="[\s\S]*?"/gi, replacementString);
      return newTag;
    }
    return oldTag;
  }));
  return modifiedImgTags;
}


export async function messageToHtml(myMessage, token) {
  const regex = /<img[\s\S]*?src=[\s\S]*?>/gi;
  var imgs = extractImgTags(myMessage.html[0]);
  var res = await replaceSrc(imgs, myMessage.id, token);
  var newHtml = replaceAllOccurrences(myMessage.html[0],regex, res);
  return newHtml;
}


export async function howMuchUnread(myMail){
  var res = 0;
  var pageNumber = 1;
  while(true){
    var res =  await getMessages(myMail, pageNumber);
    var messages = res.messages;
    if(messages.length === 0){
      break;
    }
    for(const message in messages){
      if(!message.seen){
        res += 1;
      }
    }
  }
  return res;
}
//ATTACHEMENT

export async function downloadAttachment(url, token) {
  try {
    const headers = new Headers();
    headers.set('Authorization', `Bearer ${token}`);

    const response = await fetch(baseUrl + url, { headers });
    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    return downloadUrl;
  }
  catch (error){

  }
}