
import { AppState, DatasetEntry, DatasetMetadata, UserRole } from '../types';
import { INITIAL_STATE } from '../constants';

const STORAGE_KEY = 'bs4_app_state';

export const storageService = {
  getState: (): AppState => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : INITIAL_STATE;
  },

  saveState: (state: AppState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },

  addDataset: (metadata: DatasetMetadata, records: DatasetEntry[]) => {
    const state = storageService.getState();
    state.datasets.push(metadata);
    state.threatRecords = [...state.threatRecords, ...records];
    storageService.saveState(state);
  },

  updateLists: (allowlist: string[], blocklist: string[]) => {
    const state = storageService.getState();
    state.allowlist = allowlist;
    state.blocklist = blocklist;
    storageService.saveState(state);
  },

  clearData: () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }
};
