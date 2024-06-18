import * as login_tools from '../login_tools.js';
import {showInfo, showError, showPopupError, showPopupInfo} from './info.js';



document.addEventListener('DOMContentLoaded', function() {
    const sessionValiditySelect = document.getElementById('session-validity-select');
    sessionValiditySelect.addEventListener('change', function() {
        const sessionValidityValue = sessionValiditySelect.value;
        login_tools.storeConnexionDuration(sessionValidityValue);
        showInfo('Session validity updated !');
    });
});