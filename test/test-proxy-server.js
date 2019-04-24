const Server        = require('../proxy/server');
const redis         = require('redis');
const assert        = require('assert');
const { promisify } = require('util');

describe('test proxy server', () => {
  let client;
  let server;
  let options = { local_addr: '127.0.0.1', local_port: 9736, remote_addr: '127.0.0.1', remote_port: 6379 };

  before(() => {
    server = new Server(options);

    server.run(() => {
      client      = redis.createClient({ host: options.local_addr, port: options.local_port });
      client.ping = promisify(client.ping);
    });

  });

  after(() => {
    server.close();
    client.end(true);
  });

  it('should proxy redis protocol', async () => {
    let resp = await client.ping();

    assert.strictEqual(resp, 'PONG');
  });
});
