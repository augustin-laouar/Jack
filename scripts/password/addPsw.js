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
import * as error from '../exception/error.js';
import { fillPasswordList } from './mainPage.js';
import { updatePasswordStrength } from '../style/pswStrength.js';
import { togglePassword } from '../style/toggle_password.js';
import * as request from '../manager/manager_request.js';

function addPopupContent()  {
    return `
        <div class="container d-flex justify-content-center align-items-center flex-column">
            <p class="lead text-center">New credentials</p>
            <form id="add-psw-form" class="d-flex flex-column" style="width: 90%;">
                <div class="form-group form-group-custom">
                    <label for="title">Title</label>
                    <input required class="form-control dark-input" id="title" autocomplete="off">
                </div>
                <div class="form-group form-group-custom">
                    <label for="url">Associate URL</label>
                    <input class="form-control dark-input" id="url" autocomplete="off">
                </div>
                <div class="form-group form-group-custom">
                    <label for="username">Username</label>
                    <input class="form-control dark-input" id="username" autocomplete="off">
                </div>
                <div class="form-group form-group-custom">
                    <label for="description">Description</label>
                    <textarea class="form-control dark-input" id="description" rows="2"></textarea>
                </div>
                <div class="form-group form-group-custom">
                    <label for="password">Password</label>
                    <div class="form-group password-wrapper" style="width:60%;">
                        <input type="password" id="password" style="width:100%;" class="form-control dark-input" autocomplete="off" required>
                        <span id="toggle-btn-1" class="toggle-password">
                            <img id="show-psw-1" src="/svg-images/show.svg" alt="Show">
                            <img id="hide-psw-1" src="/svg-images/hide.svg" alt="Hide" style="display:none;">
                        </span>
                    </div>
                </div>
                <div class="form-group form-group-custom">
                    <label for="password-confirm">Confirm password</label>
                    <div class="form-group password-wrapper" style="width:60%;">
                        <input type="password" id="password-confirm" style="width:100%;" class="form-control dark-input" autocomplete="off" required>
                        <span id="toggle-btn-2" class="toggle-password">
                            <img id="show-psw-2" src="/svg-images/show.svg" alt="Show">
                            <img id="hide-psw-2" src="/svg-images/hide.svg" alt="Hide" style="display:none;">
                        </span>
                    </div>
                </div>
                <div class="form-group form-group-custom">
                    <label for="password-strength">Password Strength</label>
                    <div id="password-strength-wrapper" class="password-strength-wrapper" style="visibility: hidden;">
                        <div class="password-strength" id="password-strength">
                            <div id="password-strength-bar" class="password-strength-bar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                        <div id="password-strength-text" class="password-strength-text"></div>
                    </div>
                </div>
                <div class="form-group form-group-custom">
                    <label for="generator-div">Password generator</label>
                    <div class="d-flex" id="generator-div"> 
                        <select id="select-generator" class="form-select dark-select me-1" style="font-size: 0.8em;"></select>
                        <button id="generate-password" type="button" class="btn transparent-button" data-bs-placement="bottom" title="Generate password">
                            <img src="../svg-images/launch.svg" alt="Generate" style="width: 20px; height: 20px;">
                        </button>
                    </div>
                </div>
                <div class="d-flex justify-content-center">
                    <button type="submit" class="confirm-button" style="width:30%;">Save</button>
                </div>
            </form>
            <p id="popup-info" class="mt-2 text-center" style="font-size: 0.8em;"></p>
        </div>
    `;
}

function showPopupInfo(message, warning = false) {
    const infoLabel = document.getElementById('popup-info');
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

export async function fillGenerators(selectElement) {
    const generators = await request.makeRequest('generators', 'get', {default: false, id: null});
    for(const generator of generators) {
            const opt = document.createElement('option');
            opt.value = generator.id;
            opt.innerText = generator.name;
            selectElement.appendChild(opt);
    }
}
document.addEventListener("DOMContentLoaded", async function() {
    popup.initClosePopupEvent();
    const addPswButton = document.getElementById('add-psw-button');
    addPswButton.addEventListener('click', async function() {
        popup.fillPopupContent(addPopupContent());
        popup.openPopup();
        popup.setPopupSize(700,600);

        const popupContent = document.getElementById('popup-content');
        const addPasswordForm = popupContent.querySelector('#add-psw-form');
        const title = popupContent.querySelector('#title');
        const url = popupContent.querySelector('#url');
        const username = popupContent.querySelector('#username');
        const psw = popupContent.querySelector('#password');
        const pswConfirm = popupContent.querySelector('#password-confirm');
        const description = popupContent.querySelector('#description');
        const generatePassword = popupContent.querySelector('#generate-password');
        const selectGenerator = popupContent.querySelector('#select-generator');
        updatePasswordStrength(psw.value);
        await fillGenerators(selectGenerator);
        addPasswordForm.addEventListener("submit", async function(event) {
            event.preventDefault();
            try{
                if(psw.value !== pswConfirm.value) {
                    showPopupInfo('Passwords are not the same.', true);
                    return;
                }
                const params = {
                    title: title.value,
                    url: url.value,
                    username: username.value,
                    password: psw.value,
                    description: description.value
                }
                await request.makeRequest('credentials', 'add', params);
                title.value = '';
                username.value = '';
                psw.value = '';
                url.value = '';
                description.value = '';
                popup.closePopup();
                fillPasswordList();
            }
            catch(e){
                showPopupError(e);
            }
        
        });

        generatePassword.addEventListener('click', async function() {
            const password = await request.makeRequest('generators', 'generate', { generator_id: selectGenerator.value});
            psw.value = password;
            pswConfirm.value = password;
            updatePasswordStrength(password);
        });
        psw.addEventListener('input', async function() {
            updatePasswordStrength(psw.value);
        });

        const togglePasswordElement = popupContent.querySelector('#toggle-btn-1');
        const showIcon = popupContent.querySelector('#show-psw-1');
        const hideIcon = popupContent.querySelector('#hide-psw-1');
        togglePasswordElement.addEventListener('click', function() { 
            togglePassword(psw, showIcon, hideIcon);
        });
        const togglePasswordElement2 = popupContent.querySelector('#toggle-btn-2');
        const showIcon2 = popupContent.querySelector('#show-psw-2');
        const hideIcon2 = popupContent.querySelector('#hide-psw-2');
        togglePasswordElement2.addEventListener('click', function() { 
            togglePassword(pswConfirm, showIcon2, hideIcon2);
        });
    });
});