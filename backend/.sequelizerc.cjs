const path = require('path');

module.exports = {
  // Tell sequelize-cli to use the JS file we made earlier
  config: path.resolve('config', 'config.js'),
  // (optional) keep the default folders for migrations & models
  'migrations-path': path.resolve('migrations'),
  'models-path':     path.resolve('src', 'models'),
};
