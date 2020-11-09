import { writable } from 'svelte/store';

const existingToken = localStorage.getItem('AZURE_PAT');
export const token = writable(existingToken ? existingToken : '');
token.subscribe((value) => localStorage.setItem('AZURE_PAT', value));

export const newBranchName = writable('');

const selectedTheme = localStorage.getItem('THEME');
export const theme = writable(selectedTheme ? selectedTheme : 'light');
theme.subscribe((value) => localStorage.setItem('THEME', value));

const selectedMode = localStorage.getItem('MODE');
export const mode = writable(selectedMode ? selectedMode : 'Branch');
mode.subscribe((value) => localStorage.setItem('MODE', value));
