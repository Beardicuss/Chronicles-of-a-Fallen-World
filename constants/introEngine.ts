export function createIntroHTML(assetUrls: Record<string, string>): string {
  return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; background: #000; touch-action: none; -webkit-touch-callout: none; -webkit-user-select: none; user-select: none; }
#game-root { position: fixed; top: 0; left: 0; transform-origin: top left; }
canvas { display: block; position: absolute; top: 0; left: 0; }
#narrative-overlay {
  position: absolute; inset: 0; z-index: 30; pointer-events: none;
  display: flex; align-items: center; justify-content: center;
}
#narrative-text {
  color: rgba(200,180,160,0); font-size: 26px; font-family: Georgia, serif;
  letter-spacing: 2px; text-align: center; max-width: 80%;
  line-height: 1.8; font-style: italic;
  text-shadow: 0 0 20px rgba(107,10,24,0.3);
  transition: color 2.5s ease;
}
#narrative-text.visible { color: rgba(200,180,160,0.85); }
#narrative-text.fade-out { color: rgba(200,180,160,0); }
#prompt-text {
  position: absolute; bottom: 22%; left: 50%; transform: translateX(-50%);
  color: rgba(200,160,80,0); font-size: 11px; font-family: Georgia, serif;
  letter-spacing: 4px; text-transform: uppercase; z-index: 30;
  pointer-events: none; transition: color 0.8s ease;
  text-shadow: 0 0 12px rgba(200,160,80,0.3);
}
#prompt-text.visible { color: rgba(200,160,80,0.7); animation: promptPulse 2s ease-in-out infinite; }
#prompt-text.fade-out { color: rgba(200,160,80,0); }
@keyframes promptPulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
#hud-intro {
  position: absolute; top: 0; left: 0; right: 0; padding: 10px 14px;
  z-index: 20; pointer-events: none; opacity: 0; transition: opacity 1s ease;
  background: linear-gradient(180deg, rgba(3,3,6,0.7) 0%, rgba(3,3,6,0) 100%);
}
#hud-intro.visible { opacity: 1; }
.bar-row { display: flex; align-items: center; margin-bottom: 5px; }
.bar-icon { width: 16px; height: 16px; margin-right: 8px; border-radius: 2px; border: 1px solid rgba(255,255,255,0.06); }
.bar-container {
  width: 130px; height: 8px; background: rgba(10,5,5,0.9);
  border: 1px solid rgba(80,40,30,0.25); border-radius: 1px;
  overflow: hidden; position: relative;
}
.bar-fill { height: 100%; transition: width 0.3s ease; position: relative; }
.health-fill { background: linear-gradient(90deg, #4a0a12, #8b1a2a, #b02040); }
.stamina-fill { background: linear-gradient(90deg, #0a3a1a, #1a6a3a, #2a8a4a); }
.bar-label {
  color: rgba(180,140,120,0.35); font-size: 8px; font-family: Georgia, serif;
  letter-spacing: 2px; margin-left: 8px; text-transform: uppercase;
}
#touch-controls-intro {
  position: absolute; bottom: 0; left: 0; right: 0; height: 48%; pointer-events: none; z-index: 10;
  opacity: 0; transition: opacity 0.8s ease;
}
#touch-controls-intro.visible { pointer-events: auto; opacity: 1; }
.dpad {
  position: absolute; bottom: 24px; left: 16px; width: 140px; height: 140px;
}
.dpad-btn {
  position: absolute; width: 56px; height: 56px; border-radius: 12px;
  background: rgba(20,12,8,0.6); border: 1.5px solid rgba(120,60,40,0.2);
  display: flex; align-items: center; justify-content: center;
  color: rgba(180,120,80,0.35); font-size: 18px;
  touch-action: manipulation; -webkit-tap-highlight-color: transparent;
  box-shadow: inset 0 0 12px rgba(0,0,0,0.4);
}
.dpad-btn.active { background: rgba(120,50,30,0.35); border-color: rgba(180,80,50,0.45); color: rgba(220,150,100,0.6); }
.dpad-left { left: 0; top: 43px; }
.dpad-right { right: 0; top: 43px; }
.action-buttons-intro {
  position: absolute; bottom: 24px; right: 16px; width: 178px; height: 178px;
}
.action-btn-intro {
  position: absolute; width: 58px; height: 58px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 8px; font-weight: 700; letter-spacing: 0.5px;
  touch-action: manipulation; text-transform: uppercase;
  -webkit-tap-highlight-color: transparent;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.3);
}
.btn-examine {
  background: rgba(120,80,20,0.2); border: 2px solid rgba(180,130,50,0.35);
  color: rgba(200,160,70,0.7); left: 58px; top: 58px;
}
.btn-examine.active { background: rgba(180,130,50,0.4); }
#flash-overlay {
  position: absolute; inset: 0; z-index: 50; pointer-events: none;
  background: rgba(107,10,24,0); transition: background 0.1s ease;
}
#flash-overlay.flash { background: rgba(107,10,24,0.3); }
#flash-overlay.white-flash { background: rgba(255,220,180,0.15); }
</style>
</head>
<body>
<div id="game-root">

<div id="narrative-overlay">
  <div id="narrative-text"></div>
</div>
<div id="prompt-text"></div>
<div id="flash-overlay"></div>

<div id="hud-intro">
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

<div id="touch-controls-intro">
  <div class="dpad">
    <div class="dpad-btn dpad-left" id="btn-left">&#9664;</div>
    <div class="dpad-btn dpad-right" id="btn-right">&#9654;</div>
  </div>
  <div class="action-buttons-intro">
    <div class="action-btn-intro btn-examine" id="btn-examine">Examine</div>
  </div>
</div>

<script>
window.onerror = function(message, source, lineno, colno, error) {
  var errData = {
    type: 'ERROR',
    message: message,
    line: lineno,
    col: colno,
    stack: error ? error.stack : ''
  };
  try {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(errData));
    }
  } catch(e) {}
};

// ─── FIX: Use screen dimensions for mobile, fallback to window ───────────────
var W = 800;
var H = 450;

var canvas = document.createElement('canvas');
canvas.width  = W;
canvas.height = H;
canvas.style.position = 'absolute';
canvas.style.top  = '0';
canvas.style.left = '0';
document.getElementById('game-root').insertBefore(canvas, document.getElementById('game-root').firstChild);
var ctx = canvas.getContext('2d');

var gameRoot = document.getElementById('game-root');

function reinitCanvas() {
  var ww = window.innerWidth  || document.documentElement.clientWidth  || screen.height;
  var wh = window.innerHeight || document.documentElement.clientHeight || screen.width;
  var sw = screen.width  || ww;
  var sh = screen.height || wh;
  var allW = Math.max(ww, wh, sw, sh);
  var allH = Math.min(ww, wh, sw, sh);
  W = allW;
  H = allH;
  canvas.width        = W;
  canvas.height       = H;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  gameRoot.style.width  = W + 'px';
  gameRoot.style.height = H + 'px';
  GROUND_Y   = Math.round(H * 0.83);
  ROOM_LEFT  = W * 0.1;
  ROOM_RIGHT = W * 1.0;
  COFFIN_X   = Math.round(W * 0.1);
  DOOR_X     = ROOM_RIGHT - 300;
  PLAYER_H   = Math.round(52 * PLAYER_SCALE);
  PLAYER_W   = Math.round(24 * PLAYER_SCALE);
  if (typeof player !== 'undefined' && player) {
    player.y = GROUND_Y - PLAYER_H;
    player.w = PLAYER_W;
    player.h = PLAYER_H;
  }
  if (typeof mistParticles !== 'undefined') {
    for (var mi = 0; mi < mistParticles.length; mi++) {
      mistParticles[mi].y = GROUND_Y - 20 + Math.random() * 60;
    }
  }
}
setTimeout(reinitCanvas, 100);
setTimeout(reinitCanvas, 400);

var IMG = { rise: [], walk: [], idle: [], idle2: [] };
var ASSET_URLS = JSON.parse('${JSON.stringify(assetUrls).replace(/'/g, "\\'")}');
var assetsLoaded = 0;
var assetsTotal  = 0;

function loadImg(key, url) {
  if (!url) return;
  assetsTotal++;
  var img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload  = function() { assetsLoaded++; };
  img.onerror = function() { assetsLoaded++; };
  img.src = url;
  if (key.startsWith('rise_') || key.startsWith('walk_') || key.startsWith('idle_') || key.startsWith('idle2_')) {
    var parts = key.split('_');
    // handle idle2_ prefix (3 parts)
    var group, idx;
    if (parts[0] === 'idle' && parts[1] === '2') {
      group = 'idle2'; idx = parseInt(parts[2], 10);
    } else {
      group = parts[0]; idx = parseInt(parts[1], 10);
    }
    if (!IMG[group]) IMG[group] = [];
    IMG[group][idx] = img;
  } else {
    IMG[key] = img;
  }
}

function imgReady(key) {
  if (key === 'rise' || key === 'walk' || key === 'idle' || key === 'idle2') {
    var arr = IMG[key];
    if (!arr || arr.length === 0) return false;
    var f = arr[0];
    return f && f.complete && f.naturalWidth > 0;
  }
  var i = IMG[key];
  return i && i.complete && i.naturalWidth > 0;
}

loadImg('cryptBg',   ASSET_URLS.cryptBg);
loadImg('coffin',    ASSET_URLS.coffin);
loadImg('stoneDoor', ASSET_URLS.stoneDoor);
loadImg('player',    ASSET_URLS.player);

for (var i = 0; i < 25; i++) loadImg('rise_'  + i, ASSET_URLS['rise_'  + i]);
for (var i = 0; i < 25; i++) loadImg('walk_'  + i, ASSET_URLS['walk_'  + i]);
for (var i = 0; i < 25; i++) loadImg('idle_'  + i, ASSET_URLS['idle_'  + i]);
for (var i = 0; i < 16; i++) loadImg('idle2_' + i, ASSET_URLS['idle2_' + i]);

var GROUND_OFFSET = 3;
var GROUND_Y   = Math.round(H * 0.83);
var ROOM_LEFT  = W * 0.1;
var ROOM_RIGHT = W * 1.0;
var COFFIN_X   = Math.round(W * 0.1);
var DOOR_X     = ROOM_RIGHT - 300;

var PLAYER_SCALE  = 3.5;
var COFFIN_SCALE  = 10;

var PHASES = {
  LOADING: 'LOADING', BLACK_SCREEN: 'BLACK_SCREEN', WAKE_UP: 'WAKE_UP',
  THE_MARK: 'THE_MARK', PLAYER_CONTROL: 'PLAYER_CONTROL',
  THE_DRIVE: 'THE_DRIVE', TRANSITION_OUT: 'TRANSITION_OUT',
};

var phase      = PHASES.LOADING;
var phaseTimer = 0;
var frameCount = 0;
var globalFade = 0;
var cameraX    = 0;
var shakeAmount = 0;
var shakeTimer  = 0;

var wakeUpProgress  = 0;
var markRevealed    = false;
var healthShown     = false;
var playerHealth    = 100;
var playerMaxHealth = 100;
var controlsEnabled = false;
var heavyWalk       = true;
var driveTextShown  = false;
var driveTextDone   = false;
var introComplete   = false;
var doorReached     = false;

var flashbacks = [
  { time: 30, duration: 8,  type: 'steel'  },
  { time: 55, duration: 6,  type: 'scream' },
  { time: 80, duration: 10, type: 'fire'   },
];

var heartbeatTimer = 0;
var heartbeatPhase = 0;

var PLAYER_H = Math.round(52 * PLAYER_SCALE);
var PLAYER_W = Math.round(24 * PLAYER_SCALE);

var player = {
  x: COFFIN_X + 60,
  y: GROUND_Y - PLAYER_H,
  w: PLAYER_W, h: PLAYER_H,
  vx: 0, vy: 0,
  facing: 1, grounded: true,
  speed: 1.2,
  breathe: 0,
  animCycle: 0,
  legAnim: 0,
  visible: false,
  sitting: true,
  standing: false,
  standProgress: 0,
  hasWalkedYet: false,
  wasStanding: false,
  idleVariation: 'idle',
};

var keys = { left: false, right: false, examine: false };

var bgTorchPositions = [
  { nx: 0.145, ny: 0.42, size: 1.0 },
  { nx: 0.22,  ny: 0.42, size: 0.9 },
  { nx: 0.415, ny: 0.44, size: 0.85 },
  { nx: 0.58,  ny: 0.42, size: 0.95 },
  { nx: 0.655, ny: 0.42, size: 1.0 },
  { nx: 0.85,  ny: 0.42, size: 0.9 },
  { nx: 0.96,  ny: 0.45, size: 0.7 },
];
var torchAnims = [];
for (var ti = 0; ti < bgTorchPositions.length; ti++) {
  torchAnims.push({ flicker: Math.random() * Math.PI * 2, intensity: 0.7 + Math.random() * 0.3 });
}

var mistParticles = [];
for (var mi = 0; mi < 30; mi++) {
  mistParticles.push({
    x: Math.random() * W * 3,
    y: GROUND_Y - 20 + Math.random() * 60,
    w: 120 + Math.random() * 250,
    h: 25 + Math.random() * 40,
    speed: 0.15 + Math.random() * 0.35,
    alpha: 0.06 + Math.random() * 0.12,
    phase: Math.random() * Math.PI * 2,
  });
}

var chestMarkPulse   = 0;
var markGlowIntensity = 0;

function screenShake(amount, duration) {
  shakeAmount = Math.max(shakeAmount, amount);
  shakeTimer  = Math.max(shakeTimer, duration);
}

function setPhase(newPhase) { phase = newPhase; phaseTimer = 0; }

function showNarrative(text) {
  var el = document.getElementById('narrative-text');
  el.textContent = text; el.className = '';
  void el.offsetWidth; el.className = 'visible';
}
function hideNarrative() { document.getElementById('narrative-text').className = 'fade-out'; }
function showPrompt(text) {
  var el = document.getElementById('prompt-text');
  el.textContent = text; el.className = 'visible';
}
function hidePrompt() { document.getElementById('prompt-text').className = 'fade-out'; }
function flash(type) {
  var el = document.getElementById('flash-overlay');
  el.className = type || 'flash';
  setTimeout(function() { el.className = ''; }, 120);
}

function setupControls() {
  function addTouch(id, key) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('touchstart',  function(e) { e.preventDefault(); keys[key] = true;  el.classList.add('active');    }, { passive: false });
    el.addEventListener('touchend',    function(e) { e.preventDefault(); keys[key] = false; el.classList.remove('active'); }, { passive: false });
    el.addEventListener('touchcancel', function()  { keys[key] = false;  el.classList.remove('active'); });
    el.addEventListener('mousedown',   function()  { keys[key] = true;   el.classList.add('active');    });
    el.addEventListener('mouseup',     function()  { keys[key] = false;  el.classList.remove('active'); });
    el.addEventListener('mouseleave',  function()  { keys[key] = false;  el.classList.remove('active'); });
  }
  addTouch('btn-left',    'left');
  addTouch('btn-right',   'right');
  addTouch('btn-examine', 'examine');
}

document.addEventListener('keydown', function(e) {
  if (e.repeat) return;
  if (e.key === 'ArrowLeft'  || e.key === 'a') keys.left    = true;
  if (e.key === 'ArrowRight' || e.key === 'd') keys.right   = true;
  if (e.key === 'z' || e.key === ' ')          keys.examine = true;
});
document.addEventListener('keyup', function(e) {
  if (e.key === 'ArrowLeft'  || e.key === 'a') keys.left    = false;
  if (e.key === 'ArrowRight' || e.key === 'd') keys.right   = false;
  if (e.key === 'z' || e.key === ' ')          keys.examine = false;
});

canvas.addEventListener('touchstart', function(e) {
  if (phase === PHASES.BLACK_SCREEN || phase === PHASES.LOADING) return;
  if (phase === PHASES.THE_MARK && !markRevealed) keys.examine = true;
}, { passive: true });
canvas.addEventListener('click', function() {
  if (phase === PHASES.THE_MARK && !markRevealed) keys.examine = true;
});

// ─────────────────────────────────────────────────────────────────────────────
// DRAW FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

function drawCryptBackground() {
  ctx.fillStyle = '#050408';
  ctx.fillRect(0, 0, W, H);
  if (imgReady('cryptBg')) {
    var bgImg = IMG.cryptBg;
    var bgH   = H;
    var bgW   = Math.round(bgH * (bgImg.naturalWidth / bgImg.naturalHeight));
    if (bgW < W) bgW = W;
    var parallax = 0.08;
    var bgX = -(cameraX * parallax);
    ctx.globalAlpha = 0.95 * globalFade;
    for (var bx = bgX - bgW; bx < W + bgW; bx += bgW) {
      ctx.drawImage(bgImg, bx, 0, bgW, bgH);
    }
    ctx.globalAlpha = 1;
  }
  ctx.globalAlpha = 1;
}

function drawTorchGlows() {
  if (!imgReady('cryptBg')) return;
  var bgImg = IMG.cryptBg;
  var bgH   = H;
  var bgW   = Math.round(bgH * (bgImg.naturalWidth / bgImg.naturalHeight));
  if (bgW < W) bgW = W;
  var bgX   = -(cameraX * 0.08);
  ctx.globalAlpha = globalFade;
  for (var ti = 0; ti < bgTorchPositions.length; ti++) {
    var tp   = bgTorchPositions[ti];
    var anim = torchAnims[ti];
    anim.flicker += 0.07 + Math.random() * 0.04;
    var flick = 0.6 + Math.sin(anim.flicker) * 0.18
              + Math.sin(anim.flicker * 2.3) * 0.1
              + Math.sin(anim.flicker * 4.7) * 0.06
              + Math.random() * 0.06;
    var intensity = anim.intensity * flick;
    for (var bx = bgX - bgW; bx < W + bgW; bx += bgW) {
      var tx = bx + tp.nx * bgW;
      var ty = tp.ny * bgH;
      if (tx < -100 || tx > W + 100) continue;
      var glowSize = 35 * tp.size * (0.9 + flick * 0.1);
      var fGrd = ctx.createRadialGradient(tx, ty - 3, 0, tx, ty, glowSize);
      fGrd.addColorStop(0,   'rgba(255,210,100,' + (intensity * 0.45) + ')');
      fGrd.addColorStop(0.25,'rgba(255,150,50,'  + (intensity * 0.3)  + ')');
      fGrd.addColorStop(0.5, 'rgba(200,80,20,'   + (intensity * 0.15) + ')');
      fGrd.addColorStop(0.8, 'rgba(120,30,5,'    + (intensity * 0.06) + ')');
      fGrd.addColorStop(1,   'rgba(60,10,0,0)');
      ctx.fillStyle = fGrd;
      ctx.beginPath();
      ctx.ellipse(tx, ty - 2, glowSize * 0.6, glowSize * 1.1, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

function drawFloorMist() {
  ctx.globalAlpha = globalFade;
  for (var mi = 0; mi < mistParticles.length; mi++) {
    var m = mistParticles[mi];
    m.x     += m.speed;
    m.phase += 0.008;
    var screenX = m.x - cameraX * 0.15;
    if (screenX > W + m.w) m.x -= W * 3;
    if (screenX < -m.w * 2) m.x += W * 3;
    screenX = m.x - cameraX * 0.15;
    if (screenX < -m.w || screenX > W + m.w) continue;
    var yOff    = Math.sin(m.phase) * 8;
    var drawY   = m.y + yOff;
    var breathe = 0.6 + Math.sin(m.phase * 1.3 + mi) * 0.4;
    var alpha   = m.alpha * breathe;
    var mGrd = ctx.createRadialGradient(
      screenX + m.w / 2, drawY + m.h / 2, 0,
      screenX + m.w / 2, drawY + m.h / 2, m.w * 0.55
    );
    mGrd.addColorStop(0,   'rgba(160,165,175,' + alpha + ')');
    mGrd.addColorStop(0.4, 'rgba(120,125,135,' + (alpha * 0.6) + ')');
    mGrd.addColorStop(0.7, 'rgba(80,85,95,'    + (alpha * 0.3) + ')');
    mGrd.addColorStop(1,   'rgba(40,42,50,0)');
    ctx.fillStyle = mGrd;
    ctx.beginPath();
    ctx.ellipse(screenX + m.w / 2, drawY + m.h / 2, m.w / 2, m.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawCoffin() {
  var cx = COFFIN_X - cameraX * 0.08;
  if (cx < -400 || cx > W + 400) return;
  ctx.globalAlpha = globalFade;
  if (imgReady('coffin')) {
    var cImg = IMG.coffin;
    var cH   = Math.round(PLAYER_H * 1.2);
    var cW   = Math.round(cH * (cImg.naturalWidth / cImg.naturalHeight));
    ctx.drawImage(cImg, cx - cW / 2, GROUND_Y - cH + 8, cW, cH);
  } else {
    var cW2 = Math.round(100 * COFFIN_SCALE);
    var cH2 = Math.round(28  * COFFIN_SCALE);
    ctx.fillStyle = '#1a1614';
    ctx.fillRect(cx - cW2 / 2, GROUND_Y - cH2, cW2, cH2);
  }
  ctx.globalAlpha = 1;
}

function drawStoneDoor() {
  var dx = DOOR_X - cameraX;
  if (dx < -250 || dx > W + 250) return;
  if (controlsEnabled && !doorReached) {
    var glowPulse = 0.12 + Math.sin(frameCount * 0.025) * 0.06;
    var doorGlow  = ctx.createRadialGradient(dx + 60, GROUND_Y - 100, 0, dx + 60, GROUND_Y - 100, 120);
    doorGlow.addColorStop(0,   'rgba(140,90,40,' + glowPulse + ')');
    doorGlow.addColorStop(0.5, 'rgba(100,50,20,' + (glowPulse * 0.4) + ')');
    doorGlow.addColorStop(1,   'rgba(60,30,10,0)');
    ctx.fillStyle = doorGlow;
    ctx.fillRect(dx - 70, GROUND_Y - 230, 260, 280);
  }
  ctx.globalAlpha = 1;
}

function drawPlayerIntro() {
  if (!player.visible) return;

  var px = player.x - cameraX;
  var py = player.y;
  var cx = px + player.w / 2;
  var by = py + player.h;

  ctx.globalAlpha = globalFade;

  if (player.sitting) {
    ctx.save();
    ctx.translate(cx, by);
    ctx.scale(player.facing, 1);

    var sprH = Math.round(90 * PLAYER_SCALE);
    var sprW = Math.round(52 * PLAYER_SCALE);

    if (imgReady('rise')) {
      var frameIdx = Math.floor(wakeUpProgress * (IMG.rise.length - 1));
      var img      = IMG.rise[frameIdx];
      if (img && img.complete && img.naturalWidth > 0) {
        sprW = Math.round(sprH * (img.naturalWidth / img.naturalHeight));
        ctx.drawImage(img, -sprW / 2, -sprH, sprW, sprH);
      }
    } else if (imgReady('player')) {
      var sitH   = Math.round(PLAYER_H * (0.5 + wakeUpProgress * 0.5));
      var sitW   = Math.round(PLAYER_W * 1.6);
      var sitLean = (1 - wakeUpProgress) * 0.25;
      ctx.rotate(-sitLean);
      ctx.drawImage(IMG.player, -sitW / 2, -sitH, sitW, sitH);
    } else {
      ctx.fillStyle = '#1a1220';
      var rh = Math.round(PLAYER_H * (0.4 + wakeUpProgress * 0.6));
      ctx.fillRect(-PLAYER_W / 2, -rh, PLAYER_W, rh);
    }

    // ── Chest mark while sitting (FIX: 0.62 = mid-chest) ──
    if (markRevealed) {
      chestMarkPulse += 0.04;
      var mp = 0.3 + Math.sin(chestMarkPulse) * 0.2;
      var sprH2 = Math.round(90 * PLAYER_SCALE);
      ctx.fillStyle = 'rgba(180,30,30,' + mp + ')';
      ctx.beginPath();
      ctx.arc(0, -Math.round(sprH2 * 0.62), 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(180,30,30,' + (mp * 0.15) + ')';
      ctx.beginPath();
      ctx.arc(0, -Math.round(sprH2 * 0.62), 18, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  } else {
    // ── Standing player ──
    var bob   = Math.sin(player.breathe) * 1;
    var sprH3 = Math.round(90 * PLAYER_SCALE);
    var sprW3 = Math.round(52 * PLAYER_SCALE);

    // Shadow
    var shadowGrd = ctx.createRadialGradient(cx, by + 3, 0, cx, by + 3, 30);
    shadowGrd.addColorStop(0, 'rgba(0,0,0,0.3)');
    shadowGrd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = shadowGrd;
    ctx.beginPath();
    ctx.ellipse(cx, by + 3, 24, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(cx, by);
    ctx.scale(player.facing, 1);

    var lean    = 0;
    var drawImg = IMG.player;

    if (Math.abs(player.vx) > 0.3) {
      lean = 0.03;
      player.wasStanding = false;
      player.legAnim    += heavyWalk ? 0.07 : 0.126;
      if (imgReady('walk')) {
        drawImg = IMG.walk[Math.floor(player.legAnim * 1.75) % IMG.walk.length] || drawImg;
      }
    } else {
      player.legAnim *= 0.9;
      if (!player.wasStanding) {
        player.idleVariation = Math.random() < 0.5 ? 'idle' : 'idle2';
      }
      player.wasStanding = true;
      if (!player.idleVariation) player.idleVariation = 'idle';

      if (imgReady('rise') && markRevealed && !player.hasWalkedYet) {
        drawImg = IMG.rise[IMG.rise.length - 1] || drawImg;
      } else if (imgReady(player.idleVariation) && markRevealed) {
        var vArr = IMG[player.idleVariation];
        drawImg  = vArr[Math.floor(frameCount * 0.035) % vArr.length] || drawImg;
      }
    }
    ctx.rotate(lean);

    if (drawImg && drawImg.naturalWidth > 0 && drawImg.naturalHeight > 0) {
      sprW3 = Math.round(sprH3 * (drawImg.naturalWidth / drawImg.naturalHeight));
    }
    if (drawImg && drawImg.complete && drawImg.naturalWidth > 0) {
      ctx.drawImage(drawImg, -sprW3 / 2, -sprH3 + bob, sprW3, sprH3);
    } else {
      ctx.fillStyle = '#1a1220';
      ctx.fillRect(-PLAYER_W / 2, -PLAYER_H, PLAYER_W, PLAYER_H);
    }

    // ── Eye glow ──
    var eyePulse = 0.3 + Math.sin(frameCount * 0.04) * 0.15;
    ctx.fillStyle = 'rgba(180,20,20,' + eyePulse + ')';
    ctx.beginPath(); ctx.arc(3, Math.round(-sprH3 * 0.88) + bob, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(180,20,20,' + (eyePulse * 0.15) + ')';
    ctx.beginPath(); ctx.arc(3, Math.round(-sprH3 * 0.88) + bob, 9, 0, Math.PI * 2); ctx.fill();

    // ── Chest mark on standing player (FIX: 0.62 = mid-chest on sprite) ──
    chestMarkPulse += 0.04;
    var mp2 = 0.25 + Math.sin(chestMarkPulse) * 0.18;
    ctx.fillStyle = 'rgba(180,30,30,' + mp2 + ')';
    ctx.beginPath(); ctx.arc(0, Math.round(-sprH3 * 0.62) + bob, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(180,30,30,' + (mp2 * 0.1) + ')';
    ctx.beginPath(); ctx.arc(0, Math.round(-sprH3 * 0.62) + bob, 16, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
  }

  ctx.globalAlpha = 1;
}

function drawHeartbeat() {
  if (phase !== PHASES.BLACK_SCREEN && phase !== PHASES.WAKE_UP) return;
  if (heartbeatPhase === 0) return;
  var pulse = Math.sin(heartbeatTimer * 0.15) * 0.5 + 0.5;
  if (pulse > 0.01) {
    var hGrd = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.6);
    hGrd.addColorStop(0, 'rgba(60,8,12,'  + (pulse * 0.1)  + ')');
    hGrd.addColorStop(0.5, 'rgba(30,4,6,' + (pulse * 0.04) + ')');
    hGrd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = hGrd;
    ctx.fillRect(0, 0, W, H);
  }
}

function drawChestGlow() {
  if (!markRevealed || phase === PHASES.BLACK_SCREEN) return;
  var px        = player.x - cameraX + player.w / 2;
  var py        = player.y + player.h * 0.4;
  var intensity = 0.05 + Math.sin(chestMarkPulse) * 0.025;
  var cGlow     = ctx.createRadialGradient(px, py, 0, px, py, 130);
  cGlow.addColorStop(0,   'rgba(140,18,25,' + (intensity * globalFade)        + ')');
  cGlow.addColorStop(0.5, 'rgba(70,10,14,'  + (intensity * 0.3 * globalFade) + ')');
  cGlow.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.fillStyle = cGlow;
  ctx.fillRect(px - 130, py - 130, 260, 260);

  var grd = ctx.createRadialGradient(W / 2, H / 2, W * 0.1, W / 2, H / 2, W * 0.7);
  grd.addColorStop(0,   'rgba(0,0,0,0)');
  grd.addColorStop(0.4, 'rgba(0,0,0,0.1)');
  grd.addColorStop(0.7, 'rgba(0,0,0,0.35)');
  grd.addColorStop(1,   'rgba(0,0,0,0.65)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);
}

function updateCamera() {
  if (!controlsEnabled) return;
  var targetX = player.x - W * 0.35;
  targetX     = Math.max(0, Math.min(targetX, ROOM_RIGHT - W));
  cameraX    += (targetX - cameraX) * 0.04;
}

function updateHUD() {
  if (!healthShown) return;
  var hp = Math.max(0, Math.round(playerHealth));
  document.getElementById('health-bar').style.width = (playerHealth / playerMaxHealth * 100) + '%';
  document.getElementById('health-text').textContent = hp;
}

function updatePhase() {
  phaseTimer++;

  switch (phase) {
    case PHASES.LOADING:
      if (assetsLoaded >= assetsTotal || phaseTimer > 180) {
        setPhase(PHASES.BLACK_SCREEN);
      }
      break;

    case PHASES.BLACK_SCREEN:
      for (var fi = 0; fi < flashbacks.length; fi++) {
        var fb = flashbacks[fi];
        if (phaseTimer === fb.time) {
          if (fb.type === 'steel') flash('white-flash');
          else if (fb.type === 'scream') flash('flash');
          else if (fb.type === 'fire') { flash('flash'); screenShake(4, 8); }
        }
      }
      if (phaseTimer > 110) { heartbeatPhase = 1; heartbeatTimer++; }
      if (phaseTimer > 150) globalFade = Math.min(1, (phaseTimer - 150) / 180);
      if (phaseTimer > 360) {
        setPhase(PHASES.WAKE_UP);
        player.visible = true;
        player.sitting = true;
      }
      break;

    case PHASES.WAKE_UP:
      heartbeatTimer++;
      if (phaseTimer >= 60 && phaseTimer < 360) {
        wakeUpProgress = Math.min(1, (phaseTimer - 60) / 300);
      }
      if (phaseTimer === 60) showNarrative('Fingers trembling... as if feeling flesh for the first time.');
      if (phaseTimer > 400) hideNarrative();
      if (phaseTimer > 240) {
        setPhase(PHASES.THE_MARK);
        showPrompt("Tap 'Examine' or press Z");
      }
      break;

    case PHASES.THE_MARK:
      heartbeatTimer++;
      if (keys.examine && !markRevealed) {
        keys.examine  = false;
        markRevealed  = true;
        hidePrompt();
        showNarrative('A dark, ancient mark... burned into the chest. Pulsing.');
        screenShake(8, 15);
        flash('flash');
        playerHealth = 99;
        healthShown  = true;
        document.getElementById('hud-intro').classList.add('visible');
        setTimeout(function() {
          hideNarrative();
          setTimeout(function() {
            player.sitting  = false;
            player.standing = true;
            player.standProgress = 0;
            controlsEnabled = true;
            heavyWalk       = true;
            document.getElementById('touch-controls-intro').classList.add('visible');
            setPhase(PHASES.PLAYER_CONTROL);
            showNarrative('Muscles remembering how to be alive...');
            setTimeout(function() { hideNarrative(); }, 3000);
          }, 1500);
        }, 3000);
      }
      break;

    case PHASES.PLAYER_CONTROL:
      player.y       = GROUND_Y - PLAYER_H + GROUND_OFFSET;
      player.breathe += 0.025;
      player.animCycle += 0.1;
      if (controlsEnabled) {
        var moveX = 0;
        if (keys.left)  { moveX = -1; player.facing = -1; }
        if (keys.right) { moveX =  1; player.facing =  1; }
        var spd  = heavyWalk ? player.speed * 0.85 : player.speed;
        player.vx = moveX * spd;
        player.x += player.vx;
        if (Math.abs(player.vx) > 0) player.hasWalkedYet = true;
        player.x = Math.max(ROOM_LEFT, Math.min(player.x, ROOM_RIGHT - player.w - 40));
        updateCamera();
      }
      if (player.x > DOOR_X - 100 && !driveTextShown) {
        driveTextShown  = true;
        doorReached     = true;
        player.vx       = 0;
        controlsEnabled = false;
        document.getElementById('touch-controls-intro').classList.remove('visible');
        setPhase(PHASES.THE_DRIVE);
      }
      break;

    case PHASES.THE_DRIVE:
      if (phaseTimer === 1) {
        showNarrative('I do not know who I am. But I know this... I did not return to suffer. I returned to rule.');
      }
      if (phaseTimer > 200) hideNarrative();
      if (phaseTimer > 260) {
        heavyWalk     = false;
        driveTextDone = true;
        showNarrative('The Architect awakens.');
        screenShake(3, 6);
      }
      if (phaseTimer > 380) {
        hideNarrative();
        setPhase(PHASES.TRANSITION_OUT);
      }
      break;

    case PHASES.TRANSITION_OUT:
      globalFade = Math.max(0, 1 - phaseTimer / 90);
      if (phaseTimer > 100 && !introComplete) {
        introComplete = true;
        try {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'INTRO_COMPLETE' }));
          } else {
            window.parent.postMessage(JSON.stringify({ type: 'INTRO_COMPLETE' }), '*');
          }
        } catch(e) {}
      }
      break;
  }
}

function gameLoop() {
  frameCount++;
  if (shakeTimer > 0) { shakeTimer--; shakeAmount *= 0.85; }
  updatePhase();

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  if (shakeTimer > 0) {
    ctx.save();
    ctx.translate(
      (Math.random() - 0.5) * shakeAmount * 2,
      (Math.random() - 0.5) * shakeAmount * 2
    );
  }

  if (globalFade > 0.01) {
    drawCryptBackground();
    drawTorchGlows();
    drawFloorMist();
    drawCoffin();
    drawStoneDoor();
    drawPlayerIntro();
    drawChestGlow();
  }

  drawHeartbeat();

  if (shakeTimer > 0) ctx.restore();
  if (healthShown) updateHUD();

  requestAnimationFrame(gameLoop);
}

// ─── RESIZE: recalculate everything on orientation change ────────────────────
window.addEventListener('resize', function() {
  reinitCanvas();
});

setupControls();
reinitCanvas(); // re-read dimensions now that everything is declared
requestAnimationFrame(gameLoop);
</script>
</div><!-- #game-root -->
</body>
</html>
`;
}
