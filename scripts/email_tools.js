var baseUrl = 'https://api.mail.tm';


export class mailAccount {
    constructor(){
        this.address = '';
        this.password = '';
        this.token = '';
        this.id = '';
    }
}

var mail = new mailAccount();


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
        const params = { address: addr, password: psw };
        await sendRequest(baseUrl + '/accounts', 'POST', params);
        await login(addr,psw);
        return true;
    } catch (error) {
        console.log(error);
        return false;
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


export function storeEmailList(emailList) {
  // Convertir la liste en une chaîne de caractères
  const emailListString = emailList.join('\n');

  // Stocker la chaîne de caractères dans le localStorage
  localStorage.setItem('emailList', emailListString);
}


export function getEmailList() {
  // Récupérer la chaîne de caractères depuis le localStorage
  const emailListString = localStorage.getItem('emailList');

  // Vérifier si la chaîne est présente
  if (emailListString) {
    // Convertir la chaîne en un tableau d'adresses e-mail
    const emailList = emailListString.split('\n');
    return emailList;
  } else {
    // Retourner un tableau vide si la chaîne n'est pas présente
    return [];
  }
}


export function getEmailAndPassword(emailEntry) {
  const [email, password] = emailEntry.split(';');
  return { email, password };
}