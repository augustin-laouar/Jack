
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
import { editCredential } from './editPsw.js';
import * as request from '../manager/manager_request.js';

function showErrorMessage(message) {
  const infoLabel = document.getElementById('info');
  infoLabel.innerText = message;
}
function showError(e){
  if(!(e instanceof error.Error)){
    return;
  }
  const message = error.errorToString(e);
  const infoLabel = document.getElementById('info');
  infoLabel.innerText = message;
}

async function researchPassword(){
  try{
    const creds = await request.makeRequest('credentials', 'get', { decrypted: true});
    if(creds.length === 0){
      return;
    }
    const input = document.getElementById('search').value;
    const searchMethod = document.getElementById('search-method').value;
    let logsFiltred;

    if (searchMethod === 'title') {
      logsFiltred = creds.filter(element => element.content.title.includes(input));
    } 
    if (searchMethod === 'url') {
        logsFiltred = creds.filter(element => element.content.url.includes(input));
    } 
    else if (searchMethod === 'username') {
      logsFiltred = creds.filter(element => element.content.username.includes(input));
    } 
    else if (searchMethod === 'all') {
      logsFiltred = creds.filter(element => 
        element.content.title.includes(input) ||
        element.content.url.includes(input) || 
        element.content.username.includes(input) || 
        element.content.description.includes(input)
      );
    }
    
    fillPasswordList(logsFiltred, true);
  }
  catch(error){
    showError(error);
  }

}

function sortByTitle(credentials) {
  return credentials.sort((a, b) => {
      const titleA = a.content.title.toLowerCase();
      const titleB = b.content.title.toLowerCase();

      if (titleA < titleB) {
          return -1;
      }
      if (titleA > titleB) {
          return 1;
      }
      return 0;
  });
}

function getTrContent(title, url, username, description){ 
    return `
    <td>
      <div style="max-width: 150px; overflow-y: auto;">
        <p class="text-info" style="white-space: nowrap;">${title}</p>
      </div>
    </td>
    <td>
      <div style="max-width: 250px; overflow-y: auto;" data-bs-placement="bottom" title="Copy to clipboard">
        <p class="text-info" style="white-space: nowrap; cursor: pointer;" id="cp-url">${url}</p>
      </div>
    </td>
    <td>
      <div style="max-width: 250px; overflow-y: auto;" data-bs-placement="bottom" title="Copy to clipboard">
          <p class="text-info" style="white-space: nowrap; cursor: pointer;" id="cp-username">${username}</p>
      </div>
    </td>
    <td>
      <button id="cp-psw-button" class="btn transparent-button" data-bs-placement="bottom" title="Copy to clipboard">
        <img src="../svg-images/copy.svg" alt="Copy" style="width: 20px; height: 20px;">
      </button>
    </td>
    <td>
      <div style="max-width: 300px; overflow-y: auto;">
          <p class="text-info" style="white-space: nowrap;" id="cp-description">${description}</p>
      </div>
    </td>
    <td>
      <button id="edit-button" class="btn transparent-button" data-bs-placement="bottom" title="Edit">
        <img src="../svg-images/edit.svg" alt="Edit" style="width: 20px; height: 20px;">
      </button>
    </td>
    <td>
      <button id="delete-button" class="btn transparent-button" data-bs-placement="bottom" title="Delete">
        <img src="../svg-images/delete.svg" alt="Delete" style="width: 20px; height: 20px;">
      </button>
    </td>
    `;
}

export async function fillPasswordList(credParam = null, searching = false){
  try{
    var creds;
    if(credParam === null){
      creds = await request.makeRequest('credentials', 'get', { decrypted: true});
    }
    else{
      creds = credParam;
    }
    creds = sortByTitle(creds);
    const tab = document.querySelector('#tab-body');    
    const head = document.querySelector('#tab-head');

    tab.innerHTML = ''; 
    if(creds.length === 0){
      head.innerHTML = '';
      if(searching){
        tab.innerHTML = '<p class ="lead">No matching result.</p>'
      }
      else{
        tab.innerHTML = '<p class ="lead">No credentials saved for the moment.</p>'
      }
    }
    else{
      head.innerHTML = '<tr><th scope="col">Title</th><th scope="col">URL</th><th scope="col">Username</th><th scope="col">Password</th><th scope="col">Description</th></tr>';
      for(const credential of creds) {
        const trElement = document.createElement('tr');
        trElement.innerHTML = getTrContent(credential.content.title, credential.content.url, credential.content.username, credential.content.description);
        const copyUrl = trElement.querySelector('#cp-url')
        const copyUsername = trElement.querySelector('#cp-username');
        const copyPasswordButton = trElement.querySelector('#cp-psw-button');
        const editButton = trElement.querySelector('#edit-button');
        const deleteButton = trElement.querySelector('#delete-button');

        copyUrl.addEventListener('click', async function(){
          try{
            copyToClipboard(credential.content.url);
          }
          catch(error){
            showError(error);
          }
        });
        copyUsername.addEventListener('click', async function(){
          try{
            copyToClipboard(credential.content.username);
          }
          catch(error){
            showError(error);
          }
        });
        copyPasswordButton.addEventListener('click', async function(){
          try{
            copyToClipboard(credential.content.password);
          }
          catch(error){
            showError(error);
          }
        });
        editButton.addEventListener('click', async function(){
          try{
            editCredential(
              credential.id, 
              credential.content.title, 
              credential.content.url, 
              credential.content.username, 
              credential.content.password, 
              credential.content.description); 
          }
          catch(error){
            showError(error);
          }
        });
        deleteButton.addEventListener('click', async function(){
          try{
            await request.makeRequest('credentials', 'delete', { id: credential.id });
            fillPasswordList();
          }
          catch(error){
            showError(error);
          }
        });
        tab.appendChild(trElement);
      }
    }

  }
  catch(error){
    showError(error);
  }

}


// Fonction pour copier le texte dans le presse-papiers
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    throw new error.Error('Error copying to clipboard.', true);
  }
}

document.addEventListener("DOMContentLoaded", function() { //on attend que la page se charge
    fillPasswordList();
    const searchInput = document.getElementById('search');
    let timeout;
    searchInput.addEventListener("input", function() {
      clearTimeout(timeout);
      timeout = setTimeout(researchPassword,100);
    });
    const searchMethod = document.getElementById('search-method');
    searchMethod.addEventListener('change', function() {
      researchPassword();
    });
    //Listen for messages from popup
    browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
      if (message.action === "updatePswList") {
        fillPasswordList();
      }
      if (message.action === "errorUpdatePsw") {
        if(message.error){
          showErrorMessage(message.error.message, message.error.type);
        }
      }
    });
});
