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

export function initClosePopupEvent() {
    const closePopupBtn = document.getElementById('close-popup');
    const overlay = document.getElementById('overlay');
    const popup = document.getElementById('popup');

    closePopupBtn.addEventListener('click', function () {
        overlay.classList.add('hidden');
        popup.classList.add('hidden');
    });

    overlay.addEventListener('click', function () {
        overlay.classList.add('hidden');
        popup.classList.add('hidden');
    });
}

export function fillPopupContent(htmlContent) {
    const popupContent = document.getElementById('popup-content');
    popupContent.innerHTML = htmlContent;
}

export function openPopup() {
    const overlay = document.getElementById('overlay');
    const popup = document.getElementById('popup');
    overlay.classList.remove('hidden');
    popup.classList.remove('hidden');
}
export function closePopup() {
    const overlay = document.getElementById('overlay');
    const popup = document.getElementById('popup');

    overlay.classList.add('hidden');
    popup.classList.add('hidden');
}

export function setPopupSize(width, height) {
    const popup = document.getElementById('popup');
    popup.style.width = width + 'px';
    popup.style.height = height + 'px';
}