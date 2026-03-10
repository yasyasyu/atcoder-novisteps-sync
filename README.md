# AtCoder NoviSteps Auto Sync

AtCoder での AC 状況を、[AtCoder NoviSteps](https://atcoder-novisteps.vercel.app/) へ自動的に同期するための Chrome 拡張機能（非公式）です。

## 開発の背景

[AtCoder NoviSteps](https://atcoder-novisteps.vercel.app/) は、けんちょん（@drken）さんを始めとする有志の方々や、スポンサーの方々の尽力によって運営されている、競プロ学習者にとって最高の「道標」です。人力で丁寧に選定された問題セットは、私のような茶色コーダーが次の一歩（入緑）を踏み出すために欠かせない存在となっています。

この素晴らしいロードマップをよりスムーズに活用したい、そして「精進そのものに全神経を集中させたい」という想いから、自動同期ツールを作成しました。

## 特徴

- **ワンタップ同期:** ページを開くと、[AtCoder Problems](https://kenkoooo.com/atcoder/) API から最新の AC 状況を取得し、自動で NoviSteps の進捗に反映します。
- **低負荷設計:** サーバーへの敬意を忘れず、リクエスト間に適切な待機時間を設けています。

## 使い方（デベロッパーモードでの導入）

1. このリポジトリを ZIP でダウンロードし、解凍します。
2. `content.js` の冒頭にある `const USER_ID = "あなたのID";` を、自分の AtCoder ID に書き換えて保存してください。
3. Chrome で `chrome://extensions/` を開きます。
4. 「デベロッパーモード」を ON にし、「パッケージ化されていない拡張機能を読み込む」からフォルダを選択してください。

## 謝辞とリスペクト

本ツールは、以下の素晴らしいサービスと、その開発者・運営者様に心からの敬意を表して作成されました。

- **[AtCoder NoviSteps](https://atcoder-novisteps.vercel.app/)** 様（発起人：@drken1215 様、および開発メンバーの皆様）
- **[AtCoder Problems](https://kenkoooo.com/atcoder/)** 様（@kenkoooo 様）
- **[AtCoder](https://atcoder.jp/)** 様（AtCoder株式会社 様）

## 免責事項

- 本ツールは個人が作成した**完全非公式**のツールです。
- 本ツールに関するお問い合わせを、NoviSteps 運営チームや AtCoder 株式会社様へ行わないでください。
- ご利用は自己責任でお願いします。

## License

[MIT License](./LICENSE)
