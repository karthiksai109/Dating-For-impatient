/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Validate password strength (min 6 chars)
 * @param {string} password
 * @returns {boolean}
 */
function isValidPassword(password) {
  return typeof password === "string" && password.length >= 6;
}

/**
 * Validate age (must be 18+)
 * @param {Date|string} dob
 * @returns {boolean}
 */
function isAdult(dob) {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age >= 18;
}

module.exports = { isValidEmail, isValidPassword, isAdult };
