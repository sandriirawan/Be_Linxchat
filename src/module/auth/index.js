const { CLIENT } = require('../../config');
const { VALIDATION } = require('../..//middleware/global');
const moment = require('moment-timezone');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const { PASSWORD_HASH, VALID_PASSWORD } = require('../../middleware/auth');



const AUTH = {
    login: (req, res) => {
        try {
            if (VALIDATION({ 'username': req.body.username, 'password': req.body.password }) === false) {
                CLIENT.query(`
                    SELECT
                        users_id,
                        password
                    FROM users
                    WHERE 
                        username = $1
                    LIMIT 1`, [req.body.username]
                ).then((results) => {
                    if (results.rows.length > 0) {
                        const isCheck = VALID_PASSWORD(req.body.password, results.rows[0].password);
                        if (isCheck === true) {
                            const userId = results.rows[0].users_id;
                            const token = jwt.sign({ usersId: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

                            CLIENT.query(`
                                UPDATE users
                                SET is_online = true
                                WHERE users_id = $1
                            `, [userId])
                                .then(() => {
                                    res.json({ status: 'OK', success: true, errors: false, token: token, userId: userId });
                                })
                                .catch((updateError) => {
                                    console.error(updateError);
                                    res.json({ status: 'OK', success: false, errors: true, message: updateError.message });
                                });
                        } else {
                            res.json({ status: 'OK', success: false, errors: true, message: 'Kata sandi tidak valid' });
                        }
                    } else {
                        res.json({ status: 'OK', success: false, errors: true, message: 'Username belum terdaftar' });
                    }
                }).catch((err) => {
                    console.error(err);
                    res.json({ status: 'OK', success: false, errors: true, message: err.message });
                });
            } else {
                res.json({ status: 'OK', success: false, errors: true, message: 'Silahkan masukkan username atau kata sandi Anda' });
            }
        } catch (error) {
            console.error(error);
            res.json({ status: 'OK', success: false, errors: true, message: error.message });
        }
    },

    register: async (req, res) => {
        try {
            if (VALIDATION(req.body) === false) {
                let exists = await CHECK_USERS(req.body.username);
                if (exists.success === true && exists.isExists === false) {
                    let userId = uuidv4()
                    let imageUrl = 'https://res.cloudinary.com/ddn4pon2w/image/upload/v1705074298/foto%20default.jpg'
                    CLIENT.query(`INSERT INTO users (users_id, username, password, image, is_online,last_online,created_at)
                        VALUES($1, $2, $3, $4, $5, $6, $7 )`, [
                        userId,
                        req.body.username,
                        PASSWORD_HASH(req.body.password),
                        imageUrl,
                        false,
                        moment(new Date()).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss'),
                        moment(new Date()).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss'),
                    ]).then(() => {
                        res.json({ status: 'OK', success: true, errors: false, userId: userId, message: 'Berhasil' });
                    }).catch((err) => {
                        res.json({ status: 'OK', success: false, errors: true, message: err.message });
                    });
                } else {
                    res.json({ status: 'OK', success: false, errors: true, message: 'username sudah terdaftar' });
                }

            } else {
                res.json({ status: 'OK', success: false, errors: true, message: 'Field harus diisi' })
            }
        } catch (error) {
            res.json({ status: 'OK', success: false, errors: true, message: error.message });
        }
    },

    logout: async (req, res) => {
        try {
            await CLIENT.query(`
                UPDATE users
                SET is_online = false, last_online = $1
                WHERE users_id = $2
            `, [moment(new Date()).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss'), req.logged.users_id]);

            res.json({ status: 'OK', success: true, errors: false, message: 'Logout successful' });
        } catch (error) {
            res.json({ status: 'OK', success: false, errors: true, message: error.message });
        }
    },

    findAll: async (req, res) => {
        try {
            await CLIENT.query(`
            SELECT * FROM users
        `).then((results) => {
                res.json({ status: 'OK', success: true, errors: false, data: results.rows });
            }).catch((err) => {
                res.json({ status: 'OK', success: false, errors: true, message: err.message });
            });

        } catch (error) {
            res.json({ status: 'OK', success: false, errors: true, message: error.message });
        }
    },

    findById: async (req, res) => {
        try {
            if (VALIDATION(req.logged.users_id) === false) {
                await CLIENT.query(`
               SELECT * FROM users WHERE users_id=$1 
            `, [req.logged.users_id]).then((results) => {
                    res.json({ status: 'OK', success: true, errors: false, data: results.rows[0] });
                }).catch((err) => {
                    res.json({ status: 'OK', success: false, errors: true, message: err.message });
                });
            } else {
                res.json({ status: 'OK', success: false, errors: true, message: 'Field harus diisi' })
            }
        } catch (error) {
            res.json({ status: 'OK', success: false, errors: true, message: error.message });
        }
    },
    findById2: async (req, res) => {
        try {
            if (VALIDATION(req.query.userId) === false) {
                await CLIENT.query(`
               SELECT * FROM users WHERE users_id=$1 
            `, [req.query.userId]).then((results) => {
                    res.json({ status: 'OK', success: true, errors: false, data: results.rows[0] });
                }).catch((err) => {
                    res.json({ status: 'OK', success: false, errors: true, message: err.message });
                });
            } else {
                res.json({ status: 'OK', success: false, errors: true, message: 'Field harus diisi' })
            }
        } catch (error) {
            res.json({ status: 'OK', success: false, errors: true, message: error.message });
        }
    },

}


const CHECK_USERS = async (username) => {
    try {
        let results = await CLIENT.query(`
            SELECT
                COUNT(*)
            FROM users
            WHERE 
                username='${username}'`
        );
        return { success: true, errors: false, isExists: (results.rows[0].count > 0) ? true : false };
    } catch (err) {
        return { success: false, errors: true, message: err.message };
    }
}

module.exports = AUTH;
