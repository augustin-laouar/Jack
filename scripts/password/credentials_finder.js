import * as tools from './tools.js';

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
    const creds = await tools.getLogs();
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