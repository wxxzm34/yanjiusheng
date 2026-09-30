# 烟酒生

卡通小本本，记下每天的烟和酒。界面是中文的，语气轻松，不打分。

网页上的记录只存在这台浏览器里（localStorage），没有账号。微信汇总需要一台一直开着的服务器，见下文。第一次打开是空白的，想看报表长什么样可以点「试试示例」，再在装扮页清空。

## 本地运行

```bash
npm install
npm run dev
```

浏览器打开 [http://127.0.0.1:43123](http://127.0.0.1:43123)。

开发服务器监听 `0.0.0.0:43123`。

## 网页里有什么

- 记一支烟：点一下就记下时间。心情可以事先选，也可以刚记完再改。记完会播一小段原创漫画：小英雄发射激光，气泡里是固定的那句台词，可以跳过，页面不会卡住。
- 记一杯酒：红酒、白酒、啤酒、家酿、黄酒，或自己写名字的「其他」。可以选心情、写地点。每种酒有一段更轻的反应。
- 记录：改心情、改酒的种类和地点、删除。今天抽了几支是从记录数出来的。
- 月报 / 年报：打开就看当前月和年，也能切到有记录的其他月份、年份。
- 分享：今天、这个月或这一年。可以复制文字；浏览器允许时走系统分享；也可以把卡通卡片存成图片。
- 装扮：4 套背景、3 套皮肤。台灯角落、晒被子的阳台和星焰一开始就能用，其余点「下载」后保存在本地，再点「使用」。

## 微信小程序

`miniprogram/` 是同一套流程的原生小程序（记烟、记酒、心情、地点、月报年报、复制分享文字、皮肤和背景）。

用微信开发者工具打开 `miniprogram` 目录即可。`project.config.json` 里的 AppID 是游客号 `touristappid`，不需要自己的 AppID。这个环境里跑不了小程序运行时，网页版是完整体验。

首页有「汇总设置」。说明见「微信汇总」。

## 微信汇总

小程序首页点「汇总设置」，可以打开每日汇总、每月汇总、每年汇总，并选发送时间。每月、每年还可以选哪一天。时间按北京时间。

到点后，微信收到一条消息：今日、本月或今年，烟几支，酒几杯。三个开关共用一个模板。每次点允许只能收一条，发出去就用掉一次。没有长期订阅。网页不会收到这条，首页写了一句「微信汇总在小程序里设置。」

手机不用开着。小程序打开时，以及每次保存记录时，会把烟和酒的时间上传。服务器用微信的 openid 认出是谁，没有另外的账号。

这个仓库没有部署配置，也没有线上地址。数据写在服务器磁盘的 `data/wechat-users.json`，重启还在。要发出去，需要一直跑着 `npm run start`，进程每分钟自己检查一次。也可以另外用定时任务，每分钟访问一次，效果一样：

```bash
curl -X POST -H "Authorization: Bearer 你的密钥" https://你的域名/api/cron/wechat-summary
```

换一台机器，或者用没有磁盘的托管，记录会丢，到点也发不出去。

小程序里的网站地址写在 `miniprogram/config.js` 的 `apiBase`，例如 `https://你的域名`，末尾不要斜杠。真机要 https，并在微信公众平台把这个域名加进 request 合法域名。

下面这些先空着也行。模板编号或 AppSecret 空着时，设置页仍能用，发送任务不会发微信，日志里会写原因。AppSecret 和模板 ID 还没有之前，没法真的发到微信。

- `WECHAT_APPSECRET`：小程序 AppSecret
- `WECHAT_TEMPLATE_ID`：订阅消息模板 ID
- `WECHAT_CRON_SECRET`：上面那个定时地址的密钥
- `WECHAT_APPID`：可不填。不填就读 `miniprogram/project.config.json`。现在文件里是 `touristappid`，微信不认，正式使用要填真实 AppID

申请模板时只要一个模板，三个词：时段（事物，内容会是今日、本月、今年）、烟（数字）、酒（数字）。字段名默认 `thing1`、`number2`、`number3`。不一样就再填 `WECHAT_FIELD_PERIOD`、`WECHAT_FIELD_SMOKES`、`WECHAT_FIELD_DRINKS`。开发版把 `WECHAT_MINIPROGRAM_STATE` 设成 `developer`，体验版设成 `trial`，正式版不用填。

没有 31 号的月份，会改到当月最后一天。到点之后的 10 分钟内发出。同一分钟如果每日和每月都到了，会各发一条，每条用掉一次允许。

## Run locally

```bash
npm install
npm run dev
```

Open http://127.0.0.1:43123. The WeChat mini program lives in `miniprogram/` and opens with WeChat DevTools. WeChat summaries are set in the mini program; see the Chinese section “微信汇总”.
