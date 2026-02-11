/**
 * Strip sensitive fields from user object before sending to other users
 * @param {Object} userObj - User document (plain object)
 * @returns {Object} Sanitized user object
 */
function sanitizeUserForPublic(userObj) {
  const sanitized = { ...userObj };

  // NEVER expose these to other users
  delete sanitized.email;
  delete sanitized.phone;
  delete sanitized.password;
  delete sanitized.swipedRight;
  delete sanitized.swipedLeft;
  delete sanitized.blockedUsers;
  delete sanitized.__v;

  // Respect privacy settings
  if (sanitized.privacySettings) {
    if (!sanitized.privacySettings.showAge) delete sanitized.age;
    if (!sanitized.privacySettings.showBio) delete sanitized.bio;
    delete sanitized.privacySettings;
  }

  return sanitized;
}

module.exports = sanitizeUserForPublic;
