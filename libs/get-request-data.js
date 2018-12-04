const getData = ({ req }) => {
  const promise = new Promise((resolve) => {
    const data = [];
    req.on('data', function(chunk) {
      data.push(chunk);
    }).on('end', () => {
      resolve(data);
    })
  });
  return promise;
};

module.exports = getData;
