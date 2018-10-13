module.exports = ({ files }) => {
  if (files.length === 0) {
    return null;
  }
  return files[files.length - 1];
};
