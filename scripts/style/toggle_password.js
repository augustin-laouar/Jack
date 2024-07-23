export function togglePassword(passwordInput, showIcon, hideIcon) {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        showIcon.style.display = "none";
        hideIcon.style.display = "block";
    } else {
        passwordInput.type = "password";
        showIcon.style.display = "block";
        hideIcon.style.display = "none";
    }
}