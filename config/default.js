const { name, version, description } = require('../package.json');

module.exports = {
  name,
  version,
  description,
  timezone: 'GMT',
  logger: {
    level: 'fatal',
  },
  webServer: {
    host: '0.0.0.0',
    port: 8994,
  },
  accessPoints: {
    ap1: {
      title: 'test ap 1',
      consulServiceName: 'ap1',
      host: null,
      port: 1233,
    },
    ap2: {
      noConsul: true,
      title: 'test ap 2',
      consulServiceName: 'ap2',
      host: 'host.com',
      port: 1234,
    },
  },
  consul: {
    check: {
      interval: '10s',
      timeout: '5s',
      deregistercriticalserviceafter: '3m',
    },
    agent: {
      reg: {
        host: 'anyhost.com',
        port: 8500,
        secure: false,
        token: '***',
      },
      dev: {
        dc: 'dev',
        host: 'anyhost.com',
        port: 443,
        secure: true,
        token: '***',
      },
      prd: {
        dc: 'prd',
        host: 'anyhost.com',
        port: 443,
        secure: true,
        token: '***',
      },
    },
    service: {
      name,
      instance: 'inst',
      version,
      description,
      tags: [],
      meta: {},
    },
  },

};
