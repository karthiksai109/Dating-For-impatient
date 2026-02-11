/**
 * Calculate match score between two users based on shared interests
 * @param {string[]} myInterests - Current user's hobbies + interests
 * @param {string[]} theirInterests - Other user's hobbies + interests
 * @returns {{ score: number, common: string[] }}
 */
function calculateMatchScore(myInterests, theirInterests) {
  const mySet = (myInterests || []).map(i => i.toLowerCase().trim());
  const theirSet = (theirInterests || []).map(i => i.toLowerCase().trim());

  const common = mySet.filter(i => theirSet.includes(i));
  const total = Math.max(mySet.length, 1);
  const score = Math.round((common.length / total) * 100);

  return { score: Math.min(score, 100), common };
}

module.exports = calculateMatchScore;
