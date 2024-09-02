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

import { togglePassword } from './style/toggle_password.js';
import * as request from './manager/manager_request.js';
import { showInfo, showError } from './style/show_info.js';

document.addEventListener("DOMContentLoaded", async function() {
  try{
    const isFirstLogin = await request.makeRequest('session', 'isFirstLogin', null);
    if(isFirstLogin) {
      window.location.href = "/html/first_login.html";
    }
    const isLogged = await request.makeRequest('session', 'check', null);
    if(isLogged) {
      window.location.href = "/html/emails.html";
    }
    var form = document.getElementById("login-form");
    form.addEventListener("submit", async function(event) {
      event.preventDefault();
      const passwordField = document.getElementById("password");
      var inputPassword = passwordField.value;
      const result = await request.makeRequest('login', null, { password: inputPassword });
      if(result) {
        request.makeRequest('managerIgnore', 'loginSucess', null);
        window.location.href = "/html/emails.html";
      }
      else{
        passwordField.value = '';
        showInfo('Wrong password.', true, false);
      }
    });

    var togglePasswordElement = document.querySelector('.toggle-password');
    var passwordInput = document.getElementById('password');
    var eyeIcon = document.getElementById('show-password');
    var eyeOffIcon = document.getElementById('hide-password');
    togglePasswordElement.addEventListener('click', function() { 
      togglePassword(passwordInput, eyeIcon, eyeOffIcon);
    });
  }
  catch(error){
    showError(error);
  }

});