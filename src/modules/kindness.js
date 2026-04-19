import data from '../data/kindness.json';
import { renderThemeActivities } from './themeCommon.js';

export function renderKindness(root, state, setState) {
  renderThemeActivities(root, data, 'kindness', state, setState);
}
