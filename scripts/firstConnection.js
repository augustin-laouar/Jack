
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

import { updatePasswordStrength } from './style/pswStrength.js';
import { togglePassword } from './style/toggle_password.js';
import * as request from './manager/manager_request.js';

document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("create-psw-form");
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirm');
    updatePasswordStrength(passwordInput.value);
    form.addEventListener("submit", async function(event) {
      event.preventDefault();
      if(passwordInput.value !== confirmInput.value){
        document.getElementById('info').innerText = "Passwords are not the same.";
        return;
      }
      try{
        await request.makeRequest('password', 'set', { password: passwordInput.value });
        await request.makeRequest('generators', 'add', { default: true });
        await request.makeRequest('sessionDuration', 'set', { duration: 3 });
        request.makeRequest('managerIgnore', 'firstLogin', null);
        window.location.href = "../html/login.html";
      }
      catch(error){
        document.getElementById('info').innerText = "Unexpected error.";
      }
    });
    passwordInput.addEventListener('input', function() {
      updatePasswordStrength(passwordInput.value);
    });

    const togglePasswordElement = document.getElementById('toggle-btn-1');
    const showIcon = document.getElementById('show-psw-1');
    const hideIcon = document.getElementById('hide-psw-1');
    togglePasswordElement.addEventListener('click', function() { 
        togglePassword(passwordInput, showIcon, hideIcon);
    });
    const togglePasswordElement2 = document.getElementById('toggle-btn-2');
    const showIcon2 = document.getElementById('show-psw-2');
    const hideIcon2 = document.getElementById('hide-psw-2');
    togglePasswordElement2.addEventListener('click', function() { 
        togglePassword(confirmInput, showIcon2, hideIcon2);
    });
  });