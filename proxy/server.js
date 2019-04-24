'use strict';

const net     = require('net');
const { log } = console;

class Server {
  constructor(options) {
    this.options = options;
  }

  handleServer(conn, upstream) {
    upstream.pipe(conn);

    conn.on('data', buf => {
      log('[X] Send to upstream: \n', buf.toString());

      upstream.write(buf);
    });

    conn.on('error', log);
  }

  run(cb) {
    const { local_addr, local_port, remote_addr, remote_port } = this.options;

    this.upstream = net.createConnection(remote_port, remote_addr, () =>
      log('[X] Connecting to upstream')
    );

    this.server = net.createServer(conn => this.handleServer(conn, this.upstream));

    this.server.listen(local_port, local_addr, () =>
      log(`[X] Proxy server running at tcp://${local_addr}:${local_port}`)
    );

    this.upstream.on('data', buf => log('Recv: \n', buf.toString()));

    cb && cb();
  }

  close() {
    this.server.close();
    this.upstream.end();
  }
}

module.exports = Server;
