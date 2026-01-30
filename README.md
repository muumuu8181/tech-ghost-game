# テック肝試し - レーダープロトタイプ

**現在のバージョン**: v0.17
**デプロイ先**: https://muumuu8181.github.io/tech-ghost-game/

## 概要

「テクノロジー×肝試し」の単体版プロトタイプです。

## 機能

- 📍 GPSで現在地を取得・表示
- 👻 化け物の位置を固定表示
- 📏 化け物との距離を計算
- 🔊 距離に応じて足音SEの音量が変化
- 🗺️ 地図モードとレーダーモードの切り替え

## 技術スタック

- HTML5 + JavaScript (単一ファイル構成)
- Leaflet.js（地図表示）
- Web Audio API（音声生成）

## 使い方

1. このファイルをWebサーバーで配布
2. スマホのブラウザでアクセス
3. GPSの許可を求められるので「許可」
4. 音声ONボタンをタップ

### ローカルで動かす場合

```bash
# Pythonの場合
python -m http.server 8000

# Node.jsの場合
npx serve
```

その後、スマホとPCを同じWi-Fiに接続し、
`http://[PCのIPアドレス]:8000` にアクセス

## 設定

`js/app.js` の `CONFIG` オブジェクトで調整：

```javascript
const CONFIG = {
    monsterPosition: { lat: 35.3606, lng: 138.7274 }, // 化け物の位置
    maxHearingDistance: 100,  // 音が聞こえ始める距離(m)
    minHearingDistance: 5,    // 最大音量になる距離(m)
    updateInterval: 1000      // 更新間隔(ms)
};
```

## 注意点

- GPSは屋外でないと正確に取得できません
- スマホのブラウザは画面オフでGPS/音声が止まります
- 音声はブラウザ生成なので、品質は簡易的です

## 今後の拡張

- Firebaseで複数端末同期
- 化け物の自動移動（AI）
- 運営管理画面
- 役割分担機能
- QRコードチェックポイント

## ドキュメント

詳細な開発経緯やトラブルシューティングは [`docs/`](./docs/) フォルダを参照してください。

- [04_project_status.md](./docs/04_project_status.md) - **プロジェクト現状報告書**（第三者が見るべき最初の資料）
- [03_development_log.md](./docs/03_development_log.md) - 詳細な開発ログ
- [01_original_idea.txt](./docs/01_original_idea.txt) - 最初のアイデア出し
- [02_ios_safari_research_sources.txt](./docs/02_ios_safari_research_sources.txt) - iOS Safari調査資料

## バージョン履歴

- v0.17 (2026-01-30) - 音声ON/OFFボタンのデザイン改善
- v0.16 (2026-01-30) - Canvas IndexSizeError修正、iPhone音声問題解決
- v0.15 (2026-01-30) - Howler.Howler.ctx undefinedエラー修正
- v0.10-v0.14 - 各種バグ修正と機能追加

詳細は [DEVELOPMENT_LOG.md](./docs/03_development_log.md) を参照してください。
