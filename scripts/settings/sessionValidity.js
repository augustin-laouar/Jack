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