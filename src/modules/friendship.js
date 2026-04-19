import data from '../data/friendship.json';
import { renderThemeActivities } from './themeCommon.js';

export function renderFriendship(root, state, setState) {
  renderThemeActivities(root, data, 'friendship', state, setState);
}
