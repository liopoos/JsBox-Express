var listDB;
var unTakeData, takeData, favData;
var date = require('./date');
var setting = require('./setting');
var screen = $device.info.screen;

function getExpressList(type) {
    switch (type) {
        case 'un_take':
            var sql = "SELECT * FROM list WHERE is_take = 0 ORDER BY add_time DESC;";
            break;
        case 'take':
            var sql = "SELECT * FROM list WHERE is_take = 1 ORDER BY add_time DESC;";
            break;
        case 'fav':
            var sql = "SELECT * FROM list WHERE is_fav = 1 ORDER BY add_time DESC;";
            break;
        default:
            var sql = "SELECT * FROM list;";
    }
    var db = $sqlite.open(listDB);
    var object = db.query(sql);
    var listData = object.result;
    var tmpData = [];
    while (listData.next()) {
        tmpData.push(listData.values);
    }
    return tmpData;
}

function formatExpressData(data) {
    var tmpData = [{
        "rows": []
    }];
    for (let i in data) {
        tmpData[0].rows.push({
            title: {
                text: "取件码 👉 " + data[i].qr_number
            },
            content: {
                text: date.formatDate(data[i].add_time) + "" + data[i].sms
            }
        })
    }
    return tmpData;
}

function creat(db) {
    listDB = db;
    unTakeData = getExpressList("un_take");
    takeData = getExpressList("take");
    favData = getExpressList("fav");
    creatListUI();
}

function creatListUI() {
    $ui.render({
        props: {
            title: "我的快递",
            navButtons: [{
                title: "设置",
                icon: "002",
                handler: function () {
                    $ui.push(setting.creatUI());
                }
            }]
        },
        views: [{
                type: "menu",
                props: {
                    items: ["待取件", "已取件", "收藏"]
                },
                layout: function (make) {
                    make.left.top.right.equalTo(0)
                    make.height.equalTo(44)
                },
                events: {
                    changed: function (sender) {
                        var index = sender.index
                        if (index == 0) {
                            $("take").hidden = true;
                            $("un-take").hidden = false;
                            $("fav").hidden = true;
                        } else if (index == 1) {
                            $("un-take").hidden = true;

                            $("take").hidden = false;
                            $("fav").hidden = true;
                        } else if (index == 2) {
                            $("fav").hidden = false;
                            $("take").hidden = true;
                            $("un-take").hidden = true;
                        }
                    }
                }
            },
            {
                type: "list",
                props: {
                    id: "un-take",
                    grouped: true,
                    bgcolor: $color("#fff"),
                    rowHeight: 64.0,
                    template: listTemplate(),
                    data: formatExpressData(unTakeData),
                    actions: [{
                            title: "已取件",
                            color: $color("tint"),
                            handler: function (sender, index) {
                                takeItem(unTakeData[index.row].id, 1); //数据库操作
                                sender.delete($indexPath(0, index.row)); //删除列
                                unTakeData.splice(index.row, 1); //删除数组中的数据
                                takeData = getExpressList('take');
                                $("take").data = formatExpressData(takeData);
                            }
                        },
                        {
                            title: "收藏",
                            handler: function (sender, index) {
                                favItem(unTakeData[index.row].id, 1);
                                favData = getExpressList('fav');
                                $("fav").data = formatExpressData(favData);
                            }
                        }
                    ]
                },
                layout: function (make, view) {
                    make.top.equalTo($("menu").bottom);
                    make.size.equalTo($size(screen.width, screen.height - 44));
                },
                events: {
                    didSelect: function (tableView, index) {
                        listEvent(unTakeData[index.row].qr_number.toString(), unTakeData[index.row].sms);
                    }
                }
            },
            {
                type: "list",
                props: {
                    id: "take",
                    grouped: true,
                    bgcolor: $color("#fff"),
                    rowHeight: 64.0,
                    template: listTemplate(),
                    data: formatExpressData(takeData),
                    hidden: true,
                    actions: [{
                            title: "删除",
                            color: $color("red"),
                            handler: function (sender, index) {
                                $ui.alert({
                                    title: "删除",
                                    message: "确认要删除这个快递信息吗？",
                                    actions: [{
                                        title: "取消",
                                        handler: function () {}
                                    }, {
                                        title: "删除",
                                        handler: function () {
                                            deleteItem(takeData[index.row].id);
                                            takeData.splice(index.row, 1);
                                            sender.delete($indexPath(0, index.row));
                                        }
                                    }]
                                })

                            }
                        },
                        {
                            title: "撤销取件",
                            color: $color("tint"),
                            handler: function (sender, index) {
                                takeItem(takeData[index.row].id, 0);
                                sender.delete($indexPath(0, index.row));
                                takeData.splice(index.row, 1);
                                unTakeData = getExpressList('un_take');
                                $("un-take").data = formatExpressData(unTakeData);
                            }
                        }
                    ]
                },
                layout: function (make, view) {
                    make.top.equalTo($("menu").bottom);
                    make.size.equalTo($size(screen.width, screen.height - 44));
                },
                events: {
                    didSelect: function (tableView, index) {
                        listEvent(takeData[index.row].qr_number.toString(), takeData[index.row].sms);
                    }
                }
            },
            {
                type: "list",
                props: {
                    id: "fav",
                    grouped: true,
                    bgcolor: $color("#fff"),
                    rowHeight: 64.0,
                    template: listTemplate(),
                    data: formatExpressData(favData),
                    hidden: true,
                    actions: [{
                        title: "取消收藏",
                        handler: function (sender, index) {
                            favItem(favData[index.row].id, 0);
                            sender.delete($indexPath(0, index.row));
                            favData.splice(index.row, 1);
                        }
                    }]
                },
                layout: function (make, view) {
                    make.top.equalTo($("menu").bottom);
                    make.size.equalTo($size(screen.width, screen.height - 44));
                },
                events: {
                    didSelect: function (tableView, index) {
                        listEvent(favData[index.row].qr_number.toString(), favData[index.row].sms);
                    }
                }
            }
        ]
    })
}

function listTemplate() {
    return [{
            type: "label",
            props: {
                id: "title",
                font: $font(18)
            },
            layout: function (make) {
                make.left.equalTo(15)
                make.top.right.inset(8)
                make.height.equalTo(24)
            }
        },
        {
            type: "label",
            props: {
                id: "content",
                textColor: $color("#888888"),
                font: $font(15)
            },
            layout: function (make) {
                make.left.right.equalTo($("title"))
                make.top.equalTo($("title").bottom)
                make.bottom.equalTo(0)
            }
        }
    ]
}

function listEvent(qrCodeNumber, sms) {
    var image = $qrcode.encode(qrCodeNumber)
    $ui.push({
        views: [{
            type: "image",
            props: {
                image: image
            },
            layout: function (make, view) {
                make.centerX.equalTo(view.super);
                make.top.equalTo(20);
                make.size.equalTo($size(200, 200));
            }
        }, {
            type: "label",
            props: {
                id: "qr-number",
                text: qrCodeNumber,
                align: $align.center,
                font: $font(24)
            },
            layout: function (make, view) {
                make.centerX.equalTo(view.super);
                make.top.equalTo($("image").bottom).offset(10);
            }
        }, {
            type: "label",
            props: {
                text: sms,
                font: $font(14),
                lines: 0,
                color: $color("gray")
            },
            layout: function (make, view) {
                make.top.equalTo($("qr-number")).offset(30);
                make.width.equalTo(screen.width - 40);
                make.left.inset(20);
                make.height.equalTo(100);
            }
        }]
    })
}

function takeItem(id, act) {
    var db = $sqlite.open(listDB);
    result = db.update({
        sql: "UPDATE list SET is_take = (?) WHERE id = (?);",
        args: [act, id]
    })
    $sqlite.close(db);
    if (result.result && act == 1) {
        $ui.toast("取件完成");
    } else if (result.result && act == 0) {
        $ui.toast("撤销取件");
    }
}

function favItem(id, act) {
    var db = $sqlite.open(listDB);
    result = db.update({
        sql: "UPDATE list SET is_fav = (?) WHERE id = (?);",
        args: [act, id]
    })
    $sqlite.close(db);
    if (result.result && act == 1) {
        $ui.toast("收藏成功");
    } else if (result.result && act == 0) {
        $ui.toast("撤销收藏");
    }
}

function deleteItem(id) {
    var db = $sqlite.open(listDB);
    result = db.update({
        sql: "DELETE FROM list WHERE id = (?);",
        args: [id]
    })
    $sqlite.close(db);
}

module.exports = {
    creat: creat,
}