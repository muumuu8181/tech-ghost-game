// ============== 設定 ==============
const CONFIG = {
    // バージョン（更新するたびに0.01ずつ増やす）
    version: 0.10,
    // 化け物の初期位置（ユーザーの現在地から約10m）
    monsterPosition: {
        lat: 35.7531,
        lng: 139.5864
    },
    // 音が聞こえ始める距離（m）
    maxHearingDistance: 100,
    // 最大音量になる距離（m）
    minHearingDistance: 5,
    // 位置情報更新間隔（ms）
    updateInterval: 1000
};

// ============== 状態管理 ==============
const state = {
    currentPosition: null,
    distance: null,
    bearing: null,
    soundEnabled: false,
    mapMode: 'map' // 'map' or 'radar'
};

// ============== 地図初期化 ==============
let map;
let playerMarker;
let monsterMarker;

function initMap() {
    map = L.map('map').setView([CONFIG.monsterPosition.lat, CONFIG.monsterPosition.lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19
    }).addTo(map);

    // 化け物のマーカー
    const ghostIcon = L.divIcon({
        html: '👻',
        className: 'ghost-marker',
        iconSize: [40, 40]
    });

    monsterMarker = L.marker([CONFIG.monsterPosition.lat, CONFIG.monsterPosition.lng], {
        icon: ghostIcon
    }).addTo(map);

    document.getElementById('monsterPos').textContent =
        `${CONFIG.monsterPosition.lat.toFixed(4)}, ${CONFIG.monsterPosition.lng.toFixed(4)}`;
}

// ============== レーダー描画 ==============
const radarCanvas = document.getElementById('radarCanvas');
const ctx = radarCanvas.getContext('2d');

function initRadar() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    radarCanvas.width = radarCanvas.offsetWidth;
    radarCanvas.height = radarCanvas.offsetHeight;
}

function drawRadar() {
    const width = radarCanvas.width;
    const height = radarCanvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2 - 20;

    // クリア
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // グリッド円（3本）
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 1;

    for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * (i / 3), 0, Math.PI * 2);
        ctx.stroke();
    }

    // 十字線
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // スキャンライン（回転アニメーション）
    const time = Date.now() / 1000;
    const scanAngle = (time % 2) * Math.PI;

    ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, maxRadius, scanAngle - Math.PI / 6, scanAngle);
    ctx.closePath();
    ctx.fill();

    // 化け物の位置を描画
    if (state.distance !== null && state.bearing !== null) {
        const distanceRatio = Math.min(1, state.distance / CONFIG.maxHearingDistance);
        const blobRadius = Math.max(0, maxRadius * (1 - distanceRatio));

        if (blobRadius > 0) {
            // 化け物の点
            const angleRad = (state.bearing - 90) * Math.PI / 180;
            const blobX = centerX + blobRadius * Math.cos(angleRad);
            const blobY = centerY + blobRadius * Math.sin(angleRad);

            // グロー効果
            const gradient = ctx.createRadialGradient(blobX, blobY, 0, blobX, blobY, 20);
            gradient.addColorStop(0, 'rgba(255, 0, 0, 1)');
            gradient.addColorStop(0.5, 'rgba(255, 0, 0, 0.5)');
            gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(blobX, blobY, 20, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    requestAnimationFrame(drawRadar);
}

// ============== 音声制御 ==============
let footstepSound;

function initSound() {
    // Howler.js で足音ファイルを再生
    footstepSound = new Howl({
        src: ['assets/sounds/footsteps.mp3'],
        loop: true,
        volume: 0,
        html5: true,
        preload: true,
        onload: function() {
            console.log('✅ 音声ファイル読み込み成功');
        },
        onloaderror: function(id, error) {
            console.error('❌ 音声ファイル読み込みエラー:', error);
        },
        onplayerror: function(id, error) {
            console.error('❌ 再生エラー:', error);
        }
    });

    footstepSound.playing = false;
    console.log('🔊 音声システム初期化完了');
}

function playFootsteps(volume) {
    console.log(`🎵 playFootsteps called: volume=${volume.toFixed(2)}`);

    if (volume <= 0.01) {
        if (footstepSound.playing) {
            footstepSound.stop();
            footstepSound.playing = false;
            console.log('⏸️ 音声停止（音量0）');
        }
        return;
    }

    if (!footstepSound.playing) {
        footstepSound.play();
        footstepSound.playing = true;
        console.log('▶️ 音声再生開始');
    }

    // 音量を更新（0-1の範囲）
    footstepSound.volume(volume);
    console.log(`🔊 音量設定: ${(volume * 100).toFixed(0)}%`);
}

function stopFootsteps() {
    if (footstepSound && footstepSound.playing) {
        footstepSound.stop();
        footstepSound.playing = false;
    }
}

// ============== 位置情報 ==============
function initGeolocation() {
    if (!navigator.geolocation) {
        document.getElementById('status').textContent = '⚠️ GPS非対応端末です';
        return;
    }

    document.getElementById('status').textContent = '📍 位置情報を取得中...';

    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            state.currentPosition = { lat: latitude, lng: longitude };

            // 位置を表示
            document.getElementById('playerPos').textContent =
                `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

            // 地図にプレイヤーマーカーを追加
            if (!playerMarker) {
                const playerIcon = L.divIcon({
                    html: '📍',
                    className: 'player-marker',
                    iconSize: [30, 30]
                });
                playerMarker = L.marker([latitude, longitude], { icon: playerIcon }).addTo(map);
            } else {
                playerMarker.setLatLng([latitude, longitude]);
            }

            // 距離と方角を計算
            updateDistanceAndBearing();

            document.getElementById('status').textContent = '✅ 追踪中...';
        },
        (error) => {
            document.getElementById('status').textContent = `⚠️ ${error.message}`;
            console.error('Geolocation error:', error);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000
        }
    );
}

// ============== 距離・方角計算 ==============
function updateDistanceAndBearing() {
    if (!state.currentPosition) return;

    const distance = calculateDistance(
        state.currentPosition.lat,
        state.currentPosition.lng,
        CONFIG.monsterPosition.lat,
        CONFIG.monsterPosition.lng
    );

    const bearing = calculateBearing(
        state.currentPosition.lat,
        state.currentPosition.lng,
        CONFIG.monsterPosition.lat,
        CONFIG.monsterPosition.lng
    );

    state.distance = distance;
    state.bearing = bearing;

    // 表示更新
    document.getElementById('distance').textContent = `${Math.round(distance)} m`;
    document.getElementById('distanceInfo').textContent = `距離: ${Math.round(distance)} m`;
    document.getElementById('directionInfo').textContent = `方角: ${getCardinalDirection(bearing)} (${Math.round(bearing)}°)`;

    // 音量更新
    if (state.soundEnabled) {
        const volume = calculateVolume(distance);
        playFootsteps(volume);
    }

    // 恐怖度表示
    const distanceEl = document.getElementById('distance');
    if (distance < 10) {
        distanceEl.classList.add('danger');
    } else {
        distanceEl.classList.remove('danger');
    }
}

// ユークリッド距離計算
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // 地球の半径（メートル）
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

// 方角計算
function calculateBearing(lat1, lon1, lat2, lon2) {
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) -
              Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

    const θ = Math.atan2(y, x);
    const bearing = (θ * 180 / Math.PI + 360) % 360;

    return bearing;
}

// 音量計算（距離に応じて指数関数的に変化）
function calculateVolume(distance) {
    if (distance >= CONFIG.maxHearingDistance) return 0;

    const ratio = (distance - CONFIG.minHearingDistance) /
                  (CONFIG.maxHearingDistance - CONFIG.minHearingDistance);
    return Math.max(0, Math.min(1, 1 - ratio));
}

// 方角を方位に変換
function getCardinalDirection(bearing) {
    const directions = ['北', '北東', '東', '南東', '南', '南西', '西', '北西'];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
}

// ============== UI制御 ==============
function initUI() {
    // バージョン表示
    document.getElementById('versionNumber').textContent = CONFIG.version.toFixed(2);

    // モード切り替え
    const mapBtn = document.getElementById('mapModeBtn');
    const radarBtn = document.getElementById('radarModeBtn');
    const mapView = document.getElementById('mapContainer');
    const radarView = document.getElementById('radarContainer');

    mapBtn.addEventListener('click', () => {
        mapBtn.classList.add('active');
        radarBtn.classList.remove('active');
        mapView.classList.add('active');
        radarView.classList.remove('active');
        setTimeout(() => map.invalidateSize(), 100);
    });

    radarBtn.addEventListener('click', () => {
        radarBtn.classList.add('active');
        mapBtn.classList.remove('active');
        radarView.classList.add('active');
        mapView.classList.remove('active');
    });

    // 音声トグル
    const soundToggle = document.getElementById('soundToggle');
    soundToggle.addEventListener('click', () => {
        state.soundEnabled = !state.soundEnabled;

        if (state.soundEnabled) {
            soundToggle.textContent = '🔇 音声OFF';
            soundToggle.classList.add('active');

            // 音声コンテキストを開始（ユーザー操作が必要）
            if (!footstepSound) initSound();

            if (state.distance !== null) {
                const volume = calculateVolume(state.distance);
                playFootsteps(volume);
            }
        } else {
            soundToggle.textContent = '🔊 音声ON';
            soundToggle.classList.remove('active');
            stopFootsteps();
        }
    });

    // デバッグパネル
    const debugToggle = document.getElementById('debugToggle');
    const debugPanel = document.getElementById('debugPanel');
    const closeDebug = document.getElementById('closeDebug');
    const debugLog = document.getElementById('debugLog');

    // console.logをキャプチャしてデバッグパネルに表示
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    function addDebugLog(message, type = 'log') {
        const div = document.createElement('div');
        div.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        div.style.color = type === 'error' ? '#f00' : type === 'warn' ? '#ff0' : '#0f0';
        debugLog.appendChild(div);
        debugLog.scrollTop = debugLog.scrollHeight;
    }

    console.log = function(...args) {
        originalLog.apply(console, args);
        addDebugLog(args.join(' '), 'log');
    };

    console.error = function(...args) {
        originalError.apply(console, args);
        addDebugLog(args.join(' '), 'error');
    };

    console.warn = function(...args) {
        originalWarn.apply(console, args);
        addDebugLog(args.join(' '), 'warn');
    };

    debugToggle.addEventListener('click', () => {
        debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
    });

    closeDebug.addEventListener('click', () => {
        debugPanel.style.display = 'none';
    });

    // 音声テストボタン
    const testSoundMax = document.getElementById('testSoundMax');
    const testSound50 = document.getElementById('testSound50');

    testSoundMax.addEventListener('click', () => {
        console.log('🔊 音量MAXでテスト再生');
        if (!footstepSound) initSound();

        // 一度停止してから再生
        if (footstepSound.playing()) {
            footstepSound.stop();
        }

        setTimeout(() => {
            footstepSound.volume(1.0);
            footstepSound.play();
            footstepSound.playing = true;
            console.log('▶️ 再生開始');
        }, 100);

        setTimeout(() => {
            console.log('⏸️ テスト終了');
            footstepSound.stop();
            footstepSound.playing = false;
        }, 3000);
    });

    testSound50.addEventListener('click', () => {
        console.log('🔉 音量50%でテスト再生');
        if (!footstepSound) initSound();

        // 一度停止してから再生
        if (footstepSound.playing()) {
            footstepSound.stop();
        }

        setTimeout(() => {
            footstepSound.volume(0.5);
            footstepSound.play();
            footstepSound.playing = true;
            console.log('▶️ 再生開始');
        }, 100);

        setTimeout(() => {
            console.log('⏸️ テスト終了');
            footstepSound.stop();
            footstepSound.playing = false;
        }, 3000);
    });
}

// ============== 初期化 ==============
function init() {
    initMap();
    initRadar();
    initSound();
    initUI();
    initGeolocation();
    drawRadar();
}

// 起動
window.addEventListener('DOMContentLoaded', init);
