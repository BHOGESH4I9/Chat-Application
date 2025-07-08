export const getChatId = (uid1, uid2) => {
  return [uid1, uid2].sort().join("_"); // uses underscore!
};