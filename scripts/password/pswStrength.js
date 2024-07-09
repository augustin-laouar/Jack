export function checkComplexity(password) {
    if (password.length === 0) {
        return {
            score: 0,
            time: 0
        }
    }   

    let charSetSize = 0;
    if (/[a-z]/.test(password)) charSetSize += 26;
    if (/[A-Z]/.test(password)) charSetSize += 26;
    if (/[0-9]/.test(password)) charSetSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) charSetSize += 32;

    const combinations = Math.pow(charSetSize, password.length);

    const guessesPerSecond = 2e12; // 200 billions per second
    const timeToCrackInSeconds = combinations / guessesPerSecond;
    return {
        score: smoothScore(timeToCrackInSeconds),
        time: timeToCrackInSeconds
    }

}

function smoothScore(timeToCrackInSeconds) {
    const timeRanges = [
        { mintime: 0, maxTime: 1e-10, minScore: 1, maxScore: 3 },
        { mintime: 1e-10, maxTime: 1e-5, minScore: 3, maxScore: 5 },
        { mintime: 1e-5, maxTime: 1, minScore: 5, maxScore: 10 },
        { mintime: 1, maxTime: 60, minScore: 10, maxScore: 20 },
        { mintime: 60, maxTime: 60 * 5, minScore: 20, maxScore: 30 },
        { mintime: 60 * 5, maxTime: 3600, minScore: 30, maxScore: 40 },
        { mintime: 3600, maxTime: 3600 * 24, minScore: 40, maxScore: 50 },
        { mintime: 3600 * 24, maxTime: 3600 * 24 * 30, minScore: 50, maxScore: 60 },
        { mintime: 3600 * 24 * 30, maxTime: 3600 * 24 * 365, minScore: 60, maxScore: 70 },
        { mintime: 3600 * 24 * 365, maxTime: 3600 * 24 * 365 * 10, minScore: 70, maxScore: 80 },
        { mintime: 3600 * 24 * 365 * 10, maxTime: 3600 * 24 * 365 * 100, minScore: 80, maxScore: 85 },
        { mintime: 3600 * 24 * 365 * 100, maxTime: 3600 * 24 * 365 * 1e6, minScore: 90, maxScore: 95 },
        { mintime: 3600 * 24 * 365 * 1e6, maxTime: 3600 * 24 * 365 * 1e9, minScore: 95, maxScore: 99 },
        { mintime: 3600 * 24 * 365 * 1e9, maxTime: 3600 * 24 * 365 * 1e12, minScore: 99, maxScore: 100 },
    ];

    for (const range of timeRanges) {
        if (timeToCrackInSeconds <= range.maxTime) {
            const rangeSpan = range.maxTime - range.mintime;
            const scoreSpan = range.maxScore - range.minScore;
            const normalizedTime = (timeToCrackInSeconds - range.mintime) / rangeSpan;
            return range.minScore + normalizedTime * scoreSpan;
        }
    }

    return 100;
}


export function timeToText(time) {
    if (time < 0.01) {
        return 'instantaneous';
    } else if (time < 1) {
        return `${(time * 100).toFixed(2)} ms`;
    } else if (time < 60) {
        return `${Math.floor(time)} seconds`;
    } else if (time < 3600) { // 60 * 60
        const minutes = Math.floor(time / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (time < 86400) { // 24 * 60 * 60
        const hours = Math.floor(time / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (time < 31536000) { // 365 * 24 * 60 * 60
        const days = Math.floor(time / 86400);
        return `${days} day${days > 1 ? 's' : ''}`;
    } else if (time < 3.1536e13) { // 1 million years in seconds
        const years = Math.floor(time / 31536000);
        return `${years} year${years > 1 ? 's' : ''}`;
    } else if (time < 3.1536e16) { // 1 billion years in seconds
        const millions = Math.floor(time / 3.1536e13);
        return `${millions} million year${millions > 1 ? 's' : ''}`;
    } else if (time < 3.1536e19) { // 1 trillion years in seconds
        const billions = Math.floor(time / 3.1536e16);
        return `${billions} billion year${billions > 1 ? 's' : ''}`;
    } else {
        return 'Astronomical !';
    }
}

function getColor(strength) {
    console.log('Strength :' + strength);
    var color;
    var backgroundImage
    if (strength < 20) {
        color = '#c80b0b'; // Dark red
        backgroundImage = '#c80b0b';
    } else if (strength < 30) {
        color = '#C74600'; // Deep orange-red
        backgroundImage = 'linear-gradient(118deg, #c80b0b, #C74600)';
    } else if (strength < 40) {
        color = '#FF4500'; // Light red
        backgroundImage = 'linear-gradient(118deg, #C74600, #FF4500)';
    } else if (strength < 50) {
        color = '#FF8000'; // Orange
        backgroundImage = 'linear-gradient(118deg, #FF4500, #FF8000)';
    } else if (strength < 60) {
        color = '#FFC700'; // Yellow-orange
        backgroundImage = 'linear-gradient(118deg, #FF8000, #FFC700)';
    } else if (strength < 70) {
        color = '#FFD700'; // Yellow
        backgroundImage = 'linear-gradient(118deg, #FFC700, #FFD700)';
    } else if (strength < 80) {
        color = '#BFFF00'; // Light green-yellow
        backgroundImage = 'linear-gradient(118deg, #FFD700, #BFFF00)';
    } else if (strength < 90) {
        color = '#74FF00'; // Bright green
        backgroundImage = 'linear-gradient(118deg, #BFFF00, #74FF00)';
    } else if (strength < 100) {
        color = '#00B300'; // Dark green
        backgroundImage = 'linear-gradient(118deg, #74FF00, #00B300)';
    } else {
        backgroundImage = 'radial-gradient(circle, #5400FF, #0099FF, #00FFCC)';
        color = '#00FFCC'; // Turquoise
    }
    return {
        color: color,
        backgroundImage: backgroundImage
    }
}
export function updatePasswordStrength(password) {
    const wrapper = document.getElementById('password-strength-wrapper');
    if (wrapper.style.visibility === 'hidden' && password.length > 0) {
        wrapper.style.visibility = 'visible';
    }
    if (password.length === 0) {
        if(wrapper.style.visibility === 'visible') {
            wrapper.style.visibility = 'hidden';
        }
        return;
    }
    const complexity = checkComplexity(password);
    const strength = complexity.score;
    const strengthBar = document.getElementById('password-strength-bar');
    const strengthText = document.getElementById('password-strength-text');
    const timeToBreakText = 'Time to break this password : ' + timeToText(complexity.time);
    strengthText.textContent = timeToBreakText;
    strengthBar.style.width = strength + '%';
    strengthBar.setAttribute('aria-valuenow', strength);
    const colors = getColor(strength);
    strengthBar.style.background = colors.color;
    strengthBar.style.backgroundImage = colors.backgroundImage;

    strengthText.style.color = colors.color;
}