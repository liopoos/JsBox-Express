/**
 * 获取当前时间
 */
function getNowTime() {
    var date = new Date()
    return [date.getHours(), date.getMinutes(), date.getSeconds()].map(formatNumber).join(':')
}

function getTempstamp() {
    var timestamp = Date.parse(new Date()) / 1000;
    return parseInt(timestamp);
}
/*
 * 日期补全
 */
function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}

function formatDate(timestamp) {
    var date = new Date(parseInt(timestamp) * 1000);
    var y = 1900 + date.getYear();
    var m = "0" + (date.getMonth() + 1);
    var d = "0" + date.getDate();
    return y + "-" + m.substring(m.length - 2, m.length) + "-" + d.substring(d.length - 2, d.length);
}

module.exports = {
    getTempstamp: getTempstamp,
    getNowTime: getNowTime,
    formatDate: formatDate
}