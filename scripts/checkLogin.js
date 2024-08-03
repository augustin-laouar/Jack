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

import * as request from './manager/manager_request.js';


const isLogged = await request.makeRequest('session', 'check', null);
if(!isLogged) {
    const isFirstLogin = await request.makeRequest('session', 'isFirstLogin', null);
    if(isFirstLogin) {
        window.location.href = "/html/firstConnection.html";
    }
    else {
        window.location.href = "/html/login.html";
    }
}

browser.runtime.onMessage.addListener(notify);

function notify(message) {
    if(message.endpoint === 'logout') {
        window.location.href = "/html/login.html";
    }
    if(message.endpoint === 'managerIgnore' && message.type === 'logout') {
        window.location.href = "/html/login.html";
    }
}