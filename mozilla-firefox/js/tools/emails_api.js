/*
 * Author: Augustin Laouar
 * Project Repository: https://github.com/augustin-laouar/Jack
 * License: GNU General Public License v3.0
 * 
 * This project is licensed under the GNU General Public License v3.0.
 * You may obtain a copy of the License at
 * 
 *     https://www.gnu.org/licenses/gpl-3.0.en.html
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as error from '../exception/error.js';

export const baseUrl = 'https://api.mail.tm';

//CLASS 
export class MailAccount {
    constructor(addr, psw, id, createdAt){
        this.address = addr;
        this.password = psw;
        this.token = '';
        this.id = id;
        this.createdAt = createdAt;

    }
}
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
        contentType = 'application/merge-patch+json';
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
      if (response.ok) {
        return data;
      } else {
        throw new error.Error(response.status, false);
      }
    } catch (e) {
      throw error.castError(e, false);
    }
  }


export async function getDomains() {
      const response = await sendRequest(baseUrl + '/domains', 'GET', null);
      const list = response['hydra:member'];
      let domains = [];
      list.forEach(element => {
        domains.push(element.domain)
      });
      return domains;
}

export async function login(myMail){ //get auth token
    const params = {address: myMail.address, password: myMail.password};
    const response = await sendRequest(baseUrl + '/token', 'POST', params);
    myMail.token = response.token;
    return myMail;
}


export async function createAccount(addr, psw){
  try {
    const params = { address: addr, password: psw };
    var res = await sendRequest(baseUrl + '/accounts', 'POST', params);
    var currMail = new MailAccount(res.address, psw, res.id, res.createdAt);
    return currMail;
  }
  catch(e) {
    throw new error.Error('Error creating the email address. This name might already be taken or it contains forbidden characters.', true);
  }
}

export async function getAccount(myMail) {
  const params = {};
  response = await sendRequest(baseUrl + '/accounts/' + myMail.id, 'GET', params, myMail.token );
}

export async function me(myMail){
  const params = {};
  response = await sendRequest(baseUrl + '/me', 'GET', params, myMail.token );
}

export async function deleteAccount(myMail){
  const params = {};
  await login(myMail);
  await sendRequest(baseUrl + '/accounts/' + myMail.id, 'DELETE', params, myMail.token );
}

export async function getMessages(myMail, pageNumber = 1){ 
  const params = {page : pageNumber};
  var response = await sendRequest(baseUrl + '/messages', 'GET', params, myMail.token );
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
}

export async function getMessage(myMail, messageId){
  const params = {};
  var response = await sendRequest(baseUrl + '/messages/' + messageId, 'GET', params, myMail.token );
  return initMessageFromJson(response);
}

export async function deleteMessage(myMail, messageId){
  const params = {};
  await sendRequest(baseUrl + '/messages/' + messageId, 'DELETE', params, myMail.token);
}

export async function marksAsRead(myMail, messageId){
    const params = {
      "seen" : true
    };
    await sendRequest(baseUrl + '/messages/' + messageId, 'PATCH', params, myMail.token);
}

export async function marksAsUnread(myMail, messageId){
  const params = {
    "seen" : false
  };
  await sendRequest(baseUrl + '/messages/' + messageId, 'PATCH', params, myMail.token);
}
