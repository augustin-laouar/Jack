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

import * as popup from '../popup.js';
import { fillAddressList, showInfo } from './mainPage.js';
import * as error from '../exception/error.js';
import { getDomains } from '../tools/emails_api.js';
import * as request from '../manager/manager_request.js';

function addPopupContent()  {
    return `
      <p class="display-6">New email address</p>
      <p class="lead" style="font-size:0.9em;">Leave email name empty to generate a random address !</p>
      <form id="add-email-form">
        <div class="d-flex align-items-center m-1">
            <div class="me-1" style="width:60%;">
                <input id="email-name" autocomplete="off" placeholder="Email name (optional)" class="form-control dark-input" style="font-size: 0.8em;">
            </div>
            <div style="width:60%;">
                <select class="form-select dark-select mb-1" id="select-domain" style="font-size: 0.8em;"></select>
            </div>
        </div>
        <button type="submit" class="confirm-button mt-2 d-block mx-auto" style="width: 50%;">Generate</button>
      </form>
      <p id="info-popup" class="text-warning mt-2" style="font-size: 0.8em;"></p>
    `;
}

function showPopupInfo(message, warning = false) {
    const infoLabel = document.getElementById('info-popup');
    infoLabel.innerText = message;
    if(warning) {
        infoLabel.classList.remove('text-info');
        infoLabel.classList.add('text-warning');
    }
    else {
        infoLabel.classList.remove('text-warning');
        infoLabel.classList.add('text-info');
    }
}

function showPopupError(e){
    if(!(e instanceof error.Error)){
      return;
    }
    const message = error.errorToString(e);
    showPopupInfo(message, true);
}

async function fillSelectDomain() {
    const selectDomain = document.getElementById('select-domain');
    selectDomain.innerText = '';
    const domains = await getDomains();
    let options = [];
    domains.forEach(domain => {
        const text = '@' + domain;
        options.push({value: domain, text: text});
    });    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        selectDomain.appendChild(optionElement);
    });
}
document.addEventListener("DOMContentLoaded", async function() {
    popup.initClosePopupEvent();
    popup.fillPopupContent(addPopupContent());
    await fillSelectDomain();
    const addEmailButton = document.getElementById('add-email-button');
    addEmailButton.addEventListener('click', async function() {
        popup.openPopup();
    });
    const popupContent = document.getElementById('popup-content');
    const addEmailForm = popupContent.querySelector('#add-email-form');
    addEmailForm.addEventListener("submit", async function(event) {
        event.preventDefault();
        const addressInput = popupContent.querySelector('#email-name');
        const selectDomain = popupContent.querySelector('#select-domain');
        try{
            const requestEndpoint = 'emails';
            const requestType = 'create';
            if (addressInput.value.trim() === "") { //Generate a random address
                const requestParams = {
                    random: true,
                    domainName: selectDomain.value
                };
                await request.makeRequest(requestEndpoint, requestType, requestParams);
            } else {
                const address = addressInput.value + '@' + selectDomain.value;
                const requestParams = {
                    emailName: address
                };
                await request.makeRequest(requestEndpoint, requestType, requestParams);
            }
            addressInput.value = '';      
            popup.closePopup();
            showInfo('Email created !');
            fillAddressList();
        }
        catch(error){
            showPopupError(error);
        }
    });
});