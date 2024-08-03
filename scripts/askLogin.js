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

import * as error from './exception/error.js';
import { togglePassword } from './style/toggle_password.js';
import * as request from './manager/manager_request.js';

function showError(e){
  if(!(e instanceof error.Error)){
    return;
  }
  const message = error.errorToString(e);
  const infoLabel = document.getElementById('info');
  infoLabel.innerText = message;
}

document.addEventListener("DOMContentLoaded", function() {
  try{
    var form = document.getElementById("login-form");
    form.addEventListener("submit", async function(event) {
      event.preventDefault();
      const password = document.getElementById('password').value;
      const result = await request.makeRequest('login', null, { password: password });
      if(result){
        request.makeRequest('managerIgnore', 'loginSucess', null);
        window.close();
      }
      else{
        const infoLabel = document.getElementById('info');
        infoLabel.innerText = 'Login failed.';
      }
    });
    const togglePasswordElement = document.getElementById('toggle-btn');
    const showIcon = document.getElementById('show-psw');
    const hideIcon = document.getElementById('hide-psw');
    togglePasswordElement.addEventListener('click', function() { 
        togglePassword(password, showIcon, hideIcon);
    });
  }
  catch(error){
    showError(error);
  }

});