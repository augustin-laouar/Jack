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

import { directRequest  } from "../../manager/manager.js";

function formatUrl(url) {
    return url.replace(/^https?:\/\//, '');
}
function getCommonPath(url1, url2) {
    const parts1 = url1.split('/');
    const parts2 = url2.split('/');
    let commonParts = [];

    for (let i = 0; i < Math.min(parts1.length, parts2.length); i++) {
        if (parts1[i] === parts2[i]) {
        commonParts.push(parts1[i]);
        } else {
        break;
        }
    }

    return commonParts.join('/');
}

export async function find_cred_id_from_url(givenUrl) {
    const creds = await directRequest('credentials', 'get', { decrypted: true});
    if(creds === null) {
        return null;
    }
    let bestMatch = null;
    let longestCommonPath = 0;
    for(const cred of creds) {
        const formattedUrl = formatUrl(cred.content.url);
        const commonPath = getCommonPath(givenUrl, formattedUrl);
        if (commonPath.length > longestCommonPath) {
          bestMatch = cred.id;
          longestCommonPath = commonPath.length;
        }
    }
    return bestMatch;
}