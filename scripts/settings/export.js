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
import * as popup from '../popup.js';
import {showInfo, showError, showPopupError, showPopupInfo} from './info.js';
import { fillGeneratorsList } from './generator.js';
import { togglePassword } from '../style/toggle_password.js';
import * as request from '../manager/manager_request.js';


export async function export_account(password, givenFileName) {
    const isValid = await request.makeRequest('password', 'verify', { password: password});
    if(isValid === false){
        throw new error.Error('Your current password is invalid.', true);
    }
    const blob = await request.makeRequest('export', null, null);
    const url = URL.createObjectURL(blob);

    var filename;
    if(givenFileName === '') {
        filename = 'jack.json';
    }
    else {
        filename = givenFileName + '.json';
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export async function import_account(jsonfile, password, keepCurrPsw) {
    const params = {
        jsonFile: jsonfile,
        password: password,
        keepCurrPsw: keepCurrPsw
    }
    await request.makeRequest('import', null, params);
}




//ACTION LISTENERS 

function passwordConfirmPopupContent() {
    return `
      <p class="lead">Confirm your password</p>
      <p style="font-size:0.9em;">This file will be protected by your current master password.</p>
      <form id="confirm-psw-form">
          <div class="m-1">
            <div class="form-group password-wrapper">
                <input type="password" id="confirm-psw-input" class="form-control dark-input d-block mx-auto" placeholder="Enter your password" autocomplete="off" required>
                <span id="toggle-btn" class="toggle-password">
                    <img id="show-psw" src="/svg-images/show.svg" alt="Show">
                    <img id="hide-psw" src="/svg-images/hide.svg" alt="Hide" style="display:none;">
                </span>
            </div>
            <button type="submit" class="confirm-button mt-2 d-block mx-auto">Export</button>
          </div>
      </form>
      <p id="popup-info" class="mt-2" style="font-size: 0.8em;"></p>
    `;
}

async function askForPasswordConfirm() {
    popup.initClosePopupEvent();
    popup.fillPopupContent(passwordConfirmPopupContent());
    popup.setPopupSize(300, 300);
    popup.openPopup();
    const popupContent = document.getElementById('popup-content');
    const confirmPswForm = popupContent.querySelector('#confirm-psw-form');
    const confirmPswInput = popupContent.querySelector('#confirm-psw-input');

    const togglePasswordElement = popupContent.querySelector('#toggle-btn');
    const showIcon = popupContent.querySelector('#show-psw');
    const hideIcon = popupContent.querySelector('#hide-psw');
    togglePasswordElement.addEventListener('click', function() { 
        togglePassword(confirmPswInput, showIcon, hideIcon);
    });
    return new Promise((resolve, reject) => {
        confirmPswForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const givenPsw = confirmPswInput.value;
            try {
                const isValid = await request.makeRequest('password', 'verify', { password: givenPsw});
                if (!isValid) {
                    showPopupInfo('Invalid password.', true);
                    confirmPswInput.value = '';
                } else {
                    popup.closePopup();
                    resolve(givenPsw);
                }
            } catch (e) {
                reject(e);
            }
        });
    });
}

function confirmFilePswContent() {
    return `
    <p class="lead">Import data</p>
    <p class="text-warning" style="font-size: 0.9em;">Your current data will be deleted and replaced with the data from the imported file.</p>
    <form id="confirm-file-psw-form">
        <div class="m-1">
            <div class="form-group password-wrapper">
                <input type="password" id="confirm-file-psw-input" class="form-control dark-input d-block mx-auto" placeholder="Enter file's password" autocomplete="off" required>
                <span id="toggle-btn" class="toggle-password">
                    <img id="show-psw" src="/svg-images/show.svg" alt="Show">
                    <img id="hide-psw" src="/svg-images/hide.svg" alt="Hide" style="display:none;">
                </span>
            </div>
            <button type="submit" class="confirm-button mt-2 d-block mx-auto">Import</button>
        </div>
    </form>
    <p id="popup-info" class="mt-2" style="font-size: 0.8em;"></p>
  `;
}

async function confirmFilePsw() {
    popup.initClosePopupEvent();
    popup.fillPopupContent(confirmFilePswContent());
    popup.setPopupSize(300, 300);
    popup.openPopup();
    const popupContent = document.getElementById('popup-content');
    const confirmFilePswForm = popupContent.querySelector('#confirm-file-psw-form');
    const confirmFilePswInput = popupContent.querySelector('#confirm-file-psw-input');

    const togglePasswordElement = popupContent.querySelector('#toggle-btn');
    const showIcon = popupContent.querySelector('#show-psw');
    const hideIcon = popupContent.querySelector('#hide-psw');
    togglePasswordElement.addEventListener('click', function() { 
        togglePassword(confirmFilePswInput, showIcon, hideIcon);
    });
    return new Promise((resolve, reject) => {
        confirmFilePswForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const givenPsw = confirmFilePswInput.value;
            resolve(givenPsw);
            popup.closePopup();
        });
    });
}


document.addEventListener('DOMContentLoaded', function() {
    const importAccountButton = document.getElementById('import-account');
    importAccountButton.addEventListener('click', async function(){
        const importAccountFile = document.getElementById('import-account-file');
        const keepCurrPsw = document.getElementById('import-keep-psw');
        if(importAccountFile.files.length === 0) {
            showError(new error.Error('Please select an account file to import.', true));
            return;
        }
        try {
            const file = importAccountFile.files[0];
            const filePassword = await confirmFilePsw();
            await import_account(file, filePassword, keepCurrPsw.checked);
            fillGeneratorsList();

            showInfo('Account imported with success !');
        }
        catch(e) {
            showError(e);
        }
    });

    const exportDataButton = document.getElementById('export-account');
    exportDataButton.addEventListener('click', async function(){
        try{
            const password = await askForPasswordConfirm(); 
            const fileName = document.getElementById('export-file-name').value;
            await export_account(password, fileName);
        }
        catch(e) {
            showError(new error.Error('Unexpected error while exporting your account.', true));
        }
    });
});