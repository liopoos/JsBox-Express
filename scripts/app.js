var view = require('./view');
var date = require('./date');
var listDB = "express.db";
var reg = /\u53d6\u4ef6\u7801\d{4,6}(?!\d)|\u63d0\u8d27\u7801\d{4,6}(?!\d)/;

/**
 * 初始化
 */
function init() {
    var db = $sqlite.open(listDB);
    result = db.update("CREATE TABLE list ( id INTEGER PRIMARY KEY AUTOINCREMENT , qr_number INT NOT NULL , sms TEXT NOT NULL , add_time TEXT NOT NULL , is_take INT NOT NULL DEFAULT 0 , is_fav INT NOT NULL DEFAULT 0);");
    $sqlite.close(db);
    if (result.result) {
        $cache.set("init", 1)
        $ui.toast("初始化成功");
        load(); //开始装载
    } else {
        $ui.error("初始化失败");
    }
}

/**
 * 启动
 */
function boot() {
    reg = getRegEx();
    firstFlag = $cache.get("init");
    if (typeof firstFlag == 'undefined') {
        init(); //初始化数据库
    } else {
        load(); //装载
    }
}

/**
 * 装载
 */
function load() {
    var sms = $clipboard.text;
    if (regExTest(sms)) {
        result = insertItem(sms, getExpressNumber(sms));
        if (result) {
            $ui.toast("快递信息已添加");
            $clipboard.text = ""; //清空剪贴板
        }
    } else {
        console.log("剪贴板内无快递信息");
    }
    show();
}

/**
 * 显示
 */
function show() {
    view.creat(listDB);
}

/**
 * 获取快递单号
 * @param {*string} sms 
 */
function getExpressNumber(sms) {
    var expressNum = sms.match(reg)[0].match(getRegExLimit());
    console.log("取件码", expressNum[0]);
    return expressNum[0];
}

function regExTest(sms) {
    return reg.test(sms);
}

function getRegEx() {
    var regExJson = JSON.parse($file.read("assets/conf.json").string).regex;
    var numberLen = "{" + regExJson.number.join(",") + "}";
    for (let i in regExJson.keyword) {
        regExJson.keyword[i] = toUnicode(regExJson.keyword[i]) + "\\d" + numberLen + "(?!\\d)";
    }
    var regEx = new RegExp(regExJson.keyword.join("|"));
    return regEx;
}

function getRegExLimit() {
    var regExJson = JSON.parse($file.read("assets/conf.json").string).regex;
    var numberLen = "{" + regExJson.number.join(",") + "}";
    var regEx = new RegExp("\\d" + numberLen);
    return regEx;
}

function toUnicode(str) {
    return str.replace(/([\u4E00-\u9FA5]|[\uFE30-\uFFA0])/g, function (newStr) {
        return "\\u" + newStr.charCodeAt(0).toString(16);
    });
}

function insertItem(sms, qr_number) {
    var db = $sqlite.open(listDB);
    var nowTime = date.getTempstamp();
    result = db.update({
        sql: "INSERT INTO list (qr_number,sms,add_time) VALUES(?,?,?)",
        args: [qr_number, sms, nowTime]
    });
    $sqlite.close(db);
    return result.result;
}

module.exports = {
    boot: boot
}