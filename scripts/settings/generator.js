import * as password_generator from '../password/generator.js';
import * as popup from '../popup.js';
import {showInfo, showError, showPopupError, showPopupInfo} from './info.js';

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
    <span id="name" style="overflow-y: scroll; white-space: nowrap; width: 70%; cursor: pointer;">` + name + `</span>
    <button id="delete-button" class="btn transparent-button">
        <img src="`+ deleteSvgPath +` " alt="Delete" style="width: 20px; height: 20px;">
    </button> 

    </div>
    `;
}
export async function fillGeneratorsList() {
    const generators = await password_generator.getGenerators();
    const generatorsListDiv = document.getElementById('generators-list');
    generatorsListDiv.innerHTML = '';
    for(const generator of generators) {
        const divElement = document.createElement('div');
        if(generator.id === password_generator.default_generator_id) {
            divElement.innerHTML = getGeneratorDivContent(generator.name, true);
            const deleteButton = divElement.querySelector('#delete-button');
            deleteButton.disabled = true;
        }
        else {
            divElement.innerHTML = getGeneratorDivContent(generator.name);
            const deleteButton = divElement.querySelector('#delete-button');
            deleteButton.addEventListener('click', async function(){
                try{
                    await password_generator.deleteGenerator(generator.id);
                    fillGeneratorsList();
                }
                catch(e) {
                    showError(e);
                }
            });

        }
        const name = divElement.querySelector('#name');
        name.addEventListener('click', function(){
            editGenerator(generator.id);
        });

        generatorsListDiv.appendChild(divElement);
    }
}

function generatorPopupContent(title) {
    return `
    <p class="lead">` + title + `</p>
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
  `;
}


async function addGenerator() {
    popup.initClosePopupEvent();
    popup.fillPopupContent(generatorPopupContent('New generator'));
    popup.setPopupSize(600, 500);
    popup.openPopup();
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
            await password_generator.addGenerator(generatorName.value, passwordLength.value, char_params);
            fillGeneratorsList();
            popup.closePopup();
            showInfo('New password generator created !');
        }
        catch(e) {
            showPopupError(e);
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
    const generator = await password_generator.getGenerator(id);
    popup.initClosePopupEvent();
    popup.fillPopupContent(generatorPopupContent('Edit ' + generator.name));
    popup.setPopupSize(600, 500);
    popup.openPopup();
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
            await password_generator.updateGenerator(id, generatorName.value, passwordLength.value, char_params);
            fillGeneratorsList();
            popup.closePopup();
            showInfo('Password generator ' + generatorName.value + ' updated !');
        }
        catch(e) {
            showPopupError(e);
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

document.addEventListener('DOMContentLoaded', function() {
    fillGeneratorsList();
    const addPasswordGeneratorButton = document.getElementById('add-generator-button');
    addPasswordGeneratorButton.addEventListener('click', function() {
        addGenerator();
    });
});