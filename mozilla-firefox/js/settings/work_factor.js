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
import { showInfo, showError } from '../style/show_info.js';
import * as request from '../manager/manager_request.js';
import * as popup from '../popup.js';
import { generateDerivedKey } from '../tools/crypto.js';

function passwordConfirmPopupContent() {
    return `
      <p class="lead">Confirm with your password</p>
      <p class="text-warning" style="font-size:0.9em;">Warning: Changing the work factor affects both the security and performance of the application. Please ensure you understand the potential impacts before making any modifications.</p>
      <form id="confirm-psw-form">
          <div class="m-1">
            <div class="form-group password-wrapper">
                <input type="password" id="confirm-psw-input" class="form-control dark-input d-block mx-auto" placeholder="Enter your password" autocomplete="off" required>
                <span id="toggle-btn" class="toggle-password">
                    <img id="show-psw" src="/svg-images/show.svg" alt="Show">
                    <img id="hide-psw" src="/svg-images/hide.svg" alt="Hide" style="display:none;">
                </span>
            </div>
            <button type="submit" class="confirm-button mt-2 d-block mx-auto">Apply</button>
          </div>
      </form>
      <p id="popup-info" class="mt-2" style="font-size: 0.8em;"></p>
    `;
}

function timeToText(timeInMs) {
    if (timeInMs < 1) {
        return "instantaneous";
    } else if (timeInMs < 1000) {
        return `${timeInMs.toFixed(2)} ms`;
    } else if (timeInMs < 60000) {
        const seconds = (timeInMs / 1000).toFixed(2);
        return `${seconds} seconds`;
    } else if (timeInMs < 3600000) {
        const minutes = (timeInMs / 60000).toFixed(2);
        return `${minutes} minutes`;
    } else {
        const hours = (timeInMs / 3600000).toFixed(2);
        return `${hours} hours`;
    }
}

async function setTimeInfo(workFactor) {
    const timeInfoTextElement = document.getElementById('work-factor-time-info');
    workFactor = parseInt(workFactor, 10);
    if(workFactor === 0 || workFactor === null) {
        timeInfoTextElement.innerText = '';
        return;
    }
    const startTime = performance.now();
    await generateDerivedKey('test_input', workFactor);
    const endTime = performance.now();
    const executionTime = endTime - startTime; 

    const time = executionTime * workFactor;
    const text = timeToText(time);
    timeInfoTextElement.innerText = 'Time to verify your password with this work factor level : ' + text;
}


async function askForPasswordConfirm() {
    popup.initClosePopupEvent();
    popup.fillPopupContent(passwordConfirmPopupContent());
    popup.setPopupSize(350, 300);
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
                const isValid = await request.makeRequest('password', 'verify', { password: givenPsw });
                if (!isValid) {
                    showInfo('Wrong password.', true, true);
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

async function getWorkFactor() {
    const workFactor = await request.makeRequest('workFactor', 'get', null);
    return workFactor;
}


async function updateWorkFactor(password, workFactor) {
    await request.makeRequest('workFactor', 'set', { workFactor: workFactor });
    await request.makeRequest('password', 'update', { password: password, workFactor: workFactor});
}

export async function initWorkFactorValue() {
    const currentWorkFactor = await getWorkFactor();
    const workFactorSelect = document.getElementById('work-factor-select');
    workFactorSelect.value = currentWorkFactor;
    setTimeInfo(currentWorkFactor);
}

document.addEventListener('DOMContentLoaded', async function() {
    initWorkFactorValue();
    const workFactorSelect = document.getElementById('work-factor-select');
    const workFactorApply = document.getElementById('work-factor-apply');

    workFactorSelect.addEventListener('change', async function() {
        try {
            const workFactorValue = workFactorSelect.value;
            await setTimeInfo(workFactorValue);
        }
        catch(e) {
            showError(e);
        }
    });
    workFactorApply.addEventListener('click', async function() {
        try {
            const password = await askForPasswordConfirm();
            const workFactorValue = workFactorSelect.value;
            await updateWorkFactor(password, workFactorValue);
            showInfo('Work factor updated !');
        }
        catch(e) {
            showError(e);
        }
    });
});