module.exports = ({ buffer,  newDataBuffer }) => {
  const startByte = (buffer.length - newDataBuffer.length > 2)
    ? buffer.length - newDataBuffer.length - 3
    : 0;

  return startByte;
}
