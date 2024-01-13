const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { CLIENT } = require('../config');


dotenv.config()


const SECURITY = {
    verify: (req, res, next) => {
        try {
            let token = req.headers.authorization.split(" ");
            if (token.length > 0 && token[0] === 'Bearer') {
                jwt.verify(token[1], process.env.JWT_SECRET, (error, decode) => {
                    CLIENT.query(`
                        SELECT
                        users_id, 
                        username,
                        password,
                        is_online,
                        created_at
                        FROM users
                        WHERE 
                            users_id=$1
                    `, [decode.usersId]).then((results) => {
                        if (results.rows.length > 0) {
                            req.logged = results.rows[0];
                            next();
                        } else {
                            res.json({ status: 'OK', success: false, errors: true, message: 'Unauthorized' });
                        }
                    }).catch((err) => {
                        res.json({ status: 'OK', success: false, errors: true, message: err.message });
                    });
                });
            } else {
                res.json({ status: 'OK', success: false, message: 'Unauthorized' });
            }
        } catch (err) {
            res.json({ status: 'OK', success: false, message: 'Unauthorized' });
        };
    },
}

module.exports = SECURITY;
