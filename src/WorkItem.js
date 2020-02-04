import { workItemTypes } from './Types';

export const getBranchName = (rawType, id, rawTitle) => {
  const title = pipe(
    replaceAmpersands,
    keepOnlyWords,
    trim,
    replaceEmptySpaces,
    toLowerCase
  )(rawTitle);
  const { type } = workItemTypes[rawType];

  return `${type}/${id}_${title}`.substring(0, 48);
};

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
