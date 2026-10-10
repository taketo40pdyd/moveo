# Moveo

口座間資金移動・振込・通帳・家計簿アプリ(PWA)。すべてのファイルを同じ階層(フォルダなし)に置く構成です。

## 公開手順(GitHub Pages)

1. GitHub で新しいリポジトリを作成します(例: `moveo`、Public)。
2. このフォルダの中身を **すべて** リポジトリ直下にアップロードします。
   「Add file → Upload files」に全ファイルをドラッグして Commit するだけで構いません(コマンド不要)。
   `.nojekyll` は隠しファイルなので、ドラッグで入らない場合は「Add file → Create new file」で `.nojekyll` という名前の空ファイルを作ってください。
3. **Settings → Pages → Build and deployment**
   - Source: **Deploy from a branch**
   - Branch: **main** / フォルダ: **/ (root)** → Save
4. 1〜2分後、`https://<ユーザー名>.github.io/<リポジトリ名>/` で開けます。

## 公開前に必ず確認

- **Firebase Authentication の承認済みドメイン**に `<ユーザー名>.github.io` を追加する
  (Firebase コンソール → Authentication → Settings → 承認済みドメイン)。未設定だとログイン(Google ログインを含む)が失敗します。
- **Firestore のセキュリティルール**で、自分のデータは本人だけが読み書きできるようにする。
- プッシュ通知を使う場合は、Cloud Messaging のウェブプッシュ証明書(VAPID キー)と送信側の設定が必要です。

## 更新するとき

`index.html` などを差し替えたら、`sw.js` の次の行を書き換えてからアップロードしてください(例: `v1` → `v2`)。
書き換えないと、利用者の端末に古いキャッシュが残り、更新が反映されにくくなります。

```
const VER = "moveo-v1";
```

## ファイル一覧

| ファイル | 役割 |
|---|---|
| `index.html` | アプリ本体 |
| `manifest.webmanifest` | PWA の名前・アイコン・ショートカット |
| `sw.js` | オフライン対応・プッシュ通知 |
| `icon-192.png` `icon-512.png` `icon-maskable-512.png` `apple-touch-icon.png` | アイコン |
| `404.html` | 存在しない URL をトップへ戻す |
| `.nojekyll` | GitHub Pages の Jekyll 処理を無効化 |
| `robots.txt` | 検索エンジン向け設定 |
