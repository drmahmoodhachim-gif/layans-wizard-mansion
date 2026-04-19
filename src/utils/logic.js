export function checkQuizAnswer(correct, selected) {
  return String(correct) === String(selected);
}

export function awardBadge(state, badgeName) {
  if (state.badges.includes(badgeName)) {
    return state;
  }
  return { ...state, badges: [...state.badges, badgeName] };
}

export function calculateScore(correctCount, total) {
  if (!total) return 0;
  return Math.round((correctCount / total) * 100);
}
