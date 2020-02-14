import { writable } from 'svelte/store';

const existingToken = localStorage.getItem('AZURE_PAT');

export const token = writable(existingToken ? existingToken : '');
token.subscribe(value => localStorage.setItem('AZURE_PAT', value));

export const newBranchName = writable('');
