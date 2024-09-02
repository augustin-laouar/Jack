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

function detectSignupForm() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const passwordFields = form.querySelectorAll('input[type="password"]');
        const confirmPasswordFields = form.querySelectorAll('input[type="password"][name*="confirm"], input[type="password"][id*="confirm"]');
        const usernameFields = form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[name="username"], input[name="email"]');
        const additionalFields = form.querySelectorAll('input[type="text"][name*="name"], input[type="text"][id*="name"]');

        if (passwordFields.length > 0 && usernameFields.length > 0 && (confirmPasswordFields.length > 0 || additionalFields.length > 0)) {
            const host = window.location.host;
            const pathname = window.location.pathname;
            const url = host + pathname;

            console.log('Signup form detected:', form);
        }
    });
}

detectSignupForm();

const signupFormObserver = new MutationObserver(detectSignupForm);
signupFormObserver.observe(document.body, { childList: true, subtree: true });
