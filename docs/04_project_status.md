# テック肝試し - プロジェクト現状報告書

**最終更新**: 2026-01-30 21:40
**現在のバージョン**: v0.17
**デプロイ先**: https://muumuu8181.github.io/tech-ghost-game/

---

## 1. プロジェクト概要

### 目的
テクノロジーと肝試しを融合させた、新感覚のリアルタイム追跡ゲームの**単体版プロトタイプ**開発。

### 基本機能
- ✅ GPSで現在地を取得
- ✅ 化け物の位置を地図・レーダーに表示
- ✅ 距離に応じた足音SEの再生
- ✅ 地図モードとレーダーモードの切り替え
- ✅ iPhone対応（iOS Safariでの音声再生）

### 技術スタック
- **フロントエンド**: HTML5 + CSS3 + Vanilla JavaScript
- **地図表示**: Leaflet.js (OpenStreetMap)
- **音声再生**: Howler.js (Web Audio APIラッパー)
- **ホスティング**: GitHub Pages (HTTPS必須：iOS GPS要件)

---

## 2. 開発経緯（バージョン履歴）

### v0.10 (2026-01-30 20:15)
- 初期プロトタイプ完成
- 地図表示、GPS追跡、音声再生の基本機能実装
- 問題：PCでしか動かない（HTTPだとGPSが使えない）

### v0.11 (2026-01-30 20:25)
- iOS AudioContext対応として`unlockAudio()`関数追加
- 問題：解決せず

### v0.12-v0.13
- 各種デバッグ機能追加
- 音声プール設定調整
- 問題：依然として音が鳴らない

### v0.14 (2026-01-30 20:45)
- **重大なエラー発見**: `Howler.Howler.ctx` undefined
- Canvas半径エラー（負の値）
- 状況：PCでも音が鳴らなくなった

### v0.15 (2026-01-30 21:30)
- `Howler.Howler.ctx`への安全なアクセス実装
- Canvas半径計算の修正
- 結果：PCで音が鳴るようになったが、iPhoneではダメ

### v0.16 (2026-01-30 21:35)
- Canvas IndexSizeError完全修正（描画前のサイズチェック）
- iPhoneの物理スイッチ（サイレントモード）が原因と判明
- **解決**: 音が鳴るようになった！

### v0.17 (2026-01-30 21:37)
- 音声ON/OFFボタンのデザイン改善
- OFF時：グレー（地味）
- ON時：緑（目立つ）

---

## 3. 主要なトラブルシューティング

### 問題1: iPhoneで音が鳴らない（v0.10-v0.15）

**現象**:
- PC: 音が鳴る
- iPhone: 全く音が鳴らない
- でもYouTubeは鳴っている

**調査**:
- NotebookLMでYouTube動画11本を元にAI調査
- 「AudioContextはユーザー操作が必要」などの情報を取得
- しかし、解決には至らなかった

**原因**:
- iPhoneの**物理サイレントスイッチ**（左側面）が下向き（ミュート）になっていた
- iOSの仕様:
  - `<video>`タグ（YouTube）: ミュートスイッチを無視して鳴る
  - Web Audio API（Howler.js、オシレーター）: ミュートスイッチに従う

**解決策**:
- スイッチを上（サウンドON）にする
- アプリ側からは制御不可能（iOS仕様）

**教訓**:
> 「YouTubeは鳴るのにアプリは鳴らない」 = 「サイレントスイッチのせいかも！」

---

### 問題2: Canvas IndexSizeError（v0.14-v0.16）

**現象**:
```
Uncaught IndexSizeError: Failed to execute 'arc' on 'CanvasRenderingContext2D':
The radius provided (-6.66667) is negative.
```

**原因**:
- `DOMContentLoaded`時点ではCanvasのサイズがまだ0
- `radarCanvas.width`や`radarCanvas.height`が0
- `maxRadius = Math.min(width, height) / 2 - 20` が負の値に

**解決策**:
```javascript
function drawRadar() {
    const width = radarCanvas.width;
    const height = radarCanvas.height;

    // Canvasのサイズが0の場合は描画をスキップ
    if (width <= 0 || height <= 0) {
        requestAnimationFrame(drawRadar);
        return;
    }
    // ...
}
```

---

### 問題3: Howler.Howler.ctx undefined（v0.14-v0.15）

**現象**:
```javascript
Uncaught TypeError: Cannot read properties of undefined (reading 'ctx')
```

**原因**:
- `onload`コールバック内で`this.state()`を呼んでいるが、`Howler.Howler.ctx`がまだ初期化されていない
- Howler.jsの初期化タイミングの問題

**解決策**:
```javascript
// 安全にチェック
if (typeof Howler !== 'undefined' && Howler.Howler && Howler.Howler.ctx) {
    console.log('AudioContext state:', Howler.Howler.ctx.state);
} else {
    console.log('AudioContext: not initialized');
}
```

---

## 4. 既知の問題

### 2026-01-30 21:40時点

**解決済み**:
- ✅ Canvas IndexSizeError
- ✅ Howler.Howler.ctx undefined
- ✅ iPhoneでの音声再生

**残課題**:
- ⚠️ 音声ONボタンを押しても音が鳴らない現象が報告されている（v0.17）
  - 原因調査中
  - デバッグパネルのテストボタンは動作している

---

## 5. ファイル構成

```
memo_hiu/
├── .git/                    (Gitリポジトリ)
├── assets/
│   └── sounds/
│       └── footsteps.mp3   (足音SE: 238KB)
├── css/
│   └── style.css           (スタイルシート)
├── js/
│   └── app.js              (メインロジック)
├── docs/
│   ├── 01_original_idea.txt               (最初のアイデア出し)
│   ├── 02_ios_safari_research_sources.txt (YouTube URLリスト)
│   ├── 03_development_log.md              (詳細な開発ログ)
│   └── 04_project_status.md               (このファイル)
├── index.html              (メインHTML)
└── README.md               (GitHub用説明)
```

---

## 6. デプロイ環境

### GitHub Pages
- **URL**: https://muumuu8181.github.io/tech-ghost-game/
- **ブランチ**: `master`
- **自動デプロイ**: `git push`で即座に反映（1-2分）

### ワークフロー
```bash
# 1. 変更をステージング
git add .

# 2. コミット（バージョン番号を含める）
git commit -m "fix: v0.xx 修正内容"

# 3. プッシュ
git push

# 4. 1-2分待ってから、ブラウザで強制リロード（Ctrl + Shift + R）
```

---

## 7. 第三者が見るべき資料

1. **README.md** (ルート)
   - プロジェクトの概要
   - 基本的な使い方
   - リポジトリの説明

2. **docs/04_project_status.md** (このファイル)
   - 現在の状況
   - 開発経緯
   - 既知の問題と解決策

3. **docs/03_development_log.md**
   - 詳細な開発ログ
   - 日時ごとの変更内容
   - NotebookLM調査結果

4. **docs/02_ios_safari_research_sources.txt**
   - iOS Safari Web Audio問題の参考動画URL
   - YouTube検索結果

---

## 8. 今後の課題

### 技術的改善
- [ ] 音声ONボタンの動作不安定（v0.17で発生中）
- [ ] 距離計算の精度検証
- [ ] レーダー表示の滑らかにする

### 機能追加
- [ ] 化け物の自動移動（AI制御）
- [ ] マルチプレイ対応
- [ ] 運営管理画面
- [ ] 効果音の追加（心拍音、風切り音など）

### ドキュメント
- [ ] ユーザーマニュアル作成
- [ ] 運営マニュアル作成
- [ ] トラブルシューティング集の充実

---

## 9. 連絡先・参考情報

### リポジトリ
- GitHub: https://github.com/muumuu8181/tech-ghost-game

### 参考: NotebookLMノートブック
- ノートブック名: iOS Safari Web Audio問題解決策
- URL: https://notebooklm.google.com/notebook/abc93cd7-c968-443d-946b-167b0be419ca

### 開発ツール
- Claude Code (AIアシスタント)
- GitHub Actions (自動デプロイ)
- Chrome DevTools (デバッグ)

---

## 10. まとめ

**現状**: v0.17として基本機能完成。iPhoneでの音声再生問題も解決済み。

**最大の成果**:
- 単体版プロトタイプが動作している
- iOS Safariの特殊仕様（サイレントスイッチ）を特定・解決
- GitHub Pagesでの自動デプロイ環境構築

**次のステップ**:
- 音声ONボタりの不具合調査
- 機能追加の検討（AI制御、マルチプレイ等）

---

**作成者**: Claude Sonnet 4.5 (AIアシスタント)
**作成日時**: 2026-01-30 21:40
**用途**: 第三者がいつでも状況を把握できるためのプロジェクト現状報告書
