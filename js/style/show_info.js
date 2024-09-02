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

import * as error from '../exception/error.js';

export function showInfo(message, warning = false, popup = false) {
    var infoLabel;
    if(popup) {
      infoLabel = document.getElementById('popup-info');
    }
    else {
      infoLabel = document.getElementById('info');
    }
    //clone to reset timer
    const newInfoLabel = infoLabel.cloneNode(true);
    infoLabel.parentNode.replaceChild(newInfoLabel, infoLabel);
    newInfoLabel.innerText = message;
    if(warning) {
      newInfoLabel.classList.remove('text-info');
      newInfoLabel.classList.add('text-warning');
    }
    else {
      newInfoLabel.classList.remove('text-warning');
      newInfoLabel.classList.add('text-info');
    }
    setTimeout(function() {
      newInfoLabel.innerText = '';
      }, 5000);
}
  
export function showError(e, popup = false){
  if(!(e instanceof error.Error)){
    return;
  }
  showInfo(error.errorToString(e), true, popup);
}