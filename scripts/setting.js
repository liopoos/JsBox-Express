var screen = $device.info.screen;

function creatUI() {
    var settingJson = JSON.parse($file.read("assets/conf.json").string).regex;
    var keyword = settingJson.keyword;
    var len = settingJson.number[1];
    return {
        props: {
            id: "setting",
            title: "设置",
            bgcolor: $color("white")
        },
        views: [{
            type: "scroll",
            layout: function (make, view) {
                make.height.equalTo(view.super)
                make.width.equalTo(view.super)
            },
            views: [{
                type: "input",
                props: {
                    id: "keyword-input",
                    type: $kbType.default,
                    placeholder: "添加一个关键词"
                },
                layout: function (make, view) {
                    make.top.equalTo(10);
                    make.width.equalTo(view.super).offset(-90);
                    make.left.equalTo(10);
                    make.height.equalTo(40);
                }
            }, {
                type: "button",
                props: {
                    title: "添加"
                },
                layout: function (make, view) {
                    make.top.equalTo(10);
                    make.left.equalTo($("keyword-input").right).offset(5);
                    make.size.equalTo($size(70, 40));
                },
                events: {
                    tapped: function (sender) {
                        keyword.push($("keyword-input").text);
                        $("keyword-input").blur();
                        $("keyword-list").insert({
                            indexPath: $indexPath(0, 0),
                            value: $("keyword-input").text
                        });
                        save(keyword, len);
                    }
                }
            }, {
                type: "list",
                props: {
                    id: "desc-lable",
                    data: [{
                        title: "数量",
                        rows: ["最大取件码"]
                    }],
                    bgcolor: $color("white")
                },
                layout: function (make, view) {
                    make.top.equalTo($("keyword-input").bottom).offset(10);
                    make.width.equalTo(view.super);
                    make.height.equalTo(100);
                },
            }, {
                type: "label",
                props: {
                    id: "len-number",
                    text: len.toString(),
                    align: $align.center
                },
                layout: function (make, view) {
                    make.left.equalTo($("desc-lable").right).offset(-130);
                    make.top.equalTo($("keyword-input").bottom).offset(71);
                }
            }, {
                type: "stepper",
                props: {
                    max: 18,
                    min: 4,
                    value: 1
                },
                layout: function (make, view) {
                    make.left.equalTo($("desc-lable").right).offset(-98);
                    make.top.equalTo($("keyword-input").bottom).offset(67);
                },
                events: {
                    changed: function (sender) {
                        $("len-number").text = "" + sender.value
                        len = sender.value;
                        save(keyword, len);
                    }
                }
            }, {
                type: "list",
                props: {
                    id: "keyword-list",
                    reorder: true,
                    data: [{
                        title: "关键词",
                        rows: keyword,
                    }],
                    bgcolor: $color("white"),
                    actions: [{
                        title: "删除",
                        color: $color("red"),
                        handler: function (sender, index) {
                            sender.delete($indexPath(0, index.row));
                            keyword.splice(index.row, 1);
                            save(keyword, len);
                        }
                    }]
                },
                layout: function (make, view) {
                    make.top.equalTo($("desc-lable").bottom);
                    make.width.equalTo(view.super);
                    make.height.equalTo(400);
                },
            }]
        }]
    };
}

function save(keyword, len) {
    var data = {
        "regex": {
            "keyword": keyword,
            "number": [4, len]
        }
    };
    var success = $file.write({
        data: $data({
            string: JSON.stringify(data)
        }),
        path: "assets/conf.json"
    })
}

module.exports = {
    creatUI: creatUI
}