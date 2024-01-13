const { CLIENT } = require('../../config');
const { VALIDATION } = require('../..//middleware/global');
const { v4: uuidv4 } = require('uuid');




const CHAT = {
    getAllUserChat: async (req, res) => {
        try {
            const query = `
                SELECT 
                    DISTINCT ON (u.users_id) 
                    u.users_id AS sender_id,
                    u.username AS sender_username,
                    u.image AS sender_image,
                    m.message_id,
                    m.message,
                    m.is_read,
                    m.timestamp
                FROM 
                    users u
                JOIN 
                    messages m ON u.users_id = m.sender_id
                WHERE 
                    m.receiver_id = $1
                ORDER BY 
                    u.users_id, m.timestamp DESC;
            `;

            const values = [req.logged.users_id];
            const result = await CLIENT.query(query, values);
            res.status(200).json({ message: 'get user chat list successfully', data: result.rows });
        } catch (error) {
            console.error('Error getting user chat list:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    getUserChat: async (req, res) => {
        try {
            const query = `
                SELECT 
                    m.message_id,
                    m.sender_id,
                    m.receiver_id,
                    m.message,
                    m.is_read,
                    m.timestamp
                FROM 
                    messages m
                WHERE 
                    (m.sender_id = $1 AND m.receiver_id = $2)
                    OR
                    (m.sender_id = $2 AND m.receiver_id = $1)
                ORDER BY 
                    m.timestamp ASC;
            `;

            const values = [req.logged.users_id, req.query.receiverId];
            const result = await CLIENT.query(query, values);
            res.status(200).json({ message: 'get chat successfully', data: result.rows });
        } catch (error) {
            console.error('Error getting user chat:', error);
            throw error;
        }
    },

    sendMessage: async (req, res, io) => {
        try {
            const messageId = uuidv4();
            const senderId = req.logged.users_id;
            const receiverId = req.body.receiverId;
            const messageText = req.body.message;

            const query = `
                INSERT INTO messages (message_id, sender_id, receiver_id, message)
                VALUES ($1, $2, $3, $4)
                RETURNING *;
            `;

            const values = [messageId, senderId, receiverId, messageText];
            const result = await CLIENT.query(query, values);
            const sentMessage = result.rows[0];
            socket.emit('newMessage', sentMessage);

            res.status(200).json({ message: 'Message sent successfully', data: sentMessage });
        } catch (error) {
            console.error('Error sending message:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
};

module.exports = CHAT;
