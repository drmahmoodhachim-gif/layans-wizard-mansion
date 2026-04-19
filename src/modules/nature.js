import data from '../data/nature.json';
import { renderThemeActivities } from './themeCommon.js';

export function renderNature(root, state, setState) {
  renderThemeActivities(root, data, 'nature', state, setState);
}
