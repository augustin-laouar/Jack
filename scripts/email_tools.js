var baseUrl = 'https://api.mail.tm';


export class mailAccount {
    constructor(addr, psw, id, createdAt){
        this.address = addr;
        this.password = psw;
        this.token = '';
        this.id = id;
        this.createdAt = createdAt;
    }
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
  
      const requestOptions = {
        method: method,
        headers: {
          'Content-Type': 'application/json'
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
      const data = await response.json();
  
      // Récupérer le code de réponse HTTP
      const statusCode = response.status;
      console.log('Code de réponse HTTP:', statusCode);
  
      if (response.ok) {
        return data;
      } else {
        throw new Error('La requête a échoué avec un code de statut HTTP ' + statusCode);
      }
    } catch (error) {
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

export async function login(addr,psw, myMail){ //recupere le token qui permet de s'authentifier sur les futurs requests
    try{
        const params = {address : addr, password : psw};
        const response = await sendRequest(baseUrl + '/token', 'POST', params);
        myMail.address = addr;
        myMail.password = psw;
        myMail.token = response.token;
        myMail.id = response.id;
        console.log(myMail);
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
        var currMail = new mailAccount(res.address, psw, res.id, res.createdAt);
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
    response = await sendRequest(baseUrl + '/messages', 'GET', params, myMail.token );
    return true;
  } catch(error){
    console.log(error);
    return false;
  }
}

export async function getMessage(myMail, messageId){
  try{
    const params = {};
    response = await sendRequest(baseUrl + '/messages/' + messageId, 'GET', params, myMail.token );
    return true;
  } catch(error){
    console.log(error);
    return false;
  }
}

export async function deleteMessage(myMail, messageId){
  try{
    const params = {};
    response = await sendRequest(baseUrl + '/messages/' + messageId, 'DELETE', params, myMail.token );
    return true;
  } catch(error){
    console.log(error);
    return false;
  }
}

export async function marksAsRead(myMail, messageId){
  try{
    const params = {};
    response = await sendRequest(baseUrl + '/messages/' + messageId, 'PATCH', params, myMail.token );
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
  console.log(min);
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

export async function createAndStoreAccount(addr, psw){
  if(getEmailList().length >= maxEmailNumber){
    throw Error('You have already '+ maxEmailNumber + 'email address');
  }
  var res = await createAccount(addr, psw);
  if(res.answer) {
    var newId = pushNewIdInEmailList();
    var jsonEmail = JSON.stringify(res.mail);
    localStorage.setItem('email_' + newId,  jsonEmail);
  }
  else{
    throw Error('Error during email creation. This email is maybe already taken.');
  }
}

export function getAccountStored(emailNumber){
  if(emailNumber >= maxEmailNumber){
    return null;
  }
  return JSON.parse(localStorage.getItem('email_' + emailNumber));
}

export function getEmailAddressAssociated(emailNumber) {
  return getAccountStored(emailNumber).address;
}

export function getEmailIdAssociated(emailNumber) {
  return getAccountStored(emailNumber).id;
}

export async function deleteAccountStored(emailNumber) {
  if(emailNumber >= maxEmailNumber){
    return;
  }

  //request API to delete this account
  var mailToDelete = getAccountStored(emailNumber);
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
  mail = new mailAccount('','','','');
  var jsonEmail = JSON.stringify(mail);
  localStorage.setItem('email_' + emailNumber,  jsonEmail);
}

