const alphaNumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const allCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=[]{}|:;"<>,.?/~`';

export function generate(length, chars) {
  let randomString = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    randomString += chars.charAt(randomIndex);
  }
  return randomString;
}

export function generateAllChars(length) {
  return generate(length, allCharacters)
}

export function generateAlphaNumeric(length) {
  return generate(length, alphaNumeric);
}