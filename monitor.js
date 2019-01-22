const log = require('./logger').create('MAIN');
const sleep = require('sleep-promise');
const request = require('request-promise-native');
const config = require('./config');

process.on('uncaughtException', (err) => {
  log.e(`uncaughtException: ${err.stack}`);
});

process.on('unhandledRejection', (err) => {
  log.e(`unhandledRejection: ${err.stack}`);
});

const defaultOpts = () => {
  return {
    timeout: 5000,
  };
};

const writeMetricOpts = (data) => {
  return {
    ...defaultOpts(),
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: data,
  };
};

const main = async () => {
  while (1) { // eslint-disable-line
    for (const endpoint of config.monitoring) {
      try {
        const begin = Date.now();
        await request(endpoint.address);
        const total = Date.now() - begin;

        log.i(`${endpoint.name}: ${total} ms`);
        const payload = `${endpoint.name},metric=total value=${total}`;
        // log.i(`${config.timeseries.address}/write?db=${config.timeseries.database}`);
        // log.i(writeMetricOpts(payload));
        await request.post(`${config.timeseries.address}/write?db=${config.timeseries.database}`, writeMetricOpts(payload));
      } catch (err) {
        log.i(err);
      }
    }
    await sleep(1000);
  }
};
main();

