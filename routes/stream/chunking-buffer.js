
module.exports = class ChunkingBuffer {
  constructor() {
    this.isHeaderStart = false;
    this.isClusterStart = false;
  }

  getChunks({ buffer, cutPoints }) {
    let headerStart = cutPoints.headerStart[0];
    let clusterStart = cutPoints.clusterStart[0];
    let clusterEnd = (cutPoints.clusterStart.length > 1)
      ? cutPoints.clusterStart[cutPoints.clusterStart.length - 1]
      : null;

    let bufferStart = 0;
    let endOfFile = null;
    let head = null;
    let cluster = null;

    // определить начальный байт заголовка
    if (headerStart !== undefined) {
      this.isHeaderStart = true;
      this.isClusterStart = false;
      if (headerStart !== 0) {
        endOfFile = buffer.slice(0, headerStart);
        bufferStart = headerStart;
      }
    }

    if (clusterStart !== undefined) {
      // получить заголовок
      if (this.isHeaderStart) {
        this.isHeaderStart = false;
        headerStart = (headerStart !== 0)
          ? headerStart
          : 0;
        head = buffer.slice(headerStart, clusterStart);
        bufferStart = clusterStart;
      }
      // получить cluster если он есть
      clusterEnd = (clusterEnd)
        ? clusterEnd
        : clusterStart;
      if (this.isClusterStart) {
        clusterStart = 0;
      }

      if (clusterStart !== clusterEnd) {
        cluster = buffer.slice(clusterStart, clusterEnd);
        bufferStart = clusterEnd;
      }
      this.isClusterStart = (clusterEnd < buffer.length)
        ? true
        : false;
    }
    const newBuffer = buffer.slice(bufferStart);

    const result = (head || cluster)
      ? { newBuffer, head, cluster, endOfFile }
      : null;

    return result;
  }
}
