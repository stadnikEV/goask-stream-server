const headers = ((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'Content-Type, application/x-www-form-urlencoded');
  next();
});

module.exports = headers;
