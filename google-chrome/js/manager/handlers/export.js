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

import * as storage from '../../tools/storage.js';
import { directRequest } from '../manager.js';

function get_meta_data() {
    const version = 1; //Jack file version
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    return {
        version: version,
        creation: formattedTime
    };
}
async function get_json() {
    const challenge = await storage.read('challenge');
    const connectionDuration = await storage.read('connectionDuration');
    const emails = await storage.read('emails');
    const creds = await storage.read('credentials');
    const generators = await storage.read('generators');
    const workFactor = await directRequest('workFactor', 'get', null);
    const metadata = get_meta_data();
    const jsonData = {
        metadata: metadata,
        challenge: challenge,
        workFactor: workFactor,
        connectionDuration: connectionDuration,
        emails: emails,
        credentials: creds,
        generators: generators
    };
    return jsonData;
}

async function export_account() {
    const jsonObject = await get_json();
    const jsonStr = JSON.stringify(jsonObject, null, 2);
    return jsonStr;
}


export async function handle(message) {
    const jsonStr = await export_account();
    return jsonStr;
}