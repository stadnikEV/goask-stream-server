module.exports = ({ stream, start }) => {
  const EBML = [26, 69, 223, 163];
  const CLUSTER = [31, 67, 182, 117];

  let clusterStart = [];
  let clusterMatch = [];

  let headerStart = [];
  let ebmlMatch = [];

  const defineEbmlSequence = ({ elem, value, numberOfByte }) => {
    const startBytes = (elem === 'ebml')
      ? headerStart
      : clusterStart;
    const model = (elem === 'ebml')
      ? EBML
      : CLUSTER;
    let match = (elem === 'ebml')
      ? ebmlMatch
      : clusterMatch;
    const numberOfMatches = match.length;

    if (numberOfMatches !== 0) {
      if (value === model[numberOfMatches]) {
        if (numberOfMatches === 3) {
          match.splice(0);
          return numberOfMatches + 1;
        }
        if (numberOfMatches !== 3) {
          match.push(true);
          return match.length;
        }
      }
      if (value !== model[numberOfMatches]) {
        match.splice(0);
        startBytes.splice([startBytes.length - 1], 1);
        return null;
      }
    }
    if (numberOfMatches === 0) {
      if (value === model[numberOfMatches]) {
        startBytes[startBytes.length] = numberOfByte;
        match.push(true);
      }
      return null;
    }
  }

  for (let i = start; i < stream.length; i += 1) {
    defineEbmlSequence({
      elem: 'ebml',
      value: stream[i],
      numberOfByte: i,
    });
    defineEbmlSequence({
      elem: 'cluster',
      value: stream[i],
      numberOfByte: i,
    });
  }

  return {headerStart, clusterStart};
};
