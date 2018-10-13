module.exports = ({ lastFileName, id }) => {
  if (!lastFileName) {
    return `${id}_1`;
  }
  const lastIndex = lastFileName.substr(lastFileName.indexOf('_') + 1);
  const nextIndex = Number(lastIndex) + 1;
  return `${id}_${nextIndex}`;
};
