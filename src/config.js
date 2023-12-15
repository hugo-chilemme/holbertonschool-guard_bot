const mode = 'production'; //development | production
require('dotenv').config({path: process.cwd() + (mode == 'production' ? '/.env' : '/.devenv')});
process.env.NODE_ENV = mode;

module.exports = process.env;