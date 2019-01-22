const log = require('./logger').create('MAIN');
const http = require('http');

process.on('uncaughtException', (err) => {
  log.e(`uncaughtException: ${err.stack}`);
});

process.on('unhandledRejection', (err) => {
  log.e(`unhandledRejection: ${err.stack}`);
});

const dataSize = 4096;
const result = {
  ok: true,
  data: [...Array(Math.ceil(dataSize/50))]
    .map(() => Math.random().toString(2).slice(0,50)).join(''), // random
};

const server = http.createServer((req, res) => {
  result.time = Date.now();
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(result));
});

server.listen(2000);

