## zac交通費申請自動入力ツール

### バージョン情報
```node v16.13.2```

### 環境構築
```
$ git clone git@github.com:KeisukeYamane/zac-expense-application.git
$ npm ci
$ cp .env.exmaple .env
```
```.env```に下記の内容を追加してください。
```
USER_ID= ← zacで使用しているユーザーID
PASSWORD= ← zacで使用しているパスワード
JOB_NO= ← 該当月ののjob No
LOGIN_PAGE_URL= ← ログインページのURL
KEIHI_ZENPAN_PAGE_URL= ← 「経費全般」画面のURL
SECTION_OF_LINE=渋谷←→新橋  ← 乗車区間(左記は例です)
```

### 実行
```$ npm start```

申請月の出勤日数を入力し、往復分の交通費を入力してください。

その後、Chromiumが起動し、明細登録まで行います。   
※ 入力内容に誤りがないか確認した上で、***申請は各自で行なってください。***     
