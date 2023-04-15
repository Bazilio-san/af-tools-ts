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
};
