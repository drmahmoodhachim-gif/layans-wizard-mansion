import data from '../data/learning.json';
import { renderThemeActivities } from './themeCommon.js';

export function renderLearning(root, state, setState) {
  renderThemeActivities(root, data, 'learning', state, setState);
}
