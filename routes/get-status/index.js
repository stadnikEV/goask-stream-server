module.exports = (streams, req, res) => {
  const id = req.params.id;
  let streamId = streams[`${id}`];

  if (!streamId) {
    res.json({ status: 'stream not active' });
    return;
  }

  res.json({ status: 'recording' });
};
