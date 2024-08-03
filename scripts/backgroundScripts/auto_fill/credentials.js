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

import { waitLogin } from "./wait_login.js";
import { find_cred_id_from_url } from "./credentials_finder.js";
import { directRequest } from "../../manager/manager.js";


async function fillFields(cred_id, tab) {
  const cred = await directRequest('credentials', 'get', { id: cred_id, decrypted: true });
  const username = cred.content.username;
  const password = cred.content.password;
  const params = {
      username: username,
      password: password
  };
  browser.tabs.executeScript(tab.id, {
  code: `
  (function() {
      const params = ${JSON.stringify(params)};
      function detectLoginForm(username, password) {
          const forms = document.querySelectorAll('form');
          forms.forEach(form => {
              const passwordFields = form.querySelectorAll('input[type="password"]');
              const textFields = form.querySelectorAll('input[type="text"], input[type="email"]');
              //const inputFields = form.querySelectorAll('input, select, textarea');
              if (passwordFields.length !== 1) {
                  return;
              }
              if (textFields.length === 0) {
                  return;
              }

              const signupIndicators = ['signup', 'register', 'inscription'];
              const isSignupForm = Array.from(textFields).some(field => {
                  const nameOrId = (field.name + field.id).toLowerCase();
                  return signupIndicators.some(indicator => nameOrId.includes(indicator));
              });

              if (isSignupForm) {
                  return;
              }

              if (textFields.length > 1) {
                  return;
              }
              const passwordField = passwordFields[0];
              const textField = textFields[0];
              textField.value = username;
              passwordField.value = password;
          });
      }
      detectLoginForm(params.username, params.password);
  })();
  `    
  });
}



function notify(message) {
  if(message.endpoit === 'logout') {
    isUserLoggedIn = false;
  }
  if(message.endpoint === 'managerIgnore') {
    if(message.type === 'logout') {
      isUserLoggedIn = false;
    }
    if(message.type === 'loginSucess') {
      isUserLoggedIn = true;
    }
    if(message.type === 'firstLogin') {
      browser.contextMenus.create({
        id: "jack_fill_creds",
        title: "Use saved credentials",
        contexts: ["editable"]
      });
    }
  }
}

async function init() {
  try {
    const res = await directRequest('session', 'isFirstLogin', null);
    if (!res) {
      browser.contextMenus.create({
        id: "jack_fill_creds",
        title: "Use saved credentials",
        contexts: ["editable"]
      });
    }
  }
  catch (e) {
  }
}

let isUserLoggedIn = false;
init();

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "jack_fill_creds") {
    const url = new URL(tab.url);
    var host = url.host;
    var path = url.pathname;
    if(!isUserLoggedIn) {
      browser.browserAction.setPopup({popup: "/html/askLogin.html"});
      browser.browserAction.openPopup();
      browser.browserAction.setPopup({popup: "/html/emails.html"});
      waitLogin().then(async isLoggedIn => {
        if(isLoggedIn) {
            find_cred_id_from_url(host+path).then(cred_id => {
                if(cred_id) {
                    fillFields(cred_id, tab);
                }
            });
        }
      });
    }
    else {
        find_cred_id_from_url(host+path).then(cred_id => {
            if(cred_id) {
                fillFields(cred_id, tab);
            }
        });
    }
  }
});

browser.runtime.onMessage.addListener(notify);

