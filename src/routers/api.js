const express = require('express');
const CHAT = require('../module/chats');
const SECURITY = require('../security');
const API_ROUTER = express.Router();


API_ROUTER.route('/sendMessage').post(SECURITY.verify, CHAT.sendMessage);
API_ROUTER.route('/getAllUserChat').get(SECURITY.verify, CHAT.getAllUserChat);
API_ROUTER.route('/getUserChat').get(SECURITY.verify, CHAT.getUserChat);


module.exports = API_ROUTER;