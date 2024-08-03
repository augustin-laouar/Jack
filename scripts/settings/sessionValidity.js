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

import {showInfo, showError} from './info.js';
import * as request from '../manager/manager_request.js';

function selectCurrentDuration(sessionValiditySelect, currentDuration) {
    sessionValiditySelect.value = currentDuration;
}

document.addEventListener('DOMContentLoaded', async function() {
    const sessionValiditySelect = document.getElementById('session-validity-select');
    const currentDuration = await request.makeRequest('sessionDuration', 'get', null);
    selectCurrentDuration(sessionValiditySelect, currentDuration);
    sessionValiditySelect.addEventListener('change', async function() {
        try {
            const sessionValidityValue = sessionValiditySelect.value;
            await request.makeRequest('sessionDuration', 'set', { duration: sessionValidityValue });
            showInfo('Session validity updated !');
        }
        catch(e) {
            showError(e);
        }
    });
});