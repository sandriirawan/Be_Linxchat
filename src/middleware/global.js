const VALIDATION = (payload) => {
    const checkValue = Object.values(payload).map((val) => { return (val) ? false : true });
    let required = checkValue.find((val) => { if (val === true) return val })
    return (required !== undefined) ? true : false;
}
const CAMEL_CASE = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(v => CAMEL_CASE(v));
    } else if (obj != null && obj.constructor === Object) {
        return Object.keys(obj).reduce((result, key) => ({
            ...result,
            [camelCase(key)]: CAMEL_CASE(obj[key]),
        }), {},);
    }
    return obj;
}
module.exports = {
    VALIDATION,
    CAMEL_CASE
}