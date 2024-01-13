module.exports = (io) => {
    return (req, res, next) => {
        socket = io
        next()
    }
}
