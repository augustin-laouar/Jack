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

import { directRequest } from "../../manager/manager.js";

export async function checkLogin() {
    const result = await directRequest('session', 'check', null);
    return result;
}

export async function waitLogin() {
    return new Promise((resolve) => {
        function messageListener(message) {
            if (message.endpoint === 'managerIgnore' && message.type === 'loginSucess') {
                resolve(true);
                browser.runtime.onMessage.removeListener(messageListener);
            }
        }
        browser.runtime.onMessage.addListener(messageListener);
    });
}