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
import * as request from '../manager/manager_request.js';
import { updatePasswordStrength } from '../style/password_strength.js';
import { showInfo, showError } from '../style/show_info.js';

function generatorsPopupContent()  {
  return `
<div class="d-flex flex-column" style="width: 650px; height: 400px;">
    <p class ="lead text-center mb-2">Password generators</p>
    <div class="border-top"  style="margin: 10px; width:100%"></div>
    <div class="row">
        <div class="col-5">
            <div id="generators-list" class="list-group" style="width: 100%; max-height:250px; overflow-y: scroll; overflow-x: hidden;"></div>
            <div class="d-flex justify-content-end align-items-center">
                <button type="button" class="btn transparent-button" id="add-generator-button" data-bs-toggle="tooltip" data-bs-placement="bottom" title="New password generator">
                    <img src="../svg-images/add.svg" alt="Add" style="width: 20px; height: 20px;">
                </button>
            </div>    
        </div>
        <div class="col-7">
            <p class="lead" style="display: flex; align-items: center;">
                Selected:&nbsp
                <span id="selected-generator" class="text-info" 
                    style="overflow-x: auto; white-space: nowrap; width: 70%; display: block;">Empty</span>
            </p>
            <div class="form-group text-displayer">
                <input id="generated-password-displayer" class="form-control dark-input"
                    style="border-top-left-radius: 10px; border-top-right-radius: 10px; border-bottom-left-radius: 0; border-bottom-right-radius: 0;" readonly>
                <div class="text-displayer-buttons">
                    <span class="text-displayer-button">
                        <img id="copy-generated-password" src="/svg-images/copy.svg" alt="copy">
                    </span>
                    <span class="text-displayer-button">
                        <img id="generate-password" src="/svg-images/update.svg" alt="generate">
                    </span>
                </div>
            </div>
            <div class="form-group">
                <div id="password-strength-wrapper" class="password-strength-wrapper w-100" style="visibility: hidden;">
                    <div class="password-strength" id="password-strength" style="border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; border-top-left-radius: 0; border-top-right-radius: 0;">
                        <div id="password-strength-bar" class="password-strength-bar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                    <div id="password-strength-text" class="password-strength-text"></div>
                </div>
            </div>
        </div>
    </div>
    <p id="popup-info" class="mt-2 text-center" style="font-size: 0.8em;"></p>

</div>
  `;
}

function getGeneratorDivContent(name, disableDelete = false) {
    var deleteSvgPath = '';
    if(disableDelete) {
        deleteSvgPath = `../svg-images/no-delete.svg`
    }
    else {
        deleteSvgPath = `../svg-images/delete.svg`
    }
    return `
    <div class="text-info d-flex justify-content-between align-items-center">
    <span id="name" style="overflow-y: scroll; white-space: nowrap; width: 70%; cursor: pointer;" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Edit">` + name + `</span>
    <button id="edit-button" class="btn transparent-button">
        <img src="../svg-images/edit.svg" alt="Edit" style="width: 20px; height: 20px;" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Edit">
    </button> 
    <button id="delete-button" class="btn transparent-button">
        <img src="`+ deleteSvgPath +` " alt="Delete" style="width: 20px; height: 20px;" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Delete">
    </button> 
    </div>
    `;
}
export async function fillGeneratorsList() {
    const generators = await request.makeRequest('generators', 'get', {});
    const generatorsListDiv = document.getElementById('generators-list');
    generatorsListDiv.innerHTML = '';
    for(const generator of generators) {
        const divElement = document.createElement('div');
        const defaultGenerator = await request.makeRequest('generators', 'get', { default: true });
        if(generator.id === defaultGenerator.id) {
            divElement.innerHTML = getGeneratorDivContent(generator.name, true);
            const deleteButton = divElement.querySelector('#delete-button');
            deleteButton.disabled = true;
        }
        else {
            divElement.innerHTML = getGeneratorDivContent(generator.name);
            const deleteButton = divElement.querySelector('#delete-button');
            deleteButton.addEventListener('click', async function(){
                try{
                    await request.makeRequest('generators', 'delete', { id: generator.id });
                    fillGeneratorsList();
                }
                catch(e) {
                    showError(e);
                }
            });

        }
        const editButton = divElement.querySelector('#edit-button');
        editButton.addEventListener('click', function(){
            editGenerator(generator.id);
        });
        const name = divElement.querySelector('#name');
        name.addEventListener('click', async function(){
            await selectGenerator(generator);
        });
        generatorsListDiv.appendChild(divElement);
    }
}

async function selectGenerator(generator) {
    const selectedGenerator = document.getElementById("selected-generator");
    selectedGenerator.innerText = generator.name;
    const generatedPasswordDisplayer = document.getElementById("generated-password-displayer");
    var generatedPassword = await request.makeRequest('generators', 'generate', { generator_id: generator.id });
    displayPassword(generatedPassword, generatedPasswordDisplayer);
    const copyButton = document.getElementById("copy-generated-password");
    const generateButton = document.getElementById("generate-password");
    //cloning buttons to delete all eventlisteners before using it
    const newCopyButton = copyButton.cloneNode(true);
    copyButton.parentNode.replaceChild(newCopyButton, copyButton);
    const newGenerateButton = generateButton.cloneNode(true);
    generateButton.parentNode.replaceChild(newGenerateButton, generateButton);
    newCopyButton.addEventListener("click", async function() {
        await navigator.clipboard.writeText(generatedPassword);
        showInfo("Password copied !", false, true);
    });
    newGenerateButton.addEventListener("click", async function() {
        generatedPassword = await request.makeRequest('generators', 'generate', { generator_id: generator.id });
        displayPassword(generatedPassword, generatedPasswordDisplayer);
    });
}

function displayPassword(generatedPassword, generatedPasswordDisplayer) {
    if (generatedPassword.length > 25) {
        generatedPasswordDisplayer.value = generatedPassword.substring(0, 25) + "...";
    }
    else {
        generatedPasswordDisplayer.value = generatedPassword;
    }        
    updatePasswordStrength(generatedPassword);
}

function generatorPopupContent(title) {
    return `
<div class="d-flex flex-column" style="width: 650px; height: 400px;">
    <p class="lead text-center">` + title + `</p>
    <form id="generator-form" class="d-flex flex-column" style="width: 90%;">
        <div class="form-group form-group-custom">
            <label for="name">Name</label>
            <input required class="form-control dark-input" id="generator-name" autocomplete="off">
        </div>
        <div class="form-group form-group-custom">
            <label for="password-length">Password length</label>
            <input required type="range" id="password-length" name="password-length" min="6" max="50" value="12" step="1" style="width:55%";>
            <span id="password-length-display" style="width:5%";>12</span>
        </div>
        <div class="form-group form-group-custom">
            <label for="excluded-chars">Excluded characters</label>
            <input class="form-control dark-input" id="excluded-chars" autocomplete="off">
        </div>
        <div class="form-group form-group-custom">
            <label for="allowed-chars">Allowed characters</label>
            <div id="allowed-chars">
                <div class="form-check">
                    <input class="form-check-input" style="width: 1em;" type="checkbox" id="lowercase" name="allowed-chars" value="lowercase" checked>
                    <label class="form-check-label" style="width: 100%; text-align: left;" for="lowercase">
                        Lowercase
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" style="width: 1em;" type="checkbox" id="uppercase" name="allowed-chars" value="uppercase" checked>
                    <label class="form-check-label" style="width: 100%; text-align: left;" for="uppercase">
                        Uppercase
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" style="width: 1em;" type="checkbox" id="numbers" name="allowed-chars" value="numbers" checked>
                    <label class="form-check-label" style="width: 100%; text-align: left;" for="numbers">
                        Numbers
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" style="width: 1em;" type="checkbox" id="special-chars" name="allowed-chars" value="special-chars" checked>
                    <label class="form-check-label" style="width: 100%; text-align: left;" for="special-chars">
                        Special Characters
                    </label>
                </div>
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


async function addGenerator() {
    popup.fillPopupContent(generatorPopupContent('New generator'));
    const popupContent = document.getElementById('popup-content');
    const addGeneratorForm = popupContent.querySelector('#generator-form');
    const generatorName = popupContent.querySelector('#generator-name');
    const passwordLength = popupContent.querySelector('#password-length');
    const passwordLengthDisplay = popupContent.querySelector('#password-length-display');
    const excludedChars = popupContent.querySelector('#excluded-chars');
    const lowercaseCheckbox = popupContent.querySelector('#lowercase');
    const uppercaseCheckbox = popupContent.querySelector('#uppercase');
    const numbersCheckbox = popupContent.querySelector('#numbers');
    const specialCharsCheckbox = popupContent.querySelector('#special-chars');

    addGeneratorForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        try {
            const char_params = {
                lowercase: lowercaseCheckbox.checked,
                uppercase: uppercaseCheckbox.checked,
                numbers: numbersCheckbox.checked,
                specials: specialCharsCheckbox.checked,
                excluded_chars: excludedChars.value
            };
            const params = {
                name: generatorName.value,
                length: passwordLength.value,
                char_params: char_params
            };
            await request.makeRequest('generators', 'add', params);
            popup.fillPopupContent(generatorsPopupContent());
            init();
            showInfo('New password generator created !', false, true);
        }
        catch(e) {
            showInfo('Unexpected error', true, true);
        }
    });
    excludedChars.addEventListener('input', function(event) {
        const inputValue = excludedChars.value;
        const uniqueChars = Array.from(new Set(inputValue.split(''))).join('');
        
        if (inputValue !== uniqueChars) {
            excludedChars.value = uniqueChars;
        }
    });
    passwordLength.addEventListener('input', function() {
        passwordLengthDisplay.innerText = passwordLength.value;
    });
}


async function editGenerator(id) {
    const generator = await request.makeRequest('generators', 'get', { id: id });
    popup.fillPopupContent(generatorPopupContent('Edit ' + generator.name));
    const popupContent = document.getElementById('popup-content');
    const editGeneratorForm = popupContent.querySelector('#generator-form');
    const generatorName = popupContent.querySelector('#generator-name');
    const passwordLength = popupContent.querySelector('#password-length');
    const passwordLengthDisplay = popupContent.querySelector('#password-length-display');
    const excludedChars = popupContent.querySelector('#excluded-chars');
    const lowercaseCheckbox = popupContent.querySelector('#lowercase');
    const uppercaseCheckbox = popupContent.querySelector('#uppercase');
    const numbersCheckbox = popupContent.querySelector('#numbers');
    const specialCharsCheckbox = popupContent.querySelector('#special-chars');

    generatorName.value = generator.name;
    passwordLength.value = generator.psw_length;
    passwordLengthDisplay.innerText = passwordLength.value;
    excludedChars.value = generator.char_params.excluded_chars;
    lowercaseCheckbox.checked = generator.char_params.lowercase;
    uppercaseCheckbox.checked = generator.char_params.uppercase;
    numbersCheckbox.checked = generator.char_params.numbers;
    specialCharsCheckbox.checked = generator.char_params.specials;

    editGeneratorForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        try {
            const char_params = {
                lowercase: lowercaseCheckbox.checked,
                uppercase: uppercaseCheckbox.checked,
                numbers: numbersCheckbox.checked,
                specials: specialCharsCheckbox.checked,
                excluded_chars: excludedChars.value
            };
            const params = {
                id: id,
                name: generatorName.value,
                length: passwordLength.value,
                char_params: char_params
            };
            await request.makeRequest('generators', 'update', params);
            popup.fillPopupContent(generatorsPopupContent());
            init();
            showInfo('Password generator ' + generatorName.value + ' updated !', false, true);
        }
        catch(e) {
            showInfo('Unexpected error', true, true);
        }
    });
    excludedChars.addEventListener('input', function(event) {
        const inputValue = excludedChars.value;
        const uniqueChars = Array.from(new Set(inputValue.split(''))).join('');
        
        if (inputValue !== uniqueChars) {
            excludedChars.value = uniqueChars;
        }
    });
    passwordLength.addEventListener('input', function() {
        passwordLengthDisplay.innerText = passwordLength.value;
    });
}


async function init() {
    await fillGeneratorsList();
    const addPasswordGeneratorButton = document.getElementById('add-generator-button');
    addPasswordGeneratorButton.addEventListener('click', function() {
        addGenerator();
    });
    const defaultGenerator = await request.makeRequest('generators', 'get', { default: true });
    selectGenerator(defaultGenerator);

}
async function openGeneratorsPopup() {
    popup.initClosePopupEvent();
    popup.fillPopupContent(generatorsPopupContent());
    popup.setPopupSize(700,500);
    popup.openPopup();
    await init();
}



document.addEventListener("DOMContentLoaded", function() {
    const pswGeneratorsBtn = document.getElementById("open-password-generators");
    pswGeneratorsBtn.addEventListener("click", function() {
        openGeneratorsPopup();
    });
});
