const express = require('express');
const AUTH = require('../module/auth');
const SECURITY = require('../security');
const AUTH_ROUTER = express.Router();


AUTH_ROUTER.route('/login').post(AUTH.login);
AUTH_ROUTER.route('/register').post(AUTH.register);
AUTH_ROUTER.route('/logout').put(SECURITY.verify, AUTH.logout);
AUTH_ROUTER.route('/findAll').get(SECURITY.verify, AUTH.findAll);
AUTH_ROUTER.route('/findById').get(SECURITY.verify, AUTH.findById);
AUTH_ROUTER.route('/findById2').get(SECURITY.verify, AUTH.findById2);





module.exports = AUTH_ROUTER;