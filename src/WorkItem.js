export const workItemTypes = {
  Bug: { color: 'rgb(204, 41, 61)', type: 'bug' },
  Enabler: { color: 'rgb(96, 175, 73)', type: 'enabler' },
  Epic: { color: 'rgb(255, 123, 0)', type: 'epic' },
  Feature: { color: 'rgb(119, 59, 147)', type: 'feature' },
  Issue: { color: 'rgb(96, 175, 73)', type: 'issue' },
  Kaizen: { color: 'rgb(96, 175, 73)', type: 'kaizen' },
  Pentesting: { color: 'rgb(96, 175, 73)', type: 'pentesting' },
  People: { color: 'rgb(96, 175, 73)', type: 'people' },
  Support: { color: 'rgb(96, 175, 73)', type: 'support' },
  Task: { color: 'rgb(242, 203, 29)', type: 'task' },
  'Tech Debt': { color: 'rgb(96, 175, 73)', type: 'techdebt' },
  'Test Case': { color: 'rgb(96, 175, 73)', type: 'testcase' },
  'User Story': { color: 'rgb(0, 156, 204)', type: 'us' }
};

export function getBranchName(rawType, id, rawTitle) {
  const title = pipe(
    replaceAmpersands,
    keepOnlyWords,
    trim,
    replaceEmptySpaces,
    toLowerCase
  )(rawTitle);
  const { type } = workItemTypes[rawType];

  return `${type}/${id}_${title}`.substring(0, 48);
}

function replaceAmpersands(title) {
  return title.replace(/&/gi, 'and');
}

function keepOnlyWords(title) {
  return title.replace(/[^\w+]/gim, ' ');
}

function replaceEmptySpaces(title) {
  return title.replace(/[ ]+/gim, '_');
}

function trim(title) {
  return title.trim();
}

function toLowerCase(title) {
  return title.toLowerCase();
}

function pipe(...fns) {
  return arg => fns.reduce((acc, fn) => fn(acc), arg);
}
