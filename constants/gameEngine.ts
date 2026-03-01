import { PhysicsEngine } from '@/constants/physics/PhysicsEngine';
import { CollisionDetectionSystem } from '@/constants/physics/CollisionDetectionSystem';

// NOTE: Integrating PhysicsEngine directly into the WebView's requestAnimationFrame
// loop requires building a postMessage bridge to sync coordinates at 60fps.
// The engine is initialized here for future bridge implementation.
export const _physics = new PhysicsEngine({ gravity: 9.81 });
export const _collisions = new CollisionDetectionSystem();

export function createGameHTML(assetUrls: Record<string, string>): string {
  return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; background: #030306; touch-action: none; -webkit-touch-callout: none; -webkit-user-select: none; user-select: none; }
canvas { display: block; }
#touch-controls {
  position: fixed; bottom: 0; left: 0; right: 0; height: 48%; pointer-events: auto; z-index: 10;
}
.dpad {
  position: absolute; bottom: 24px; left: 16px; width: 140px; height: 140px;
}
.dpad-btn {
  position: absolute; width: 56px; height: 56px; border-radius: 12px;
  background: rgba(20,12,8,0.6); border: 1.5px solid rgba(120,60,40,0.2);
  display: flex; align-items: center; justify-content: center;
  color: rgba(180,120,80,0.35); font-size: 18px;
  touch-action: manipulation; transition: background 0.05s;
  -webkit-tap-highlight-color: transparent;
  box-shadow: inset 0 0 12px rgba(0,0,0,0.4);
}
.dpad-btn.active { background: rgba(120,50,30,0.35); border-color: rgba(180,80,50,0.45); color: rgba(220,150,100,0.6); }
.dpad-left { left: 0; top: 43px; }
.dpad-right { right: 0; top: 43px; }
.dpad-up { left: 43px; top: 0; }
.action-buttons {
  position: absolute; bottom: 24px; right: 16px; width: 178px; height: 178px;
}
.action-btn {
  position: absolute; width: 58px; height: 58px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 8px; font-weight: 700; letter-spacing: 0.5px;
  touch-action: manipulation; transition: transform 0.05s, background 0.05s;
  text-transform: uppercase; -webkit-tap-highlight-color: transparent;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.3);
}
.action-btn.active { transform: scale(0.88); }
.btn-gaia {
  background: rgba(40,90,45,0.2); border: 2px solid rgba(60,140,65,0.35);
  color: rgba(80,180,90,0.7); right: 0; top: 58px;
}
.btn-gaia.active { background: rgba(60,140,65,0.4); }
.btn-corrupt {
  background: rgba(70,25,90,0.2); border: 2px solid rgba(110,45,160,0.35);
  color: rgba(140,70,200,0.7); left: 0; top: 58px;
}
.btn-corrupt.active { background: rgba(110,45,160,0.4); }
.btn-parry {
  background: rgba(40,80,120,0.2); border: 2px solid rgba(70,130,190,0.35);
  color: rgba(90,160,220,0.7); left: 58px; top: 0;
}
.btn-parry.active { background: rgba(70,130,190,0.4); }
.btn-dash {
  background: rgba(120,80,20,0.2); border: 2px solid rgba(180,130,50,0.35);
  color: rgba(200,160,70,0.7); left: 58px; bottom: 2px;
}
.btn-dash.active { background: rgba(180,130,50,0.4); }
#hud {
  position: fixed; top: 0; left: 0; right: 0; padding: 10px 14px;
  z-index: 20; pointer-events: none;
  background: linear-gradient(180deg, rgba(3,3,6,0.7) 0%, rgba(3,3,6,0) 100%);
}
.bar-row { display: flex; align-items: center; margin-bottom: 5px; }
.bar-icon { width: 16px; height: 16px; margin-right: 8px; border-radius: 2px; border: 1px solid rgba(255,255,255,0.06); }
.bar-container {
  width: 130px; height: 8px; background: rgba(10,5,5,0.9);
  border: 1px solid rgba(80,40,30,0.25); border-radius: 1px;
  overflow: hidden; position: relative;
}
.bar-fill { height: 100%; transition: width 0.12s ease; position: relative; }
.health-fill { background: linear-gradient(90deg, #4a0a12, #8b1a2a, #b02040); }
.stamina-fill { background: linear-gradient(90deg, #0a3a1a, #1a6a3a, #2a8a4a); }
.bar-label {
  color: rgba(180,140,120,0.35); font-size: 8px; font-family: Georgia, serif;
  letter-spacing: 2px; margin-left: 8px; text-transform: uppercase;
}
#death-screen {
  display: none; position: fixed; inset: 0; background: rgba(3,2,2,0.96);
  z-index: 100; flex-direction: column; align-items: center; justify-content: center;
}
#death-screen.visible { display: flex; }
#death-screen h1 {
  color: #6b0a18; font-size: 42px; font-family: Georgia, serif; letter-spacing: 16px;
  text-transform: uppercase; margin-bottom: 8px;
  text-shadow: 0 0 60px rgba(107,10,24,0.5), 0 0 120px rgba(107,10,24,0.2);
}
#death-screen p {
  color: rgba(140,100,80,0.25); font-size: 11px; font-family: Georgia, serif;
  letter-spacing: 4px; font-style: italic;
}
#respawn-btn {
  margin-top: 40px; padding: 14px 48px; background: rgba(60,10,15,0.15);
  border: 1px solid rgba(107,10,24,0.3); color: #6b0a18; font-size: 11px;
  font-family: Georgia, serif; letter-spacing: 5px; cursor: pointer;
  text-transform: uppercase; border-radius: 1px;
  transition: all 0.3s;
}
#respawn-btn:hover { border-color: rgba(107,10,24,0.6); background: rgba(60,10,15,0.25); }
#title-screen {
  display: flex; position: fixed; inset: 0; background: #030306;
  z-index: 200; flex-direction: column; align-items: center; justify-content: center;
  overflow: hidden;
}
#title-screen.hidden { display: none; }
#title-bg {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
  opacity: 0.25; filter: blur(1px) saturate(0.5) brightness(0.7);
}
#title-overlay {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at center, rgba(3,3,6,0.3) 0%, rgba(3,3,6,0.85) 70%, rgba(3,3,6,0.98) 100%);
}
#title-screen h1 {
  color: #6b0a18; font-size: 26px; font-family: Georgia, serif; letter-spacing: 10px;
  text-transform: uppercase; margin-bottom: 2px;
  text-shadow: 0 0 80px rgba(107,10,24,0.35), 0 2px 4px rgba(0,0,0,0.8);
  position: relative; z-index: 1;
}
#title-screen h2 {
  color: rgba(140,100,80,0.2); font-size: 9px; font-family: Georgia, serif;
  letter-spacing: 6px; margin-bottom: 36px; position: relative; z-index: 1;
  font-style: italic;
}
#title-line {
  width: 60px; height: 1px; background: linear-gradient(90deg, transparent, rgba(107,10,24,0.3), transparent);
  margin-bottom: 20px; position: relative; z-index: 1;
}
#load-wrap { text-align: center; margin-bottom: 24px; position: relative; z-index: 1; }
#load-track { width: 140px; height: 2px; background: rgba(40,20,15,0.3); border-radius: 1px; margin: 0 auto 12px; overflow: hidden; }
#load-fill { height: 100%; width: 0%; background: linear-gradient(90deg, #3a0a12, #6b0a18); transition: width 0.25s; border-radius: 1px; }
#load-label { color: rgba(140,100,80,0.18); font-size: 7px; font-family: Georgia, serif; letter-spacing: 4px; text-transform: uppercase; }
#start-btn {
  padding: 16px 52px; background: rgba(40,10,12,0.1);
  border: 1px solid rgba(107,10,24,0.2); color: #6b0a18; font-size: 11px;
  font-family: Georgia, serif; letter-spacing: 6px; cursor: pointer;
  text-transform: uppercase; animation: pulse 4s ease-in-out infinite; border-radius: 1px;
  position: relative; z-index: 1; transition: all 0.3s;
}
#start-btn:hover { border-color: rgba(107,10,24,0.5); background: rgba(40,10,12,0.2); }
#start-btn.btn-hidden { display: none; }
@keyframes pulse {
  0%, 100% { border-color: rgba(107,10,24,0.12); box-shadow: 0 0 0 rgba(107,10,24,0); }
  50% { border-color: rgba(107,10,24,0.4); box-shadow: 0 0 40px rgba(107,10,24,0.08); }
}
#combo-display {
  position: fixed; top: 54px; right: 14px; z-index: 20; pointer-events: none;
  color: #c8a050; font-size: 14px; font-family: Georgia, serif; font-weight: bold;
  opacity: 0; transition: opacity 0.15s; text-shadow: 0 0 12px rgba(200,160,80,0.4);
  letter-spacing: 3px;
}
#combo-display.visible { opacity: 1; }
</style>
</head>
<body>

<div id="title-screen">
  <img id="title-bg" src="${assetUrls.bg || ''}" alt="" />
  <div id="title-overlay"></div>
  <h1>Crown of Darkness</h1>
  <div id="title-line"></div>
  <h2>The Architect Awakens</h2>
  <div id="load-wrap">
    <div id="load-track"><div id="load-fill"></div></div>
    <span id="load-label">Loading Realm...</span>
  </div>
  <button id="start-btn" class="btn-hidden">Awaken</button>
</div>

<div id="hud">
  <div class="bar-row">
    <div class="bar-icon" style="background:linear-gradient(135deg,#4a0a12,#8b1a2a);"></div>
    <div class="bar-container"><div class="bar-fill health-fill" id="health-bar" style="width:100%"></div></div>
    <span class="bar-label" id="health-text">100</span>
  </div>
  <div class="bar-row">
    <div class="bar-icon" style="background:linear-gradient(135deg,#0a3a1a,#2a8a4a);"></div>
    <div class="bar-container"><div class="bar-fill stamina-fill" id="stamina-bar" style="width:100%"></div></div>
    <span class="bar-label" id="stamina-text">100</span>
  </div>
</div>

<div id="combo-display"></div>

<div id="touch-controls">
  <div class="dpad">
    <div class="dpad-btn dpad-left" id="btn-left">&#9664;</div>
    <div class="dpad-btn dpad-right" id="btn-right">&#9654;</div>
    <div class="dpad-btn dpad-up" id="btn-jump-dpad">&#9650;</div>
  </div>
  <div class="action-buttons">
    <div class="action-btn btn-gaia" id="btn-gaia">Gaia</div>
    <div class="action-btn btn-corrupt" id="btn-corrupt">Void</div>
    <div class="action-btn btn-parry" id="btn-parry">Ice</div>
    <div class="action-btn btn-dash" id="btn-dash">Dash</div>
  </div>
</div>

<div id="death-screen">
  <h1>FALLEN</h1>
  <p>The Architect's light fades...</p>
  <button id="respawn-btn">RISE AGAIN</button>
</div>

<script>
var _rw = window.innerWidth || screen.width || 800;
var _rh = window.innerHeight || screen.height || 450;
let W = Math.max(_rw, _rh);
let H = Math.min(_rw, _rh);
const canvas = document.createElement('canvas');
canvas.width = W;
canvas.height = H;
canvas.style.width = W + 'px';
canvas.style.height = H + 'px';
document.body.insertBefore(canvas, document.body.firstChild);
const ctx = canvas.getContext('2d');

var IMG = { idle: [], idle2: [], jump: [], run: [] };
var assetsLoaded = 0;
var assetsTotal = 0;
var assetsCriticalLoaded = 0;
var assetsCriticalTotal = 0;
var ASSET_URLS = JSON.parse('${JSON.stringify(assetUrls).replace(/'/g, "\\'")}');

function loadImg(key, url, critical) {
  if (!url) return;
  assetsTotal++;
  if (critical) assetsCriticalTotal++;
  var img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = function() {
    assetsLoaded++;
    if (critical) assetsCriticalLoaded++;
    if (!IMG[key] && !key.includes('_')) console.warn('Loaded unknown asset keys: ' + key);
    // console.log('[loadImg] Successfully loaded: ' + key);
    updateLoadBar();
  };
  img.onerror = function() {
    console.warn('[loadImg] Failed to load asset: ' + key + ' | URL: ' + url.substring(0, 50) + '...');
    assetsLoaded++;
    if (critical) assetsCriticalLoaded++;
    updateLoadBar();
  };
  img.src = url;
  if (key.includes('_')) {
    var parts = key.split('_');
    var group = parts[0];
    var idx = parseInt(parts[1], 10);
    if (IMG[group]) IMG[group][idx] = img;
  } else {
    IMG[key] = img;
  }
}

function updateLoadBar() {
  var pct = assetsTotal > 0 ? Math.round((assetsLoaded / assetsTotal) * 100) : 0;
  var fillEl = document.getElementById('load-fill');
  var labelEl = document.getElementById('load-label');
  if (fillEl) fillEl.style.width = pct + '%';
  if (labelEl) labelEl.textContent = pct < 100 ? 'Loading Realm... ' + pct + '%' : 'Realm Ready';
  if (assetsCriticalLoaded >= assetsCriticalTotal) {
    var btn = document.getElementById('start-btn');
    if (btn) btn.classList.remove('btn-hidden');
    var wrap = document.getElementById('load-wrap');
    if (wrap) wrap.style.opacity = '0.3';
  }
}

loadImg('bg', ASSET_URLS.bg, true);
loadImg('player', ASSET_URLS.player, true);
loadImg('enemySmall', ASSET_URLS.enemySmall, true);
loadImg('enemyBig', ASSET_URLS.enemyBig, true);
loadImg('platforms', ASSET_URLS.platforms, true);
loadImg('stonearch', ASSET_URLS.stonearch, false);
loadImg('props', ASSET_URLS.props, false);
loadImg('tree1', ASSET_URLS.tree1, false);
loadImg('tree2', ASSET_URLS.tree2, false);
loadImg('tombstones', ASSET_URLS.tombstones, false);
loadImg('skulls', ASSET_URLS.skulls, false);
loadImg('bones', ASSET_URLS.bones, false);
loadImg('darkprops', ASSET_URLS.darkprops, false);
loadImg('carriage', ASSET_URLS.carriage, false);

for (var i = 0; i < 25; i++) loadImg('idle_' + i, ASSET_URLS['idle_' + i], true);
for (var i = 0; i < 16; i++) loadImg('idle2_' + i, ASSET_URLS['idle2_' + i], true);
for (var i = 0; i < 16; i++) loadImg('jump_' + i, ASSET_URLS['jump_' + i], true);
for (var i = 0; i < 20; i++) loadImg('run_' + i, ASSET_URLS['run_' + i], true);

function imgReady(key) {
  if (key === 'idle' || key === 'idle2' || key === 'jump' || key === 'run') {
      var arr = IMG[key];
      if (!arr || arr.length === 0) return false;
      var f = arr[0];
      return f && f.complete && f.naturalWidth > 0;
  }
  var i = IMG[key];
  return i && i.complete && i.naturalWidth > 0;
}

const GRAVITY = 0.44;
const GROUND_FRICTION = 0.78;
const AIR_FRICTION = 0.92;
const MAX_FALL = 12;
let GROUND_Y = H - 60;

const STATES = {
  IDLE: 'IDLE', RUN: 'RUN', JUMP: 'JUMP', FALL: 'FALL',
  DASH: 'DASH', ATTACK_GAIA: 'ATTACK_GAIA', ATTACK_CORRUPT: 'ATTACK_CORRUPT',
  PARRY: 'PARRY', HIT: 'HIT', DEAD: 'DEAD',
};

let gameStarted = false;
let cameraX = 0;
let shakeAmount = 0;
let shakeTimer = 0;
let hitStop = 0;
let comboCount = 0;
let comboTimer = 0;
let frameCount = 0;

const keys = { left: false, right: false, up: false, dash: false, gaia: false, corrupt: false, parry: false };
const inputBuffer = { up: 0, dash: 0, gaia: 0, corrupt: 0, parry: 0 };
const BUFFER_FRAMES = 6;

const platforms = [
  { x: -200, y: GROUND_Y, w: W * 10, h: 100, type: 'ground' },
  { x: 300, y: GROUND_Y - 100, w: 170, h: 16, type: 'float' },
  { x: 560, y: GROUND_Y - 165, w: 140, h: 16, type: 'float' },
  { x: 820, y: GROUND_Y - 120, w: 200, h: 16, type: 'float' },
  { x: 1140, y: GROUND_Y - 190, w: 160, h: 16, type: 'float' },
  { x: 1400, y: GROUND_Y - 110, w: 210, h: 16, type: 'float' },
  { x: 1700, y: GROUND_Y - 170, w: 180, h: 16, type: 'float' },
  { x: 2000, y: GROUND_Y - 240, w: 150, h: 16, type: 'float' },
  { x: 2250, y: GROUND_Y - 130, w: 200, h: 16, type: 'float' },
  { x: 2550, y: GROUND_Y - 200, w: 160, h: 16, type: 'float' },
  { x: 2800, y: GROUND_Y - 110, w: 190, h: 16, type: 'float' },
  { x: 3100, y: GROUND_Y - 180, w: 170, h: 16, type: 'float' },
];

var PLAT_CROPS = [
  [0.0, 0.22, 0.35, 0.18],
  [0.36, 0.22, 0.30, 0.18],
  [0.67, 0.22, 0.33, 0.18],
  [0.0, 0.44, 0.28, 0.18],
  [0.30, 0.44, 0.22, 0.15],
  [0.55, 0.44, 0.30, 0.18],
];

var GROUND_PLAT_CROP = [0.0, 0.0, 1.0, 0.14];

var bgTrees = [
  { x: -60, imgKey: 'tree1', scale: 0.28, depth: 0.12, alpha: 0.55 },
  { x: 500, imgKey: 'tree2', scale: 0.34, depth: 0.1, alpha: 0.5 },
  { x: 1100, imgKey: 'tree1', scale: 0.25, depth: 0.15, alpha: 0.45 },
  { x: 1800, imgKey: 'tree2', scale: 0.32, depth: 0.08, alpha: 0.55 },
  { x: 2400, imgKey: 'tree1', scale: 0.27, depth: 0.13, alpha: 0.45 },
  { x: 3000, imgKey: 'tree2', scale: 0.3, depth: 0.11, alpha: 0.5 },
  { x: 3600, imgKey: 'tree1', scale: 0.26, depth: 0.14, alpha: 0.4 },
];

var bgArchElements = [
  { x: 350, imgKey: 'darkprops', cropX: 0, cropY: 0, cropW: 0.35, cropH: 0.65, scale: 0.2, depth: 0.07, alpha: 0.28 },
  { x: 1700, imgKey: 'darkprops', cropX: 0, cropY: 0, cropW: 0.35, cropH: 0.65, scale: 0.15, depth: 0.06, alpha: 0.22 },
  { x: 2700, imgKey: 'darkprops', cropX: 0, cropY: 0, cropW: 0.35, cropH: 0.65, scale: 0.17, depth: 0.09, alpha: 0.2 },
];

var groundDecorations = [
  { x: 180, imgKey: 'darkprops', cropX: 0.42, cropY: 0.0, cropW: 0.14, cropH: 0.35, scale: 0.12, yOff: 8 },
  { x: 450, imgKey: 'darkprops', cropX: 0.0, cropY: 0.7, cropW: 0.28, cropH: 0.3, scale: 0.08, yOff: 4 },
  { x: 750, imgKey: 'darkprops', cropX: 0.72, cropY: 0.35, cropW: 0.28, cropH: 0.32, scale: 0.1, yOff: 6 },
  { x: 1050, imgKey: 'darkprops', cropX: 0.55, cropY: 0.0, cropW: 0.12, cropH: 0.35, scale: 0.1, yOff: 5 },
  { x: 1250, imgKey: 'darkprops', cropX: 0.42, cropY: 0.38, cropW: 0.25, cropH: 0.25, scale: 0.18, yOff: 12 },
  { x: 1550, imgKey: 'darkprops', cropX: 0.67, cropY: 0.0, cropW: 0.1, cropH: 0.35, scale: 0.1, yOff: 6 },
  { x: 1850, imgKey: 'darkprops', cropX: 0.0, cropY: 0.7, cropW: 0.28, cropH: 0.3, scale: 0.07, yOff: 3 },
  { x: 2050, imgKey: 'darkprops', cropX: 0.72, cropY: 0.7, cropW: 0.28, cropH: 0.3, scale: 0.1, yOff: 8 },
  { x: 2350, imgKey: 'darkprops', cropX: 0.35, cropY: 0.7, cropW: 0.3, cropH: 0.3, scale: 0.09, yOff: 5 },
  { x: 2550, imgKey: 'darkprops', cropX: 0.42, cropY: 0.0, cropW: 0.14, cropH: 0.35, scale: 0.09, yOff: 7 },
  { x: 2800, imgKey: 'darkprops', cropX: 0.42, cropY: 0.38, cropW: 0.25, cropH: 0.25, scale: 0.14, yOff: 10 },
  { x: 3100, imgKey: 'darkprops', cropX: 0.0, cropY: 0.7, cropW: 0.28, cropH: 0.3, scale: 0.07, yOff: 4 },
  { x: 3300, imgKey: 'darkprops', cropX: 0.72, cropY: 0.35, cropW: 0.28, cropH: 0.32, scale: 0.08, yOff: 3 },
];

var dustMotes = [];
for (var i = 0; i < 60; i++) {
  dustMotes.push({
    x: Math.random() * W * 6,
    y: Math.random() * H * 0.85,
    r: 0.3 + Math.random() * 1.5,
    speed: 0.02 + Math.random() * 0.15,
    alpha: 0.01 + Math.random() * 0.04,
    phase: Math.random() * Math.PI * 2,
    drift: Math.random() * 0.2 - 0.1,
    color: Math.random() > 0.7 ? 'ash' : 'dust',
  });
}

var embers = [];
for (var i = 0; i < 25; i++) {
  embers.push({
    x: Math.random() * W * 6,
    y: GROUND_Y + Math.random() * 20,
    vx: Math.random() * 0.2 - 0.1,
    vy: -0.2 - Math.random() * 0.6,
    life: Math.random(),
    size: 0.5 + Math.random() * 1.5,
    phase: Math.random() * Math.PI * 2,
    color: Math.random() > 0.5 ? 'ember' : 'soul',
  });
}

var bloodPools = [];
for (var i = 0; i < 10; i++) {
  bloodPools.push({
    x: 150 + i * (W * 0.9) + Math.random() * 500,
    y: GROUND_Y - 1,
    w: 20 + Math.random() * 60,
    h: 2 + Math.random() * 3,
  });
}

var chains = [];
for (var i = 0; i < 6; i++) {
  chains.push({
    x: 400 + i * 600 + Math.random() * 300,
    len: 40 + Math.random() * 80,
    swing: Math.random() * Math.PI * 2,
    speed: 0.01 + Math.random() * 0.015,
  });
}

var lightShafts = [];
for (var i = 0; i < 4; i++) {
  lightShafts.push({
    x: 500 + i * 900 + Math.random() * 400,
    w: 30 + Math.random() * 50,
    alpha: 0.015 + Math.random() * 0.02,
    phase: Math.random() * Math.PI * 2,
  });
}

const particles = [];
const slashTrails = [];

function spawnParticles(x, y, color, count, speed, opts) {
  var gravity = (opts && opts.gravity !== undefined) ? opts.gravity : 0.06;
  var sizeBase = (opts && opts.size) || 2;
  for (var i = 0; i < count; i++) {
    var angle = Math.random() * Math.PI * 2;
    var spd = speed * (0.3 + Math.random() * 0.9);
    particles.push({
      x: x, y: y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd - 1.5,
      life: 1,
      decay: 0.012 + Math.random() * 0.022,
      color: color,
      size: sizeBase + Math.random() * (sizeBase * 1.5),
      gravity: gravity,
    });
  }
}

function spawnSlashTrail(x, y, w, h, color, duration) {
  slashTrails.push({ x: x, y: y, w: w, h: h, color: color, life: 1, decay: 1 / (duration || 12) });
}

function screenShake(amount, duration) {
  shakeAmount = Math.max(shakeAmount, amount);
  shakeTimer = Math.max(shakeTimer, duration);
}

const player = {
  x: 100, y: GROUND_Y - 60, w: 24, h: 52,
  vx: 0, vy: 0,
  speed: 2.6, jumpForce: -9.2,
  facing: 1, grounded: false,
  state: STATES.IDLE,
  stateTimer: 0,
  health: 100, maxHealth: 100,
  stamina: 100, maxStamina: 100,
  staminaRegen: 0.28,
  invincible: false, invTimer: 0,
  dashSpeed: 11, dashDuration: 12, dashCost: 25,
  attackTimer: 0, attackPhase: 'none',
  hitbox: null,
  parryActive: false, parryWindow: 14,
  canDashInAir: true,
  coyoteTime: 0, jumpBuffer: 0,
  trailPositions: [],
  animCycle: 0,
  legAnim: 0,
  armSwing: 0,
  breathe: 0,
  capeWave: 0,
  landSquash: 0,
};

const enemies = [
  createEnemy(580, GROUND_Y - 60, 'penitent'),
  createEnemy(1100, GROUND_Y - 60, 'penitent'),
  createEnemy(1500, GROUND_Y - 60, 'flagellant'),
  createEnemy(2100, GROUND_Y - 60, 'penitent'),
  createEnemy(2650, GROUND_Y - 60, 'flagellant'),
  createEnemy(3150, GROUND_Y - 60, 'penitent'),
];

function createEnemy(x, y, type) {
  var isBig = type === 'flagellant';
  return {
    x: x, y: y, w: isBig ? 36 : 28, h: isBig ? 56 : 48,
    vx: 0, vy: 0,
    health: isBig ? 95 : 55, maxHealth: isBig ? 95 : 55,
    speed: isBig ? 0.85 : 1.2, facing: -1,
    state: 'PATROL', stateTimer: 0,
    patrolDir: 1, patrolDist: 0, patrolMax: 90 + Math.random() * 70,
    aggroRange: isBig ? 150 : 180, attackRange: isBig ? 60 : 48,
    attackTimer: 0, attackCooldown: 0,
    hitTimer: 0, hitFlash: 0,
    alive: true, deathTimer: 0,
    spawnX: x, spawnY: y,
    telegraphTimer: 0,
    type: type,
    animCycle: Math.random() * 100,
    breathe: Math.random() * Math.PI * 2,
    dmg: isBig ? 30 : 18,
    telegraphDur: isBig ? 42 : 28,
  };
}

function setupTouchControls() {
  function addControl(id, key) {
    var el = document.getElementById(id);
    if (!el) return;
    function press(e) {
      if (e) e.preventDefault();
      keys[key] = true;
      if (key !== 'left' && key !== 'right') inputBuffer[key] = BUFFER_FRAMES;
      el.classList.add('active');
    }
    function release(e) {
      if (e) e.preventDefault();
      keys[key] = false;
      el.classList.remove('active');
    }
    el.addEventListener('touchstart', press, { passive: false });
    el.addEventListener('touchend', release, { passive: false });
    el.addEventListener('touchcancel', release, { passive: false });
    el.addEventListener('mousedown', press);
    el.addEventListener('mouseup', release);
    el.addEventListener('mouseleave', release);
  }
  addControl('btn-left', 'left');
  addControl('btn-right', 'right');
  addControl('btn-jump-dpad', 'up');
  addControl('btn-gaia', 'gaia');
  addControl('btn-corrupt', 'corrupt');
  addControl('btn-parry', 'parry');
  addControl('btn-dash', 'dash');
}

document.addEventListener('keydown', function(e) {
  if (e.repeat) return;
  if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
  if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
  if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') { keys.up = true; inputBuffer.up = BUFFER_FRAMES; }
  if (e.key === 'Shift') { keys.dash = true; inputBuffer.dash = BUFFER_FRAMES; }
  if (e.key === 'z') { keys.gaia = true; inputBuffer.gaia = BUFFER_FRAMES; }
  if (e.key === 'x') { keys.corrupt = true; inputBuffer.corrupt = BUFFER_FRAMES; }
  if (e.key === 'c') { keys.parry = true; inputBuffer.parry = BUFFER_FRAMES; }
});
document.addEventListener('keyup', function(e) {
  if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
  if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
  if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') keys.up = false;
  if (e.key === 'Shift') keys.dash = false;
  if (e.key === 'z') keys.gaia = false;
  if (e.key === 'x') keys.corrupt = false;
  if (e.key === 'c') keys.parry = false;
});

function consumeBuffer(key) {
  if (inputBuffer[key] > 0) { inputBuffer[key] = 0; return true; }
  return false;
}

function tickBuffers() {
  for (var k in inputBuffer) {
    if (inputBuffer[k] > 0) inputBuffer[k]--;
  }
}

function changeState(newState) {
  if (player.state === newState) return;
  player.state = newState;
  player.stateTimer = 0;
  player.attackPhase = 'none';
  player.hitbox = null;
  player.parryActive = false;
}

function canAct() {
  return player.state !== STATES.DASH && player.state !== STATES.ATTACK_GAIA &&
         player.state !== STATES.ATTACK_CORRUPT && player.state !== STATES.PARRY &&
         player.state !== STATES.HIT && player.state !== STATES.DEAD;
}

function tryJump() {
  if (player.grounded || player.coyoteTime > 0) {
    player.vy = player.jumpForce;
    player.grounded = false;
    player.coyoteTime = 0;
    player.jumpBuffer = 0;
    changeState(STATES.JUMP);
    spawnParticles(player.x + player.w / 2, player.y + player.h, 'rgba(80,60,50,0.4)', 6, 2, { gravity: 0.02, size: 1.5 });
    return true;
  }
  return false;
}

function startDash() {
  changeState(STATES.DASH);
  player.stamina -= player.dashCost;
  player.invincible = true;
  player.invTimer = player.dashDuration + 4;
  if (!player.grounded) player.canDashInAir = false;
  spawnParticles(player.x + player.w / 2, player.y + player.h / 2, '#c8a050', 12, 4, { gravity: 0, size: 2.5 });
}

function startAttackGaia() {
  changeState(STATES.ATTACK_GAIA);
  player.stamina -= 15;
  player.vx = player.facing * 2.8;
  player.armSwing = 0;
}

function startAttackCorrupt() {
  changeState(STATES.ATTACK_CORRUPT);
  player.stamina -= 35;
  player.vx = player.facing * 2;
  player.armSwing = 0;
}

function startParry() {
  changeState(STATES.PARRY);
  player.stamina -= 10;
  player.vx = 0;
  spawnParticles(player.x + player.w / 2, player.y + player.h * 0.3, '#5a9ac0', 5, 1.5, { gravity: -0.02, size: 1.5 });
}

function handleActions() {
  if (consumeBuffer('dash') && player.stamina >= player.dashCost) {
    if (player.grounded || player.canDashInAir) { startDash(); return; }
  }
  if (consumeBuffer('gaia') && player.stamina >= 15) { startAttackGaia(); return; }
  if (consumeBuffer('corrupt') && player.stamina >= 35) { startAttackCorrupt(); return; }
  if (consumeBuffer('parry') && player.stamina >= 10) { startParry(); return; }
}

function updatePlayer() {
  player.stateTimer++;
  player.animCycle += 0.15;
  player.breathe += 0.03;
  player.capeWave += 0.08;

  if (player.invTimer > 0) { player.invTimer--; if (player.invTimer <= 0) player.invincible = false; }
  if (player.jumpBuffer > 0) player.jumpBuffer--;
  if (player.coyoteTime > 0) player.coyoteTime--;
  if (player.landSquash > 0) player.landSquash -= 0.07;

  if (player.state !== STATES.DASH && player.state !== STATES.ATTACK_GAIA && player.state !== STATES.ATTACK_CORRUPT) {
    player.stamina = Math.min(player.maxStamina, player.stamina + player.staminaRegen);
  }

  player.trailPositions.unshift({ x: player.x, y: player.y, f: player.facing });
  if (player.trailPositions.length > 12) player.trailPositions.pop();

  switch (player.state) {
    case STATES.IDLE:
    case STATES.RUN: {
      var moveX = 0;
      if (keys.left) { moveX = -1; player.facing = -1; }
      if (keys.right) { moveX = 1; player.facing = 1; }
      player.vx = moveX * player.speed;
      if (moveX !== 0) {
        player.legAnim += 0.22;
        if (player.state !== STATES.RUN) changeState(STATES.RUN);
      } else {
        player.legAnim *= 0.85;
        if (player.state !== STATES.IDLE) changeState(STATES.IDLE);
      }
      if (consumeBuffer('up')) { if (!tryJump()) player.jumpBuffer = 8; }
      handleActions();
      break;
    }
    case STATES.JUMP:
    case STATES.FALL: {
      var moveX = 0;
      if (keys.left) { moveX = -1; player.facing = -1; }
      if (keys.right) { moveX = 1; player.facing = 1; }
      player.vx = moveX * player.speed * 0.82;
      if (player.vy > 0.5 && player.state !== STATES.FALL) changeState(STATES.FALL);
      if (consumeBuffer('up')) { if (!tryJump()) player.jumpBuffer = 8; }
      handleActions();
      if (player.grounded) {
        player.landSquash = 1;
        spawnParticles(player.x + player.w / 2, player.y + player.h, 'rgba(70,55,45,0.35)', 5, 1.8, { gravity: 0.01, size: 1.2 });
        changeState(keys.left || keys.right ? STATES.RUN : STATES.IDLE);
      }
      break;
    }
    case STATES.DASH:
      player.vx = player.facing * player.dashSpeed;
      player.vy *= 0.2;
      if (player.stateTimer >= player.dashDuration) {
        player.invincible = false;
        player.vx *= 0.2;
        changeState(player.grounded ? STATES.IDLE : STATES.FALL);
      }
      if (frameCount % 2 === 0) {
        spawnParticles(player.x + player.w / 2, player.y + player.h / 2, '#c8a050', 2, 1, { gravity: 0, size: 2 });
      }
      break;
    case STATES.ATTACK_GAIA:
      player.vx *= 0.55;
      updateAttack(5, 8, 10, 48, 36, 14, '#3a8a45');
      break;
    case STATES.ATTACK_CORRUPT:
      player.vx *= 0.35;
      updateAttack(12, 10, 22, 62, 50, 28, '#7a30b0');
      break;
    case STATES.PARRY:
      player.vx *= 0.3;
      player.parryActive = player.stateTimer <= player.parryWindow;
      if (player.stateTimer >= 28) {
        changeState(player.grounded ? STATES.IDLE : STATES.FALL);
      }
      break;
    case STATES.HIT:
      player.vx *= 0.82;
      if (player.stateTimer >= 18) {
        changeState(player.grounded ? STATES.IDLE : STATES.FALL);
      }
      break;
    case STATES.DEAD:
      player.vx *= 0.92;
      return;
  }

  if (!keys.up && player.vy < -2 && player.state === STATES.JUMP) {
    player.vy *= 0.88;
  }

  player.vy += GRAVITY;
  if (player.vy > MAX_FALL) player.vy = MAX_FALL;
  player.vx *= player.grounded ? GROUND_FRICTION : AIR_FRICTION;

  player.x += player.vx;
  player.y += player.vy;

  player.grounded = false;
  for (var pi = 0; pi < platforms.length; pi++) {
    var p = platforms[pi];
    if (player.x + player.w > p.x && player.x < p.x + p.w &&
        player.y + player.h > p.y && player.y + player.h < p.y + p.h + 14 && player.vy >= 0) {
      player.y = p.y - player.h;
      player.vy = 0;
      player.grounded = true;
      player.canDashInAir = true;
      player.coyoteTime = 7;
    }
  }

  if (player.jumpBuffer > 0 && player.grounded) tryJump();

  if (!player.grounded && player.state !== STATES.JUMP && player.state !== STATES.FALL &&
      player.state !== STATES.DASH && player.state !== STATES.ATTACK_GAIA &&
      player.state !== STATES.ATTACK_CORRUPT && player.state !== STATES.PARRY &&
      player.state !== STATES.HIT) {
    changeState(STATES.FALL);
  }

  if (player.y > H + 150) playerDie();
}

function updateAttack(windup, active, recovery, hitW, hitH, dmg, color) {
  var total = windup + active + recovery;
  player.armSwing = player.stateTimer / total;

  if (player.stateTimer < windup) {
    player.attackPhase = 'windup';
  } else if (player.stateTimer < windup + active) {
    player.attackPhase = 'active';
    var hx = player.facing === 1 ? player.x + player.w : player.x - hitW;
    var hy = player.y + (player.h - hitH) / 2;
    player.hitbox = { x: hx, y: hy, w: hitW, h: hitH, dmg: dmg, color: color };
    if (player.stateTimer === windup) {
      var sx = player.facing === 1 ? player.x + player.w + hitW * 0.5 : player.x - hitW * 0.5;
      spawnSlashTrail(hx, hy, hitW, hitH, color, 10);
      spawnParticles(sx, player.y + player.h * 0.4, color, 8, 3.5, { size: 2.5 });
      screenShake(3, 5);
    }
  } else if (player.stateTimer < total) {
    player.attackPhase = 'recovery';
    player.hitbox = null;
  } else {
    player.hitbox = null;
    changeState(player.grounded ? STATES.IDLE : STATES.FALL);
  }
}

function playerHit(dmg, knockX) {
  if (player.invincible || player.state === STATES.DEAD) return false;
  if (player.parryActive) {
    spawnParticles(player.x + player.w / 2, player.y + player.h / 4, '#5a9ac0', 22, 5.5, { size: 3.5 });
    spawnParticles(player.x + player.w / 2, player.y + player.h / 4, '#ffffff', 8, 3, { size: 1.5 });
    screenShake(10, 12);
    hitStop = 10;
    player.stamina = Math.min(player.maxStamina, player.stamina + 20);
    return true;
  }
  player.health -= dmg;
  player.vx = knockX;
  player.vy = -3.5;
  player.invincible = true;
  player.invTimer = 40;
  changeState(STATES.HIT);
  screenShake(12, 14);
  hitStop = 6;
  spawnParticles(player.x + player.w / 2, player.y + player.h / 2, '#6b0a18', 15, 4.5, { size: 2.5 });
  comboCount = 0;
  if (player.health <= 0) playerDie();
  return false;
}

function playerDie() {
  player.health = 0;
  changeState(STATES.DEAD);
  spawnParticles(player.x + player.w / 2, player.y + player.h / 2, '#6b0a18', 40, 6.5, { size: 3.5 });
  screenShake(18, 25);
  setTimeout(function() { document.getElementById('death-screen').classList.add('visible'); }, 1000);
}

function updateEnemy(e) {
  if (!e.alive) { e.deathTimer++; return; }
  e.stateTimer++;
  e.animCycle += 0.1;
  e.breathe += 0.025;
  if (e.hitTimer > 0) e.hitTimer--;
  if (e.hitFlash > 0) e.hitFlash--;
  if (e.attackCooldown > 0) e.attackCooldown--;

  var dx = player.x - e.x;
  var dist = Math.abs(dx);
  if (e.state !== 'HIT') e.facing = dx > 0 ? 1 : -1;

  switch (e.state) {
    case 'PATROL':
      e.vx = e.patrolDir * e.speed * 0.4;
      e.patrolDist += Math.abs(e.vx);
      if (e.patrolDist >= e.patrolMax) { e.patrolDir *= -1; e.patrolDist = 0; }
      if (dist < e.aggroRange && player.state !== STATES.DEAD) { e.state = 'CHASE'; e.stateTimer = 0; }
      break;
    case 'CHASE':
      e.vx = e.facing * e.speed * 1.4;
      if (dist < e.attackRange && e.attackCooldown <= 0) {
        e.state = 'TELEGRAPH'; e.stateTimer = 0; e.telegraphTimer = e.telegraphDur; e.vx = 0;
      }
      if (dist > e.aggroRange * 2.8) { e.state = 'PATROL'; e.stateTimer = 0; e.patrolDist = 0; }
      break;
    case 'TELEGRAPH':
      e.vx = 0;
      e.telegraphTimer--;
      if (e.telegraphTimer <= 0) {
        e.state = 'ATTACK'; e.stateTimer = 0;
        e.vx = e.facing * (e.type === 'flagellant' ? 6 : 8);
      }
      break;
    case 'ATTACK':
      e.vx *= 0.9;
      if (e.stateTimer < 14) {
        var atkW = e.type === 'flagellant' ? 54 : 40;
        var ex = e.facing === 1 ? e.x + e.w : e.x - atkW;
        if (player.x + player.w > ex && player.x < ex + atkW &&
            player.y + player.h > e.y && player.y < e.y + e.h) {
          var parried = playerHit(e.dmg, e.facing * 6);
          if (parried) {
            e.hitTimer = 28; e.vx = -e.facing * 5.5;
            e.health -= 15;
            spawnParticles(e.x + e.w / 2, e.y + e.h / 3, '#5a9ac0', 12, 4, { size: 2.5 });
            if (e.health <= 0) killEnemy(e);
          }
        }
      }
      if (e.stateTimer >= 30) { e.state = 'CHASE'; e.stateTimer = 0; e.attackCooldown = e.type === 'flagellant' ? 60 : 40; }
      break;
    case 'HIT':
      e.vx *= 0.82;
      if (e.stateTimer >= 16) { e.state = 'CHASE'; e.stateTimer = 0; }
      break;
  }

  e.vy += GRAVITY;
  if (e.vy > MAX_FALL) e.vy = MAX_FALL;
  e.x += e.vx;
  e.y += e.vy;

  for (var pi = 0; pi < platforms.length; pi++) {
    var p = platforms[pi];
    if (e.x + e.w > p.x && e.x < p.x + p.w &&
        e.y + e.h > p.y && e.y + e.h < p.y + p.h + 14 && e.vy >= 0) {
      e.y = p.y - e.h; e.vy = 0;
    }
  }

  if (player.hitbox && e.alive && e.hitTimer <= 0) {
    var hb = player.hitbox;
    if (e.x + e.w > hb.x && e.x < hb.x + hb.w &&
        e.y + e.h > hb.y && e.y < hb.y + hb.h) {
      e.health -= hb.dmg;
      e.vx = player.facing * 5;
      e.vy = -2.5;
      e.hitTimer = 18;
      e.hitFlash = 12;
      e.state = 'HIT';
      e.stateTimer = 0;
      hitStop = 7;
      screenShake(6, 8);
      comboCount++;
      comboTimer = 100;
      spawnParticles(e.x + e.w / 2, e.y + e.h / 3, hb.color, 12, 4, { size: 2.5 });
      if (e.health <= 0) killEnemy(e);
    }
  }
}

function killEnemy(e) {
  e.alive = false;
  e.deathTimer = 0;
  spawnParticles(e.x + e.w / 2, e.y + e.h / 2, '#6b0a18', 30, 6, { size: 3 });
  spawnParticles(e.x + e.w / 2, e.y + e.h / 2, '#2a0a10', 15, 3, { size: 4 });
  screenShake(8, 10);
  hitStop = 9;
  setTimeout(function() {
    e.alive = true; e.health = e.maxHealth;
    e.x = e.spawnX; e.y = e.spawnY;
    e.state = 'PATROL'; e.vx = 0; e.vy = 0;
    e.deathTimer = 0; e.hitTimer = 0;
  }, 7000);
}

function updateCamera() {
  var targetX = player.x - W * 0.35;
  cameraX += (targetX - cameraX) * 0.06;
  if (cameraX < 0) cameraX = 0;
}

function updateParticles() {
  for (var i = particles.length - 1; i >= 0; i--) {
    var p = particles[i];
    p.x += p.vx; p.y += p.vy;
    p.vy += (p.gravity || 0.06);
    p.vx *= 0.98;
    p.life -= p.decay;
    p.size *= 0.975;
    if (p.life <= 0 || p.size < 0.2) particles.splice(i, 1);
  }
  for (var i = slashTrails.length - 1; i >= 0; i--) {
    slashTrails[i].life -= slashTrails[i].decay;
    if (slashTrails[i].life <= 0) slashTrails.splice(i, 1);
  }
}

function updateEmbers() {
  for (var ei = 0; ei < embers.length; ei++) {
    var em = embers[ei];
    em.x += em.vx + Math.sin(frameCount * 0.015 + em.phase) * 0.08;
    em.y += em.vy;
    em.life -= 0.002;
    if (em.life <= 0) {
      em.x = cameraX + Math.random() * W;
      em.y = GROUND_Y + Math.random() * 10;
      em.vy = -0.2 - Math.random() * 0.6;
      em.life = 0.8 + Math.random() * 0.2;
    }
  }
}

function drawBackground() {
  var grd = ctx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, '#020204');
  grd.addColorStop(0.08, '#04030a');
  grd.addColorStop(0.2, '#080612');
  grd.addColorStop(0.4, '#0a0818');
  grd.addColorStop(0.6, '#0c0a1a');
  grd.addColorStop(0.8, '#0e0c18');
  grd.addColorStop(1, '#0a0810');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  if (imgReady('bg')) {
    var bgImg = IMG.bg;
    var parallaxSpeed = 0.06;
    var bgW = W * 1.6;
    var bgH = H * 0.7;
    var bgX = -(cameraX * parallaxSpeed) % (bgW * 0.75);
    var bgY = H * 0.08;

    ctx.globalAlpha = 0.35;
    ctx.drawImage(bgImg, bgX, bgY, bgW, bgH);
    if (bgX + bgW < W + 100) {
      ctx.drawImage(bgImg, bgX + bgW * 0.72, bgY, bgW, bgH);
    }

    ctx.globalAlpha = 0.15;
    var bg2X = -(cameraX * 0.03) % (bgW * 0.8);
    ctx.drawImage(bgImg, bg2X - 200, bgY - 30, bgW * 1.3, bgH * 0.8);
    ctx.globalAlpha = 1;
  }

  var moonX = W * 0.78;
  var moonY = H * 0.08;
  var moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 80);
  moonGlow.addColorStop(0, 'rgba(100,60,60,0.06)');
  moonGlow.addColorStop(0.3, 'rgba(60,35,40,0.03)');
  moonGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = moonGlow;
  ctx.fillRect(moonX - 100, moonY - 100, 200, 200);
  ctx.fillStyle = 'rgba(80,50,50,0.07)';
  ctx.beginPath();
  ctx.arc(moonX, moonY, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(60,35,35,0.03)';
  ctx.beginPath();
  ctx.arc(moonX + 3, moonY - 2, 10, 0, Math.PI * 2);
  ctx.fill();

  for (var li = 0; li < lightShafts.length; li++) {
    var shaft = lightShafts[li];
    var sx = shaft.x - cameraX * 0.15;
    if (sx < -100 || sx > W + 100) continue;
    var shaftAlpha = shaft.alpha * (0.6 + Math.sin(frameCount * 0.008 + shaft.phase) * 0.4);
    var sg = ctx.createLinearGradient(sx, 0, sx, GROUND_Y);
    sg.addColorStop(0, 'rgba(80,50,40,' + shaftAlpha + ')');
    sg.addColorStop(0.5, 'rgba(60,35,25,' + (shaftAlpha * 0.4) + ')');
    sg.addColorStop(1, 'rgba(40,20,15,0)');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.moveTo(sx - shaft.w * 0.3, 0);
    ctx.lineTo(sx + shaft.w * 0.3, 0);
    ctx.lineTo(sx + shaft.w, GROUND_Y);
    ctx.lineTo(sx - shaft.w, GROUND_Y);
    ctx.closePath();
    ctx.fill();
  }

  for (var mi = 0; mi < dustMotes.length; mi++) {
    var mote = dustMotes[mi];
    mote.x += mote.speed;
    mote.y += Math.sin(frameCount * 0.01 + mote.phase) * 0.15 + mote.drift;
    if (mote.x > cameraX + W + 80) mote.x = cameraX - 80;
    if (mote.y < 0) mote.y = H * 0.8;
    if (mote.y > H) mote.y = 0;
    var mx = mote.x - cameraX;
    if (mx < -10 || mx > W + 10) continue;
    var flicker = 0.5 + Math.sin(frameCount * 0.015 + mote.phase) * 0.5;
    ctx.beginPath();
    ctx.arc(mx, mote.y, mote.r, 0, Math.PI * 2);
    if (mote.color === 'ash') {
      ctx.fillStyle = 'rgba(120,100,90,' + (mote.alpha * flicker) + ')';
    } else {
      ctx.fillStyle = 'rgba(160,120,80,' + (mote.alpha * flicker * 0.6) + ')';
    }
    ctx.fill();
  }

  for (var ei = 0; ei < embers.length; ei++) {
    var em = embers[ei];
    var ex = em.x - cameraX;
    if (ex < -10 || ex > W + 10) continue;
    var a = em.life * 0.5;
    if (em.color === 'soul') {
      ctx.fillStyle = 'rgba(80,120,160,' + (a * 0.4) + ')';
      ctx.beginPath();
      ctx.arc(ex, em.y, em.size * em.life * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(140,180,220,' + (a * 0.2) + ')';
    } else {
      ctx.fillStyle = 'rgba(160,60,30,' + a + ')';
      ctx.beginPath();
      ctx.arc(ex, em.y, em.size * em.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(200,100,40,' + (a * 0.2) + ')';
    }
    ctx.beginPath();
    ctx.arc(ex, em.y, em.size * em.life * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  for (var ci = 0; ci < chains.length; ci++) {
    var ch = chains[ci];
    var cx2 = ch.x - cameraX * 0.3;
    if (cx2 < -20 || cx2 > W + 20) continue;
    ch.swing += ch.speed;
    var swingOff = Math.sin(ch.swing) * 4;
    ctx.strokeStyle = 'rgba(60,45,35,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx2, 0);
    ctx.quadraticCurveTo(cx2 + swingOff, ch.len * 0.5, cx2 + swingOff * 0.5, ch.len);
    ctx.stroke();
    ctx.fillStyle = 'rgba(80,50,30,0.06)';
    ctx.beginPath();
    ctx.arc(cx2 + swingOff * 0.5, ch.len, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawDecorationsBehind() {
  for (var ai = 0; ai < bgArchElements.length; ai++) {
    var arch = bgArchElements[ai];
    if (!imgReady(arch.imgKey)) continue;
    var aImg = IMG[arch.imgKey];
    var ax = arch.x - cameraX * arch.depth;
    if (ax < -500 || ax > W + 500) continue;
    var asw = aImg.naturalWidth * arch.cropW;
    var ash = aImg.naturalHeight * arch.cropH;
    var asx = aImg.naturalWidth * arch.cropX;
    var asy = aImg.naturalHeight * arch.cropY;
    var adw = asw * arch.scale * 3.5;
    var adh = ash * arch.scale * 3.5;
    ctx.globalAlpha = arch.alpha;
    ctx.drawImage(aImg, asx, asy, asw, ash, ax, GROUND_Y - adh + 12, adw, adh);
    ctx.globalAlpha = 1;
  }

  for (var ti = 0; ti < bgTrees.length; ti++) {
    var tree = bgTrees[ti];
    if (!imgReady(tree.imgKey)) continue;
    var tImg = IMG[tree.imgKey];
    var tx = tree.x - cameraX * tree.depth;
    if (tx < -400 || tx > W + 400) continue;
    var tw = tImg.naturalWidth * tree.scale;
    var th = tImg.naturalHeight * tree.scale;
    ctx.globalAlpha = tree.alpha;
    ctx.drawImage(tImg, tx, GROUND_Y - th + 20, tw, th);
    ctx.globalAlpha = 1;
  }

  for (var di = 0; di < groundDecorations.length; di++) {
    var d = groundDecorations[di];
    if (!imgReady(d.imgKey)) continue;
    var dImg = IMG[d.imgKey];
    var dx = d.x - cameraX;
    if (dx < -500 || dx > W + 500) continue;
    var dsw = dImg.naturalWidth * d.cropW;
    var dsh = dImg.naturalHeight * d.cropH;
    var dsx = dImg.naturalWidth * d.cropX;
    var dsy = dImg.naturalHeight * d.cropY;
    var ddw = dsw * d.scale * 4.5;
    var ddh = dsh * d.scale * 4.5;
    ctx.globalAlpha = 0.65;
    ctx.drawImage(dImg, dsx, dsy, dsw, dsh, dx, GROUND_Y - ddh + (d.yOff || 0), ddw, ddh);
    ctx.globalAlpha = 1;
  }
}

function drawPlatforms() {
  for (var bi = 0; bi < bloodPools.length; bi++) {
    var bp = bloodPools[bi];
    var bx = bp.x - cameraX;
    if (bx + bp.w < -20 || bx > W + 20) continue;
    var bg = ctx.createRadialGradient(bx + bp.w / 2, bp.y, 0, bx + bp.w / 2, bp.y, bp.w / 2);
    bg.addColorStop(0, 'rgba(50,8,10,0.15)');
    bg.addColorStop(0.7, 'rgba(35,5,8,0.06)');
    bg.addColorStop(1, 'rgba(20,3,5,0)');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.ellipse(bx + bp.w / 2, bp.y, bp.w / 2, bp.h, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  for (var pi = 0; pi < platforms.length; pi++) {
    var p = platforms[pi];
    var px = p.x - cameraX;
    if (px + p.w < -80 || px > W + 80) continue;

    if (p.type === 'ground') {
      var ggrd = ctx.createLinearGradient(px, p.y, px, p.y + p.h);
      ggrd.addColorStop(0, '#1a1620');
      ggrd.addColorStop(0.02, '#14101c');
      ggrd.addColorStop(0.08, '#100e18');
      ggrd.addColorStop(0.3, '#0c0a14');
      ggrd.addColorStop(1, '#080610');
      ctx.fillStyle = ggrd;
      ctx.fillRect(px, p.y, p.w, p.h);

      if (imgReady('platforms')) {
        var gPlatImg = IMG.platforms;
        var gCrop = GROUND_PLAT_CROP;
        var gsx = gPlatImg.naturalWidth * gCrop[0];
        var gsy = gPlatImg.naturalHeight * gCrop[1];
        var gsw = gPlatImg.naturalWidth * gCrop[2];
        var gsh = gPlatImg.naturalHeight * gCrop[3];
        var tileW = 320;
        var tileH = 40;
        var visibleLeft = Math.max(0, px);
        var visibleRight = Math.min(W, px + p.w);
        var startTile = Math.floor((visibleLeft - px) / tileW);
        var endTile = Math.ceil((visibleRight - px) / tileW);
        for (var ti = startTile; ti < endTile; ti++) {
          var tileX = px + ti * tileW;
          ctx.globalAlpha = 0.85;
          ctx.drawImage(gPlatImg, gsx, gsy, gsw, gsh, tileX, p.y - 8, tileW, tileH);
          ctx.globalAlpha = 1;
        }
      } else {
        ctx.fillStyle = '#2a2238';
        ctx.fillRect(px, p.y, p.w, 1);
        ctx.fillStyle = 'rgba(50,35,25,0.06)';
        ctx.fillRect(px, p.y + 1, p.w, 3);
      }

      for (var gi = 0; gi < p.w; gi += 160) {
        var gx = px + gi;
        var gg = ctx.createRadialGradient(gx + 80, p.y + 2, 0, gx + 80, p.y + 2, 40);
        gg.addColorStop(0, 'rgba(30,50,30,0.03)');
        gg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gg;
        ctx.fillRect(gx, p.y - 2, 160, 20);
      }
    } else {
      if (imgReady('platforms')) {
        var platImg = IMG.platforms;
        var cropIdx = pi % PLAT_CROPS.length;
        var crop = PLAT_CROPS[cropIdx];
        var sx = platImg.naturalWidth * crop[0];
        var sy = platImg.naturalHeight * crop[1];
        var sw = platImg.naturalWidth * crop[2];
        var sh = platImg.naturalHeight * crop[3];
        var drawW = p.w + 50;
        var drawH = 44;
        ctx.drawImage(platImg, sx, sy, sw, sh, px - 25, p.y - 18, drawW, drawH);
      } else {
        ctx.fillStyle = '#121020';
        ctx.fillRect(px - 2, p.y + 3, p.w + 4, p.h + 2);
        ctx.fillStyle = '#181428';
        ctx.fillRect(px, p.y, p.w, p.h);
        ctx.fillStyle = '#2a2240';
        ctx.fillRect(px, p.y, p.w, 1);
      }

      var gl = ctx.createRadialGradient(px + p.w / 2, p.y + p.h + 5, 0, px + p.w / 2, p.y + p.h + 5, 50);
      gl.addColorStop(0, 'rgba(40,25,20,0.04)');
      gl.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gl;
      ctx.fillRect(px - 40, p.y + p.h, p.w + 80, 60);
    }
  }
}

function drawPlayerSprite(px, py, f, state, st) {
  var img = IMG.player;
  
  if (!player.lastAnimState) player.lastAnimState = state;
  if (state === STATES.IDLE && player.lastAnimState !== STATES.IDLE) {
    player.idleVariation = Math.random() < 0.5 ? 'idle' : 'idle2';
  }
  player.lastAnimState = state;
  if (!player.idleVariation) player.idleVariation = 'idle';

  if (state === STATES.IDLE && imgReady(player.idleVariation)) {
    var vArr = IMG[player.idleVariation];
    img = vArr[ Math.floor(frameCount * 0.035) % vArr.length ] || IMG.player;
  } else if (state === STATES.RUN && imgReady('run')) {
    img = IMG.run[ Math.floor(player.legAnim * 1.75) % IMG.run.length ] || IMG.player;
  } else if ((state === STATES.JUMP || state === STATES.FALL) && imgReady('jump')) {
    var vT = (player.vy + 9.5) / 21.5;
    vT = Math.max(0, Math.min(1, vT));
    img = IMG.jump[ Math.floor(vT * (IMG.jump.length - 1)) ] || IMG.player;
  } else if (imgReady('idle') && imgReady('jump')) {
    // Dash, attack fallbacks
    img = state === STATES.DASH ? IMG.jump[9] : IMG.idle[0];
  }
  
  var cx = px + player.w / 2;
  var by = py + player.h;
  var bob = Math.sin(player.breathe) * 0.8;
  var lean = 0;
  var sqX = 1, sqY = 1;
  var sprH = 90;
  var sprW = 52;
  if (img && img.naturalWidth > 0 && img.naturalHeight > 0) {
    sprW = sprH * (img.naturalWidth / img.naturalHeight);
  }

  if (player.landSquash > 0) { sqX = 1 + player.landSquash * 0.12; sqY = 1 - player.landSquash * 0.1; }
  if (state === STATES.JUMP && player.vy < -4) { sqX = 0.9; sqY = 1.1; }

  if (state === STATES.RUN) { lean = f * 0.05; bob += Math.sin(player.legAnim * 2) * 1.2; }
  if (state === STATES.JUMP) lean = f * -0.04;
  if (state === STATES.FALL) lean = f * 0.03;
  if (state === STATES.ATTACK_GAIA) lean = f * 0.1 * player.armSwing;
  if (state === STATES.ATTACK_CORRUPT) lean = f * 0.14 * player.armSwing;
  if (state === STATES.HIT) lean = -f * 0.12;
  if (state === STATES.DASH) { sqX *= 1.12; sqY *= 0.93; }

  ctx.save();
  ctx.translate(cx, by);
  ctx.scale(f, 1);
  ctx.scale(sqX, sqY);
  ctx.rotate(lean);

  if (img && img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, -sprW / 2, -sprH + bob, sprW, sprH);
  } else {
    ctx.fillStyle = '#1a1220';
    ctx.fillRect(-12, -52, 24, 52);
    ctx.fillStyle = '#6b0a18';
    ctx.fillRect(2, -48, 4, 3);
    
    // DEBUG TEXT
    ctx.save();
    ctx.scale(f, 1);
    ctx.fillStyle = '#fff';
    ctx.font = '10px monospace';
    var debugStr = "Miss: " + state + " | Run: " + (IMG.run ? IMG.run.length : 'none');
    ctx.fillText(debugStr, -30, -60);
    ctx.restore();
  }

  var eyePulse = 0.35 + Math.sin(frameCount * 0.04) * 0.2;
  ctx.fillStyle = 'rgba(180,20,20,' + eyePulse + ')';
  ctx.beginPath(); ctx.arc(2, -68 + bob, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(180,20,20,' + (eyePulse * 0.2) + ')';
  ctx.beginPath(); ctx.arc(2, -68 + bob, 8, 0, Math.PI * 2); ctx.fill();

  var markP = Math.sin(frameCount * 0.03) * 0.2 + 0.25;
  ctx.fillStyle = 'rgba(180,30,30,' + markP + ')';
  ctx.beginPath(); ctx.arc(0, -48 + bob, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(180,30,30,' + (markP * 0.12) + ')';
  ctx.beginPath(); ctx.arc(0, -48 + bob, 10, 0, Math.PI * 2); ctx.fill();

  if (state === STATES.ATTACK_GAIA && player.attackPhase === 'active') {
    ctx.strokeStyle = 'rgba(58,138,69,0.7)';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(22, -32, 26, -0.9, 1.3); ctx.stroke();
    ctx.strokeStyle = 'rgba(58,138,69,0.15)';
    ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(22, -32, 26, -0.6, 1.0); ctx.stroke();
  }

  if (state === STATES.ATTACK_CORRUPT && player.attackPhase === 'active') {
    ctx.fillStyle = 'rgba(122,48,176,0.08)';
    ctx.beginPath(); ctx.arc(26, -28, 36, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(122,48,176,0.6)';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(26, -28, 26, -1.2, 1.6); ctx.stroke();
    for (var ri = 0; ri < 5; ri++) {
      var ra = (ri / 5) * Math.PI * 2 + frameCount * 0.08;
      var rdist = 18 + Math.sin(frameCount * 0.1 + ri) * 7;
      ctx.fillStyle = 'rgba(122,48,176,0.35)';
      ctx.beginPath();
      ctx.arc(26 + Math.cos(ra) * rdist, -28 + Math.sin(ra) * rdist, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (state === STATES.PARRY) {
    var shA = player.parryActive ? 0.7 : 0.25;
    ctx.fillStyle = 'rgba(90,154,192,' + (shA * 0.12) + ')';
    ctx.beginPath(); ctx.ellipse(-16, -34, 15, 26, -0.15, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(90,154,192,' + shA + ')';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(-16, -34, 15, 26, -0.15, 0, Math.PI * 2); ctx.stroke();
    if (player.parryActive) {
      for (var si = 0; si < 4; si++) {
        var sx2 = -16 + Math.cos(frameCount * 0.12 + si * 1.57) * 11;
        var sy2 = -34 + Math.sin(frameCount * 0.12 + si * 1.57) * 20;
        ctx.fillStyle = 'rgba(140,190,220,0.5)';
        ctx.beginPath(); ctx.arc(sx2, sy2, 1, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  if (state === STATES.DASH) {
    ctx.fillStyle = 'rgba(200,160,80,0.06)';
    ctx.beginPath(); ctx.ellipse(-15, -40, 26, 40, 0, 0, Math.PI * 2); ctx.fill();
  }

  ctx.restore();
}

function drawPlayer() {
  var px = player.x - cameraX;
  var py = player.y;

  if (player.state === STATES.DEAD) {
    ctx.globalAlpha = Math.max(0, 1 - player.stateTimer * 0.016);
  }
  if (player.invincible && player.state !== STATES.DASH && frameCount % 4 < 2) {
    ctx.globalAlpha *= 0.3;
  }

  if (player.state === STATES.DASH && imgReady('player')) {
    for (var i = 1; i < player.trailPositions.length; i++) {
      var tp = player.trailPositions[i];
      var alpha = (1 - i / player.trailPositions.length) * 0.12;
      ctx.globalAlpha = alpha;
      var tpx = tp.x - cameraX + player.w / 2;
      var tpy = tp.y + player.h;
      ctx.save();
      ctx.translate(tpx, tpy);
      ctx.scale(tp.f, 1);
      ctx.drawImage(IMG.player, -26, -90, 52, 90);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  var shadow_grd = ctx.createRadialGradient(px + player.w / 2, player.y + player.h + 2, 0, px + player.w / 2, player.y + player.h + 2, 20);
  shadow_grd.addColorStop(0, 'rgba(0,0,0,0.2)');
  shadow_grd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shadow_grd;
  ctx.beginPath();
  ctx.ellipse(px + player.w / 2, player.y + player.h + 2, 16, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  drawPlayerSprite(px, py, player.facing, player.state, player.stateTimer);

  if (player.hitbox && player.attackPhase === 'active') {
    var hb = player.hitbox;
    var hpx = hb.x - cameraX;
    var gg = ctx.createRadialGradient(
      hpx + hb.w / 2, hb.y + hb.h / 2, 0,
      hpx + hb.w / 2, hb.y + hb.h / 2, Math.max(hb.w, hb.h) * 0.7
    );
    gg.addColorStop(0, hb.color + '18');
    gg.addColorStop(1, hb.color + '02');
    ctx.fillStyle = gg;
    ctx.fillRect(hpx - 8, hb.y - 8, hb.w + 16, hb.h + 16);
  }

  ctx.globalAlpha = 1;
}

function drawEnemySprite(e) {
  if (!e.alive) {
    if (e.deathTimer < 40) {
      ctx.globalAlpha = 1 - e.deathTimer / 40;
      var dpx = e.x - cameraX;
      for (var i = 0; i < 6; i++) {
        var ox = Math.sin(e.deathTimer * 0.3 + i * 1.2) * e.deathTimer * 0.9;
        var oy = -e.deathTimer * 0.6 + Math.cos(i * 2.1) * e.deathTimer * 0.35;
        ctx.fillStyle = i % 2 === 0 ? '#2a0a14' : '#3a1220';
        ctx.fillRect(dpx + e.w / 2 + ox - 3, e.y + e.h / 2 + oy - 3, 5, 6);
      }
      ctx.globalAlpha = 1;
    }
    return;
  }

  var epx = e.x - cameraX;
  if (epx + e.w < -80 || epx > W + 80) return;

  var isBig = e.type === 'flagellant';
  var imgKey = isBig ? 'enemyBig' : 'enemySmall';
  var eImg = IMG[imgKey];
  var cx = epx + e.w / 2;
  var by = e.y + e.h;
  var bob = Math.sin(e.breathe) * 0.5;
  var flash = e.hitFlash > 0 && frameCount % 3 === 0;
  var sprW = isBig ? 75 : 60;
  var sprH = isBig ? 95 : 80;

  var sg = ctx.createRadialGradient(cx, by + 2, 0, cx, by + 2, 16);
  sg.addColorStop(0, 'rgba(0,0,0,0.18)');
  sg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.ellipse(cx, by + 2, 14, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(cx, by);
  ctx.scale(e.facing, 1);

  var eLean = 0;
  if (e.state === 'CHASE') eLean = 0.04;
  if (e.state === 'ATTACK' && e.stateTimer < 16) eLean = 0.1;
  if (e.state === 'HIT') eLean = -0.1;
  ctx.rotate(eLean);

  if (flash) {
    try { ctx.filter = 'brightness(3) saturate(0)'; } catch(ex) {}
  }

  if (imgReady(imgKey)) {
    ctx.drawImage(eImg, -sprW / 2, -sprH + bob, sprW, sprH);
  } else {
    ctx.fillStyle = flash ? '#ccc' : (isBig ? '#1a0c14' : '#140a10');
    ctx.fillRect(-e.w / 2, -e.h, e.w, e.h);
    ctx.fillStyle = flash ? '#fff' : '#aa2020';
    ctx.fillRect(3, -e.h + 8, 2, 2);
  }

  try { ctx.filter = 'none'; } catch(ex) {}

  var isAggro = e.state === 'CHASE' || e.state === 'ATTACK';
  var isTele = e.state === 'TELEGRAPH';

  if (isTele) {
    var fr = Math.sin(e.stateTimer * 0.4);
    ctx.fillStyle = 'rgba(180,100,30,0.2)';
    ctx.beginPath(); ctx.arc(3, -sprH + 16, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(180,40,30,' + (0.2 + fr * 0.3) + ')';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -sprH - 6);
    ctx.lineTo(-4, -sprH - 14);
    ctx.lineTo(4, -sprH - 14);
    ctx.closePath();
    ctx.stroke();
  }

  if (isAggro && !isTele) {
    var glowC = e.state === 'ATTACK' ? 'rgba(180,40,30,0.15)' : 'rgba(140,30,20,0.08)';
    ctx.fillStyle = glowC;
    ctx.beginPath(); ctx.arc(3, -sprH + 16, 5, 0, Math.PI * 2); ctx.fill();
  }

  if (e.state === 'ATTACK' && e.stateTimer < 16) {
    var atkColor = isBig ? 'rgba(100,40,140,0.2)' : 'rgba(140,20,30,0.2)';
    ctx.fillStyle = atkColor;
    ctx.beginPath();
    ctx.arc(sprW / 2 + 8, -sprH / 2, isBig ? 18 : 12, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  if (e.health < e.maxHealth && e.alive) {
    var barW = e.w + 12;
    var barH = 2;
    var barX = epx - 6;
    var barY = e.y - 12;
    ctx.fillStyle = 'rgba(5,3,3,0.8)';
    ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
    ctx.fillStyle = '#6b0a18';
    ctx.fillRect(barX, barY, barW * Math.max(0, e.health / e.maxHealth), barH);
    ctx.strokeStyle = 'rgba(107,10,24,0.15)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(barX - 1, barY - 1, barW + 2, barH + 2);
  }
}

function drawSlashTrails() {
  for (var i = 0; i < slashTrails.length; i++) {
    var t = slashTrails[i];
    ctx.globalAlpha = t.life * 0.4;
    var tpx = t.x - cameraX;
    var grd = ctx.createRadialGradient(
      tpx + t.w / 2, t.y + t.h / 2, 0,
      tpx + t.w / 2, t.y + t.h / 2, Math.max(t.w, t.h) * 0.65
    );
    grd.addColorStop(0, t.color + '30');
    grd.addColorStop(1, t.color + '00');
    ctx.fillStyle = grd;
    ctx.fillRect(tpx - 12, t.y - 12, t.w + 24, t.h + 24);
    ctx.strokeStyle = t.color;
    ctx.lineWidth = 2 * t.life;
    ctx.beginPath();
    var tcx = tpx + t.w / 2;
    var tcy = t.y + t.h / 2;
    var r = Math.max(t.w, t.h) * 0.45;
    ctx.arc(tcx, tcy, r, -Math.PI * 0.7 * t.life, Math.PI * 0.7 * t.life);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawParticles() {
  for (var i = 0; i < particles.length; i++) {
    var p = particles[i];
    ctx.globalAlpha = p.life * 0.8;
    ctx.fillStyle = p.color;
    var ppx = p.x - cameraX;
    if (p.size > 3) {
      ctx.beginPath();
      ctx.arc(ppx, p.y, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(ppx - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
  }
  ctx.globalAlpha = 1;
}

function drawFog() {
  var fg = ctx.createLinearGradient(0, H - 100, 0, H);
  fg.addColorStop(0, 'rgba(3,3,6,0)');
  fg.addColorStop(0.3, 'rgba(6,4,10,0.12)');
  fg.addColorStop(0.7, 'rgba(8,6,14,0.35)');
  fg.addColorStop(1, 'rgba(3,3,6,0.7)');
  ctx.fillStyle = fg;
  ctx.fillRect(0, H - 100, W, 100);

  var fogWave1 = Math.sin(frameCount * 0.005) * 15;
  var fogWave2 = Math.cos(frameCount * 0.007) * 10;
  ctx.globalAlpha = 0.04;
  ctx.fillStyle = '#1a1228';
  for (var fi = 0; fi < W; fi += 60) {
    var fy = GROUND_Y - 5 + Math.sin((fi + frameCount * 0.3) * 0.015) * 8 + fogWave1;
    ctx.beginPath();
    ctx.ellipse(fi, fy, 45, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 0.03;
  for (var fi = 30; fi < W; fi += 80) {
    var fy = GROUND_Y - 15 + Math.sin((fi + frameCount * 0.2) * 0.012) * 12 + fogWave2;
    ctx.beginPath();
    ctx.ellipse(fi, fy, 55, 14, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  var tf = ctx.createLinearGradient(0, 0, 0, 60);
  tf.addColorStop(0, 'rgba(2,2,4,0.6)');
  tf.addColorStop(1, 'rgba(2,2,4,0)');
  ctx.fillStyle = tf;
  ctx.fillRect(0, 0, W, 60);

  var lf = ctx.createLinearGradient(0, 0, 60, 0);
  lf.addColorStop(0, 'rgba(2,2,4,0.35)');
  lf.addColorStop(1, 'rgba(2,2,4,0)');
  ctx.fillStyle = lf;
  ctx.fillRect(0, 0, 60, H);

  var rf = ctx.createLinearGradient(W, 0, W - 60, 0);
  rf.addColorStop(0, 'rgba(2,2,4,0.35)');
  rf.addColorStop(1, 'rgba(2,2,4,0)');
  ctx.fillStyle = rf;
  ctx.fillRect(W - 60, 0, 60, H);
}

function drawVignette() {
  var grd = ctx.createRadialGradient(W / 2, H / 2, W * 0.2, W / 2, H / 2, W * 0.85);
  grd.addColorStop(0, 'rgba(0,0,0,0)');
  grd.addColorStop(0.6, 'rgba(0,0,0,0.12)');
  grd.addColorStop(0.85, 'rgba(0,0,0,0.3)');
  grd.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);
}

function drawScanlines() {
  ctx.fillStyle = 'rgba(0,0,0,0.02)';
  for (var y = 0; y < H; y += 3) {
    ctx.fillRect(0, y, W, 1);
  }
}

function drawColorGrade() {
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = 'rgba(20,8,5,0.04)';
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
}

function updateHUD() {
  var hp = Math.max(0, Math.round(player.health));
  var sp = Math.max(0, Math.round(player.stamina));
  document.getElementById('health-bar').style.width = (player.health / player.maxHealth * 100) + '%';
  document.getElementById('stamina-bar').style.width = (player.stamina / player.maxStamina * 100) + '%';
  document.getElementById('health-text').textContent = hp;
  document.getElementById('stamina-text').textContent = sp;

  if (comboTimer > 0) {
    comboTimer--;
    var el = document.getElementById('combo-display');
    if (comboCount > 1) {
      el.textContent = comboCount + ' HIT';
      el.classList.add('visible');
    }
    if (comboTimer <= 0) {
      comboCount = 0;
      el.classList.remove('visible');
    }
  }
}

function gameLoop() {
  if (!gameStarted) { requestAnimationFrame(gameLoop); return; }
  frameCount++;

  if (hitStop > 0) {
    hitStop--;
    requestAnimationFrame(gameLoop);
    return;
  }

  tickBuffers();

  if (player.state !== STATES.DEAD) {
    updatePlayer();
    enemies.forEach(updateEnemy);
    updateCamera();
  }
  updateParticles();
  updateEmbers();

  if (shakeTimer > 0) {
    shakeTimer--;
    shakeAmount *= 0.88;
    ctx.save();
    ctx.translate(
      (Math.random() - 0.5) * shakeAmount * 2,
      (Math.random() - 0.5) * shakeAmount * 2
    );
  }

  drawBackground();
  drawDecorationsBehind();
  drawPlatforms();
  drawSlashTrails();
  enemies.forEach(drawEnemySprite);
  drawPlayer();
  drawParticles();
  drawFog();
  drawVignette();
  drawScanlines();
  drawColorGrade();

  if (shakeTimer > 0) ctx.restore();

  updateHUD();
  requestAnimationFrame(gameLoop);
}

function startGame() {
  if (gameStarted) return;
  gameStarted = true;
  document.getElementById('title-screen').classList.add('hidden');
}

function respawn() {
  document.getElementById('death-screen').classList.remove('visible');
  player.x = 100; player.y = GROUND_Y - 60;
  player.vx = 0; player.vy = 0;
  player.health = player.maxHealth;
  player.stamina = player.maxStamina;
  player.invincible = true;
  player.invTimer = 60;
  changeState(STATES.IDLE);
  enemies.forEach(function(e) {
    e.alive = true; e.health = e.maxHealth;
    e.x = e.spawnX; e.y = e.spawnY;
    e.state = 'PATROL'; e.vx = 0; e.vy = 0;
    e.hitTimer = 0;
  });
  cameraX = 0;
}

window.addEventListener('resize', function() {
  var rw = window.innerWidth || screen.width;
  var rh = window.innerHeight || screen.height;
  W = Math.max(rw, rh);
  H = Math.min(rw, rh);
  canvas.width = W;
  canvas.height = H;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  GROUND_Y = H - 60;
  var offsets = [0,-100,-165,-120,-190,-110,-170,-240,-130,-200,-110,-180];
  for (var i=0;i<platforms.length;i++) { platforms[i].y = GROUND_Y + (offsets[i]||0); }
  platforms[0].w = W * 10;
  player.y = GROUND_Y - player.h;
});

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('start-btn').addEventListener('touchstart', function(e) { e.preventDefault(); startGame(); }, { passive: false });
document.getElementById('respawn-btn').addEventListener('click', respawn);
document.getElementById('respawn-btn').addEventListener('touchstart', function(e) { e.preventDefault(); respawn(); }, { passive: false });

setupTouchControls();
// Fire resize after orientation lock settles on mobile
setTimeout(function() { window.dispatchEvent(new Event('resize')); }, 300);
setTimeout(function() { window.dispatchEvent(new Event('resize')); }, 800);
requestAnimationFrame(gameLoop);
</script>
</body>
</html>
`;
}
