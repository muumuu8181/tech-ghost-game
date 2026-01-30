# テック肝試しプロジェクト - 開発ログ

## プロジェクト概要

**目標**：テクノロジー×肝試しの融合した新感覚肝試しシステムの単体版プロトタイプ開発

**基本機能**：
- GPSで現在地を取得
- 化け物の位置を表示
- 距離に応じた足音SEの再生
- 地図モードとレーダーモードの切り替え

**技術スタック**：
- HTML5 + CSS3 + Vanilla JavaScript
- Leaflet.js（地図表示）
- Howler.js（音声再生）
- GitHub Pages（ホスティング）

---

## 開開経緯

### 2026-01-30 開始

#### 1. プロジェクト構築（18:34）
- フォルダ構成を作成
- 単一HTMLファイルでプロトタイプを実装
- ローカルサーバー（`python -m http.server 8000`）で動作確認
- URL: `http://192.168.1.18:8000`

**課題**：HTTPだからGPSが使えない（iOS Safariの制限）

#### 2. HTTPS対応（19:00前後）
- Netlify Dropを試す
- 1時間限定のURL + パスワード保護
- QRコード生成してスマホでアクセス

**課題**：毎回ドラッグ&ドロップするのが面倒

#### 3. GitHub Pages導入（19:20頃）
- GitHubリポジトリ作成：`https://github.com/muumuu8181/tech-ghost-game`
- GitHub Pagesを有効化
- 自動デプロイ環境を構築
- URL: `https://muumuu8181.github.io/tech-ghost-game/`

**ワークフロー**：
```bash
git add .
git commit -m "message"
git push
```

これで自動更新されるように。

---

## 音声実装の試行錯誤

### 問題1：音が出ない

#### 試行1：ブラウザ生成音（Web Audio API Oscillator）
- 三角波で合成した音を使用
- **結果**：音は鳴るが「足音」に聞こえない

#### 試行2：音声ファイルの導入
- ファイル：`砂利の上を歩く.mp3`（238KB）
- 配置：`assets/sounds/footsteps.mp3`
- Howler.jsで実装

**設定の変遷**：
1. `html5: true` → 音声プール枯渇エラー
2. `html5: false` + `pool: 5` → PCで動作、iPhoneで動作せず
3. iOS向け `unlockAudio()` 関数追加 → まだ動作せず

---

## 現在の問題（v0.11）

### PC（Chrome/Edge）
✅ 動作する
- 音声ファイル読み込み成功
- テストボタンで音が鳴る
- 距離計算も正常

### iPhone Safari
❌ 音が出ない
- 音声ファイル読み込み成功（ログに出る）
- 「AudioContext resumed」ログが出る
- テスト終了までログが流れる
- **しかし実際の音は鳴らない**

#### ログ出力
```
[20:17:14] HTML5 Audio pool exhausted, returning potentially locked audio object.
[20:17:14] ✅ 音声ファイル読み込み成功
[20:17:21] 🔊 音量MAXでテスト再生
[20:17:21] ▶️ 再生開始 ID: [sound_id]
[20:17:24] ⏸️ テスト終了
```

---

## 原因分析

### 考えられる原因

1. **iOSの厳しい自動再生ポリシー**
   - ユーザーの明示的な操作が必要
   - AudioContextが'suspended'のままになっている可能性

2. **Howler.jsの設定問題**
   - `html5: false`（Web Audio API使用）がiOSでうまく動いていない
   - `pool: 5`設定が影響している可能性

3. **iPhoneのサイレントモード**
   - サイドスイッチがミュートになっていると、Web Audio APIは鳴らない

4. **音量設定**
   - iOSのシステム音量が下がっている

---

## 解決策の候補

### 次に試すべきこと

1. **html5: trueに戻す**
   - Web Audio APIではなく、HTML5 Audio要素を使う
   - iOSとの互換性が高い

2. **ユーザー操作の改善**
   - 最初に「音声を有効にする」明示的なボタンを追加
   - そのクリックでAudioContextを確実にレジューム

3. **HTML5 Audioを直接使う**
   - Howler.jsをやめて、素のAudio要素を使う
   - シンプルで制御しやすい

4. **iOS検証用の簡易版を作る**
   - 最低限のコードで音が出るか確認
   - 問題の切り分け

---

## バージョン履歴

| バージョン | 日時 | 変更点 |
|-----------|------|--------|
| v0.10 | 20:15 | バージョン表示追加、Canvasバグ修正 |
| v0.11 | 20:25 | iOS AudioContext対応、unlockAudio()追加 |

---

## 次回の作業

1. **html5: true** に変更してテスト
2. 音声ファイルのプリロードを改善
3. iOS専用のシンプル版を作成して動作確認

---

## 参考リンク

### Howler.js iOS対応
- https://howlerjs.com/howler-on-ios-11/

### Web Audio API iOS対応
- https://developer.apple.com/documentation/webkit/delivering_audio_content_for_ios/

### MDN Web Audio API
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

---

## ファイル構成

```
memo_hiu/
├── index.html          # メインHTML
├── css/
│   └── style.css      # スタイル
├── js/
│   └── app.js         # ロジック
├── assets/
│   └── sounds/
│       └── footsteps.mp3   # 足音SE
└── README.md          # ドキュメント
```

---

## コミットログ

- `feat: add tech ghost game prototype` (初回)
- `refactor: move files to root for GitHub Pages`
- `fix: move monster closer (10m away)`
- `debug: add console logs for audio`
- `feat: add debug panel UI`
- `feat: add force sound test buttons`
- `fix: change html5 to true and improve sound test`
- `feat: add version display (v0.10) and fix canvas radius bug`
- `fix: audio pool issue and add cache control`
- `fix: iOS audio support (v0.11)` (最新)

---

## NotebookLMによる調査結果（2026-01-30 20:45）

### YouTube動画のAI要約

NotebookLMを使用して、YouTube動画11本からiOS Safari Web Audio問題の解決策を抽出しました。

ノートブック名：**iOS Safari Web Audio問題解決策**
URL: https://notebooklm.google.com/notebook/abc93cd7-c968-443d-946b-167b0be419ca

### 主な発見

#### iOS Safariで音声再生が遅延する原因

1. **再生ごとの再ダウンロード・再初期化**
   - iOS Safariでは`<audio>`タグ使用時、再生のたびにファイルを再ダウンロード
   - **約0.5秒〜1秒の遅延**が発生

2. **preload属性が無効化される**
   - `preload="auto"`が無視される
   - 事前バッファリングが不可能

3. **ユーザーインタラクションの厳格な制限**
   - 自動再生がブロックされ、タップ操作が必要
   - ソース切り替え時に再読み込みが発生

### 解決策：Web Audio API（AudioContext）の使用

#### 1. AudioContextの初期化と有効化（ユーザー操作必須）

```javascript
// クロスブラウザ対応のAudioContext作成
var AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();

// ユーザー操作（クリック/タップ）イベント内の処理
function handleUserInteraction() {
    // コンテキストが一時停止状態なら再開させる
    if (context.state === 'suspended') {
        context.resume().then(function() {
            console.log('AudioContext resumed!');
        });
    }
}

// ボタンにイベントリスナーを設定
document.getElementById('playButton').addEventListener('click', handleUserInteraction);
```

#### 2. 音声データの事前読み込み（バッファリング）

```javascript
var audioBuffers = {}; // 読み込んだ音声を保存するオブジェクト

function loadAudio(url, tagName) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer'; // 音声データをバイナリとして取得

    request.onload = function() {
        // 取得したデータをデコードする
        context.decodeAudioData(request.response, function(buffer) {
            audioBuffers[tagName] = buffer; // デコード済みデータを保存
            console.log('Audio loaded: ' + tagName);
        }, function(e) {
            console.log('Error decoding audio data');
        });
    };
    request.send();
}

// 使用例：ページロード時に読み込んでおく
loadAudio('sound.mp3', 'mySound');
```

### 現在のHowler.js設定の問題点

- `html5: false`（Web Audio API使用）は正しい
- `pool: 5`設定が影響している可能性
- AudioContextのresume()が正しく機能していない可能性

### 次のステップ

1. **Howler.jsの設定を最適化**
   - `pool: 1`に減らす（iOS向け）
   - `html5: false`を維持（AudioContext使用）

2. **ユーザー操作時の確実なアンロック**
   - 最初のタップでAudioContextを確実にresume
   - 音声ONボタンクリック時に明示的にアンロック

3. **簡易版を作成して動作確認**
   - 純粋なAudioContextのみで実装
   - Howler.jsに依存しないバージョン

---

## YouTube関連動画（調査済み）

YouTube検索ツールで見つけたiOS Safari Web Audio関連動画：

### 最も関連性が高い動画
1. **Solving the iOS 15 Web Audio Playback Issue in Safari After Locking the Screen**
   https://www.youtube.com/watch?v=YmsJbGLgD9U

### HTML5 Audio vs AudioContext シリーズ
2. **HTML5 Audio Delay - AUDIO vs AudioContext on Safari iOS #001**
   https://www.youtube.com/watch?v=ofVNkDzIEB0

3. **HTML5 Audio Delay - AUDIO vs AudioContext on Safari iOS #002**
   https://www.youtube.com/watch?v=yGvPPLdMGwc

4. **HTML5 Audio Delay - AUDIO vs AudioContext on Safari iOS #004**
   https://www.youtube.com/watch?v=7d1h5XMZJK0

5. **HTML5 Audio Delay - AUDIO vs AudioContext on Safari iOS #005**
   https://www.youtube.com/watch?v=inty6QlnbG4

### その他関連動画
6. **Hidden Safari Features You NEED to Turn On! (iOS Secrets)**
   https://www.youtube.com/watch?v=Afjuvg-5RbU

7. **iOS Safari Web Push Notifications Demo**
   https://www.youtube.com/watch?v=aIlGLE_adzc

8. **How To Fix Safari Not Working On iPhone**
   https://www.youtube.com/watch?v=bhftco5JxZk

---
