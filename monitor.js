const log = require('./logger').create('MAIN');
const sleep = require('sleep-promise');
const request = require('request-promise-native');

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


const link = 'http://localhost:2000';
const timeseries = 'http://localhost:8086';
const database = 'ping';

const main = async () => {
  while(1) { // eslint-disable-line
    try {
      const begin = Date.now();
      let res = await request(link);
      const end = Date.now();
      res = JSON.parse(res);
      const fw = res.time - begin;
      const bw = end - res.time;
      const total = end - begin;
      log.i(`total:${total}, fw:${fw}, bw:${bw}`);
      const payload = `home,metric=fw value=${fw}` + 
                      `home,metric=bw value=${bw}` +
                      `home,metric=total value=${total}`;
      await request.post(`${timeseries}/write?db=${database}`, writeMetricOpts(payload));
      // log.i(writeMetricOpts(payload))
    } catch (err) {
      log.i(err);
    }
    await sleep(1000);
  }
};
main();

