const express = require('express');
const cors = require('cors');
const compress = require('compression');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const useragent = require('express-useragent');
const dotenv = require('dotenv');
const http = require('http');

const AUTH_ROUTER = require('./routers/auth');
const API_ROUTER = require('./routers/api');

dotenv.config();
const app = express();
const server = require('http').createServer(app)
const socketMiddleware = require('./middleware/socket');
const io = require('socket.io')(server, {
    cors: {
        origin: '*'
    }
});

app.use(socketMiddleware(io));

io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('message', (data) => {
        console.log('Received message:', data);
        io.emit('message', data);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });

    console.log(`Socket ID: ${socket.id}`);
});

app.use(cors());
app.use(compress());
app.use(useragent.express());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ 'extended': false }));


app.get('/', (req, res) => {
    const data = {
      success: true,
      message: 'backend is running well'
    }
    return res.json(data)
  })

app.options('*', (req, res) => {
    return res.json({ status: 'OK' });
});

app.use('/v1', API_ROUTER);
app.use('/v1/security', AUTH_ROUTER);

app.use((req, res, next) => {
    let err = new Error();
    err.status = 404;
    err.stack = "Not Found";
    res.json({ status: err.status, message: err.stack });
    next(err);
});

const port = process.env.PORT || 5000;

server.listen(port, () => {
    console.log(`http://localhost:${port}`);
});

module.exports = app;
