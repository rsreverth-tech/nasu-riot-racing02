(() => {
  'use strict';

  const canvas = document.querySelector('#game');
  const ctx = canvas.getContext('2d', { alpha: false });
  const speedEl = document.querySelector('#speed');
  const distanceEl = document.querySelector('#distance');
  const startPanel = document.querySelector('#start');
  const startButton = document.querySelector('#start-button');
  const garageButton = document.querySelector('#garage-button');
  const garageBack = document.querySelector('#garage-back');
  const setupName = document.querySelector('#setup-name');
  const toast = document.querySelector('#toast');
  const driverCard = document.querySelector('#driver-card');
  const driverFace = document.querySelector('#driver-face');
  const driverMood = document.querySelector('#driver-mood');
  const mapCanvas = document.querySelector('#map-canvas');
  const mapCtx = mapCanvas.getContext('2d');
  const lapCount = document.querySelector('#lap-count');
  const jumpButton = document.querySelector('#jump');

  const loadImage = src => {
    const image = new Image();
    image.src = src;
    return image;
  };

  const carSprites = {
    steering: [
      'steer-hard-left.png', 'steer-left.png', 'steer-center.png',
      'steer-right.png', 'steer-hard-right.png'
    ].map(name => loadImage(`./assets/car-v2/${name}`)),
    spin: Array.from({ length: 8 }, (_, i) => loadImage(`./assets/car-v2/spin-${i}.png`)),
    jump: ['jump-up.png', 'jump-level.png', 'jump-down.png'].map(name => loadImage(`./assets/car-v2/${name}`))
  };
  const sponsorPlate = loadImage('./assets/sponsor/reverth-plate-pixel.png');

  const moods = {
    neutral: { src: './assets/driver/president-neutral-v3.png', label: 'LOCKED IN' },
    happy: { src: './assets/driver/president-happy-v4.png', label: 'HAHA! EAT DUST!' },
    angry: { src: './assets/driver/president-angry-v4.png', label: 'WHAAAT?!' }
  };

  const partEffects = {
    tire: {
      street: { topSpeed: 0, accel: 0, grip: .03, dirt: 0, jump: 0 },
      slick: { topSpeed: .03, accel: .09, grip: -.07, dirt: -.1, jump: -.02 },
      allterrain: { topSpeed: -.04, accel: -.02, grip: .01, dirt: .18, jump: .05 }
    },
    engine: {
      smallblock: { topSpeed: 0, accel: 0, grip: 0, dirt: 0, jump: 0 },
      blower: { topSpeed: .04, accel: .16, grip: -.03, dirt: 0, jump: 0 },
      bigblock: { topSpeed: .13, accel: -.05, grip: -.02, dirt: 0, jump: 0 }
    },
    gear: {
      short: { topSpeed: -.09, accel: .14, grip: .02, dirt: 0, jump: 0 },
      balanced: { topSpeed: 0, accel: 0, grip: 0, dirt: 0, jump: 0 },
      long: { topSpeed: .11, accel: -.09, grip: -.01, dirt: 0, jump: 0 }
    },
    suspension: {
      slammed: { topSpeed: .02, accel: 0, grip: .13, dirt: -.14, jump: -.13 },
      street: { topSpeed: 0, accel: 0, grip: 0, dirt: 0, jump: 0 },
      baja: { topSpeed: -.04, accel: -.02, grip: -.03, dirt: .2, jump: .19 }
    },
    diff: {
      open: { topSpeed: 0, accel: -.03, grip: .05, dirt: .03, jump: 0 },
      lsd: { topSpeed: 0, accel: .03, grip: .07, dirt: 0, jump: 0 },
      spool: { topSpeed: .04, accel: .07, grip: -.1, dirt: -.03, jump: 0 }
    }
  };
  const setup = { tire: 'street', engine: 'smallblock', gear: 'balanced', suspension: 'street', diff: 'lsd' };
  const setupStats = { topSpeed: 1, accel: 1, grip: 1, dirt: 1, jump: 1 };

  const input = { left: false, right: false, gas: false, brake: false };
  const state = {
    running: false, speed: 0, maxSpeed: 330, position: 0, distance: 0, previousDistance: 0,
    time: 0, shake: 0, steerVisual: 0, jump: 0, jumpDuration: 1.08, jumpDurationCurrent: 1.08,
    spin: 0, spinDuration: .78, spinCooldown: 0, jumpCooldown: 0, nextRamp: 420,
    speedCelebrated: false, toastTimer: 0
  };

  let currentMood = 'neutral';
  let moodTimer = 0;
  let w = 0;
  let h = 0;
  let dpr = 1;
  let last = performance.now();
  let audioContext = null;
  let engineOsc = null;
  let enginePulse = null;
  let engineGain = null;

  function getBuildName() {
    if (setup.suspension === 'baja' && setup.tire === 'allterrain') return 'DIRT DEVIL';
    if (setup.engine === 'blower' && setup.tire === 'slick') return 'BLOWN BANDIT';
    if (setup.engine === 'bigblock' && setup.gear === 'long') return 'HIGHWAY HAMMER';
    if (setup.diff === 'spool' && setup.gear === 'short') return 'STOPLIGHT BRUISER';
    if (setup.suspension === 'slammed') return 'LOW ROAD MENACE';
    return 'STREET BRAWLER';
  }

  function updateSetup() {
    Object.keys(setupStats).forEach(stat => { setupStats[stat] = 1; });
    Object.entries(setup).forEach(([group, choice]) => {
      const effects = partEffects[group][choice];
      Object.entries(effects).forEach(([stat, value]) => { setupStats[stat] += value; });
    });
    const barIds = { topSpeed: 'stat-speed', accel: 'stat-accel', grip: 'stat-grip', dirt: 'stat-dirt', jump: 'stat-jump' };
    Object.entries(barIds).forEach(([stat, id]) => {
      const percent = Math.max(12, Math.min(100, 50 + (setupStats[stat] - 1) * 210));
      document.querySelector(`#${id}`).style.width = `${percent}%`;
    });
    setupName.textContent = getBuildName();
    state.maxSpeed = Math.round(330 * setupStats.topSpeed);
    try { localStorage.setItem('nasuRiotSetup', JSON.stringify(setup)); } catch (_) {}
  }

  try {
    const savedSetup = JSON.parse(localStorage.getItem('nasuRiotSetup') || 'null');
    if (savedSetup) Object.keys(setup).forEach(group => {
      if (partEffects[group]?.[savedSetup[group]]) setup[group] = savedSetup[group];
    });
  } catch (_) {}

  document.querySelectorAll('.setup-group').forEach(groupEl => {
    const group = groupEl.dataset.group;
    groupEl.querySelectorAll('button').forEach(button => {
      button.classList.toggle('selected', button.dataset.choice === setup[group]);
      button.addEventListener('click', () => {
        setup[group] = button.dataset.choice;
        groupEl.querySelectorAll('button').forEach(item => item.classList.toggle('selected', item === button));
        updateSetup();
      });
    });
  });
  updateSetup();

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
  }

  addEventListener('resize', resize, { passive: true });
  resize();

  function bindButton(id, key) {
    const button = document.querySelector(id);
    const press = event => {
      event.preventDefault();
      input[key] = true;
      button.classList.add('active');
    };
    const release = event => {
      event.preventDefault();
      input[key] = false;
      button.classList.remove('active');
    };
    button.addEventListener('pointerdown', press);
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('pointerleave', release);
  }

  bindButton('#left', 'left');
  bindButton('#right', 'right');
  bindButton('#gas', 'gas');
  bindButton('#brake', 'brake');

  function requestJump() {
    if (!state.running || state.jump > 0 || state.spin > 0 || state.jumpCooldown > 0 || state.speed < 25) return;
    state.jumpCooldown = .72;
    triggerJump(false);
  }

  jumpButton.addEventListener('pointerdown', event => {
    event.preventDefault();
    jumpButton.classList.add('active');
    requestJump();
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(type => jumpButton.addEventListener(type, event => {
    event.preventDefault();
    jumpButton.classList.remove('active');
  }));

  const keys = {
    ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'gas', ArrowDown: 'brake',
    a: 'left', d: 'right', w: 'gas', s: 'brake'
  };
  addEventListener('keydown', event => {
    if (event.code === 'Space') {
      requestJump();
      event.preventDefault();
      return;
    }
    if (!keys[event.key]) return;
    input[keys[event.key]] = true;
    event.preventDefault();
  });
  addEventListener('keyup', event => {
    if (!keys[event.key]) return;
    input[keys[event.key]] = false;
    event.preventDefault();
  });

  function startEngineAudio() {
    if (audioContext) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    audioContext = new AudioCtx();
    engineOsc = audioContext.createOscillator();
    enginePulse = audioContext.createOscillator();
    engineGain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    engineOsc.type = 'sawtooth';
    enginePulse.type = 'square';
    filter.type = 'lowpass';
    filter.frequency.value = 360;
    engineGain.gain.value = .018;
    engineOsc.connect(filter);
    enginePulse.connect(filter);
    filter.connect(engineGain);
    engineGain.connect(audioContext.destination);
    engineOsc.start();
    enginePulse.start();
  }

  garageButton.addEventListener('click', () => startPanel.classList.add('garage-open'));
  garageBack.addEventListener('click', () => startPanel.classList.remove('garage-open'));

  startButton.addEventListener('click', () => {
    updateSetup();
    state.running = true;
    state.speed = 55;
    document.querySelector('#game-shell').classList.add('running');
    startPanel.classList.add('hidden');
    startEngineAudio();
    showToast(`${getBuildName()} READY!`, 1.25);
    if (screen.orientation?.lock) screen.orientation.lock('landscape').catch(() => {});
  });

  function setDriverMood(mood, duration = 0) {
    if (!moods[mood]) return;
    if (mood === currentMood) {
      if (duration) moodTimer = duration;
      return;
    }
    currentMood = mood;
    moodTimer = duration;
    driverFace.src = moods[mood].src;
    driverMood.textContent = moods[mood].label;
    driverCard.className = `driver-card mood-${mood}`;
  }

  driverCard.addEventListener('click', () => {
    const order = ['neutral', 'happy', 'angry'];
    setDriverMood(order[(order.indexOf(currentMood) + 1) % order.length], 1.4);
  });

  function showToast(message, duration = .8) {
    toast.textContent = message;
    state.toastTimer = duration;
    toast.classList.add('show');
  }

  const speedRatio = () => Math.min(1, state.speed / state.maxSpeed);
  const horizonY = () => h * (.39 - speedRatio() * .075);

  function roadCurve(z) {
    const world = state.distance * 1.75;
    return Math.sin(world * .018 + z * .026) * .58 + Math.sin(world * .007 + z * .011) * .4;
  }

  function roadProjection(z, side = 0) {
    const horizon = horizonY();
    const p = 1 - Math.max(0, Math.min(150, z)) / 150;
    const bottom = h * 1.04;
    const y = horizon + Math.pow(p, 1.72) * (bottom - horizon);
    const roadWidth = w * (.035 + Math.pow(p, 1.28) * (.62 + speedRatio() * .07));
    const center = w / 2 + roadCurve(z) * w * .22 * Math.pow(p, .45) - state.position * w * .22;
    return { p, y, roadWidth, x: center + roadWidth * side };
  }

  function drawSky() {
    const horizon = horizonY();
    const sky = ctx.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, '#100924');
    sky.addColorStop(.55, '#57244f');
    sky.addColorStop(1, '#f36a27');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, horizon + 2);

    const sunX = w * .72;
    const sunY = horizon * .56;
    const sunR = Math.min(w, h) * .085;
    ctx.fillStyle = '#ffd34a';
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f36a27';
    for (let i = 0; i < 5; i++) ctx.fillRect(sunX - sunR, sunY - sunR * .1 + i * sunR * .25, sunR * 2, 3 + i);

    ctx.fillStyle = '#24142f';
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    for (let x = 0; x <= w; x += w / 10) {
      const y = horizon - (Math.sin(x * .015) * 15 + 25 + ((x / (w / 10)) % 3) * 18);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, horizon);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#120d19';
    const base = horizon + 3;
    for (let x = -20; x < w + 30; x += 42) {
      const buildingHeight = 15 + ((x * 7) % 27 + 27) % 27;
      ctx.fillRect(x, base - buildingHeight, 31, buildingHeight);
      ctx.fillStyle = '#fb9d25';
      ctx.fillRect(x + 5, base - buildingHeight + 7, 4, 3);
      ctx.fillRect(x + 18, base - buildingHeight + 14, 4, 3);
      ctx.fillStyle = '#120d19';
    }
  }

  function drawRoad() {
    const horizon = horizonY();
    const bottom = h * 1.04;
    const slices = Math.max(84, Math.floor(h * .19));
    const camShift = state.position * w * .22;
    const maxRoadWidth = .62 + speedRatio() * .07;

    for (let i = 0; i < slices; i++) {
      const p = i / (slices - 1);
      const p2 = (i + 1) / (slices - 1);
      const y1 = horizon + Math.pow(p, 1.72) * (bottom - horizon);
      const y2 = horizon + Math.pow(p2, 1.72) * (bottom - horizon);
      const roadW1 = w * (.035 + Math.pow(p, 1.28) * maxRoadWidth);
      const roadW2 = w * (.035 + Math.pow(p2, 1.28) * maxRoadWidth);
      const z1 = (1 - p) * 150;
      const z2 = (1 - p2) * 150;
      const center1 = w / 2 + roadCurve(z1) * w * .22 * Math.pow(p, .45) - camShift;
      const center2 = w / 2 + roadCurve(z2) * w * .22 * Math.pow(p2, .45) - camShift;
      const rumble = Math.floor((state.distance * 2.7 + z1) / 5) % 2 === 0;

      ctx.fillStyle = rumble ? '#235739' : '#173d27';
      ctx.fillRect(0, y1, w, y2 - y1 + 1);

      ctx.fillStyle = rumble ? '#fff0d3' : '#ef3e26';
      ctx.beginPath();
      ctx.moveTo(center1 - roadW1 * 1.08, y1);
      ctx.lineTo(center1 - roadW1, y1);
      ctx.lineTo(center2 - roadW2, y2);
      ctx.lineTo(center2 - roadW2 * 1.08, y2);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(center1 + roadW1, y1);
      ctx.lineTo(center1 + roadW1 * 1.08, y1);
      ctx.lineTo(center2 + roadW2 * 1.08, y2);
      ctx.lineTo(center2 + roadW2, y2);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = rumble ? '#2c2933' : '#3b3742';
      ctx.beginPath();
      ctx.moveTo(center1 - roadW1, y1);
      ctx.lineTo(center1 + roadW1, y1);
      ctx.lineTo(center2 + roadW2, y2);
      ctx.lineTo(center2 - roadW2, y2);
      ctx.closePath();
      ctx.fill();

      const stripePhase = Math.floor((state.distance * 3.4 + z1) / 10) % 2;
      if (stripePhase === 0 && p > .04) {
        const stripeW1 = Math.max(1, roadW1 * .012);
        const stripeW2 = Math.max(1, roadW2 * .012);
        ctx.fillStyle = '#ffe070';
        ctx.beginPath();
        ctx.moveTo(center1 - stripeW1, y1);
        ctx.lineTo(center1 + stripeW1, y1);
        ctx.lineTo(center2 + stripeW2, y2);
        ctx.lineTo(center2 - stripeW2, y2);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  function drawRoadside() {
    for (let n = 0; n < 18; n++) {
      const z = ((n * 14 - state.distance * 3.1) % 210 + 210) % 210;
      if (z > 150) continue;
      const point = roadProjection(z, n % 2 ? 1.27 : -1.27);
      if (point.p < .03) continue;
      const size = 5 + point.p * Math.min(w, h) * .12;
      const side = n % 2 ? 1 : -1;
      ctx.save();
      ctx.translate(point.x, point.y);
      ctx.scale(side, 1);
      ctx.fillStyle = '#251326';
      ctx.fillRect(-size * .08, -size * .75, size * .16, size * .75);
      ctx.fillStyle = n % 3 === 0 ? '#ff4a17' : '#f4c42a';
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size * .45, -size * .45);
      ctx.lineTo(0, -size * .55);
      ctx.lineTo(-size * .38, -size * .32);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  function drawRamp() {
    const distanceToRamp = state.nextRamp - state.distance;
    if (distanceToRamp <= 0 || distanceToRamp > 150) return;
    const far = roadProjection(distanceToRamp + 5);
    const near = roadProjection(Math.max(0, distanceToRamp - 5));
    const farWidth = far.roadWidth * .56;
    const nearWidth = near.roadWidth * .62;
    ctx.fillStyle = '#f8c52b';
    ctx.beginPath();
    ctx.moveTo(far.x - farWidth, far.y);
    ctx.lineTo(far.x + farWidth, far.y);
    ctx.lineTo(near.x + nearWidth, near.y);
    ctx.lineTo(near.x - nearWidth, near.y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1b0818';
    ctx.lineWidth = Math.max(2, near.p * 7);
    for (let lane = -1; lane <= 1; lane++) {
      ctx.beginPath();
      ctx.moveTo(far.x + farWidth * lane * .58, far.y);
      ctx.lineTo(near.x + nearWidth * lane * .58, near.y);
      ctx.stroke();
    }
  }

  function drawSpeedLines() {
    const intensity = Math.max(0, (speedRatio() - .28) / .72);
    if (intensity <= 0) return;
    const horizon = horizonY();
    ctx.save();
    ctx.globalAlpha = intensity * .48;
    ctx.strokeStyle = '#ffe7a0';
    ctx.lineWidth = 1 + intensity * 3;
    const phase = state.time * .0018;
    for (let i = 0; i < 28; i++) {
      const seed = ((i * 73.37 + phase * 190) % 1000) / 1000;
      const side = i % 2 ? 1 : -1;
      const startX = w / 2 + side * (w * (.08 + seed * .28));
      const startY = horizon + (h - horizon) * (.15 + seed * .45);
      const length = (18 + seed * 90) * intensity;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX + side * length * .65, startY + length);
      ctx.stroke();
    }
    ctx.restore();
  }

  const trackPoints = [
    [90, 196], [48, 184], [30, 150], [43, 119], [28, 84], [53, 35],
    [100, 20], [144, 43], [151, 82], [125, 108], [151, 139], [137, 181]
  ];
  const lapLength = 2400;

  function pointOnTrack(progress) {
    const lengths = [];
    let total = 0;
    for (let i = 0; i < trackPoints.length; i++) {
      const a = trackPoints[i];
      const b = trackPoints[(i + 1) % trackPoints.length];
      const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
      lengths.push(length);
      total += length;
    }
    let target = progress * total;
    for (let i = 0; i < lengths.length; i++) {
      if (target <= lengths[i]) {
        const a = trackPoints[i];
        const b = trackPoints[(i + 1) % trackPoints.length];
        const t = target / lengths[i];
        return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      }
      target -= lengths[i];
    }
    return trackPoints[0];
  }

  function drawCourseMap() {
    const progress = (state.distance % lapLength) / lapLength;
    const player = pointOnTrack(progress);
    mapCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
    mapCtx.lineJoin = 'round';
    mapCtx.lineCap = 'round';
    mapCtx.beginPath();
    trackPoints.forEach(([x, y], index) => index ? mapCtx.lineTo(x, y) : mapCtx.moveTo(x, y));
    mapCtx.closePath();
    mapCtx.strokeStyle = '#160a18';
    mapCtx.lineWidth = 18;
    mapCtx.stroke();
    mapCtx.strokeStyle = '#fff0cf';
    mapCtx.lineWidth = 10;
    mapCtx.stroke();
    mapCtx.setLineDash([4, 5]);
    mapCtx.strokeStyle = '#ff4b12';
    mapCtx.lineWidth = 2;
    mapCtx.stroke();
    mapCtx.setLineDash([]);
    mapCtx.fillStyle = '#111018';
    mapCtx.fillRect(80, 187, 20, 5);
    mapCtx.fillStyle = '#f8c52b';
    mapCtx.beginPath();
    mapCtx.arc(player[0], player[1], 10, 0, Math.PI * 2);
    mapCtx.fill();
    mapCtx.strokeStyle = '#fff';
    mapCtx.lineWidth = 3;
    mapCtx.stroke();
    mapCtx.fillStyle = '#110816';
    mapCtx.beginPath();
    mapCtx.moveTo(player[0], player[1] - 7);
    mapCtx.lineTo(player[0] + 5, player[1] + 4);
    mapCtx.lineTo(player[0] - 5, player[1] + 4);
    mapCtx.closePath();
    mapCtx.fill();
    lapCount.textContent = `LAP ${Math.floor(state.distance / lapLength) + 1}`;
  }

  function currentCarSprite() {
    if (state.spin > 0) {
      const progress = 1 - state.spin / state.spinDuration;
      return carSprites.spin[Math.floor(progress * carSprites.spin.length) % carSprites.spin.length];
    }
    if (state.jump > 0) {
      const progress = 1 - state.jump / state.jumpDurationCurrent;
      if (progress < .3) return carSprites.jump[0];
      if (progress < .7) return carSprites.jump[1];
      return carSprites.jump[2];
    }
    return carSprites.steering[Math.max(0, Math.min(4, Math.round(state.steerVisual) + 2))];
  }

  function drawCar() {
    const sprite = currentCarSprite();
    const speedBounce = Math.sin(state.time * .04) * Math.min(4, state.speed / 60);
    const size = Math.min(w * .42, h * .57, 340);
    const jumpProgress = state.jump > 0 ? 1 - state.jump / state.jumpDurationCurrent : 0;
    const jumpHeight = state.jump > 0 ? Math.sin(Math.PI * jumpProgress) * h * .16 : 0;
    const x = w / 2 - size / 2 + state.position * w * .052;
    const y = h - size - Math.max(14, h * .015) + speedBounce - jumpHeight;
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    if (state.spin > 0) ctx.rotate(Math.sin((1 - state.spin / state.spinDuration) * Math.PI * 2) * .08);
    if (sprite.complete && sprite.naturalWidth) ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
    drawSponsorPlate(size);
    ctx.restore();
  }

  function drawSponsorPlate(size) {
    if (!sponsorPlate.complete || !sponsorPlate.naturalWidth) return;
    let visibility = 1;
    let scaleX = 1;
    let skew = 0;
    let offsetX = 0;

    if (state.spin > 0) {
      const progress = 1 - state.spin / state.spinDuration;
      const facingRear = Math.cos(progress * Math.PI * 2);
      visibility = Math.max(0, (facingRear - .05) / .95);
      if (visibility < .08) return;
      scaleX = .22 + visibility * .78;
      skew = Math.sin(progress * Math.PI * 2) * .18;
      offsetX = Math.sin(progress * Math.PI * 2) * size * .045;
    } else {
      const steer = state.steerVisual / 2;
      scaleX = 1 - Math.abs(steer) * .28;
      skew = -steer * .1;
      offsetX = -steer * size * .034;
    }

    const plateWidth = size * .225 * scaleX;
    const plateHeight = size * .066;
    ctx.save();
    ctx.globalAlpha = visibility;
    ctx.translate(offsetX, size * .115);
    ctx.transform(1, 0, skew, 1, 0, 0);
    ctx.drawImage(sponsorPlate, -plateWidth / 2, -plateHeight / 2, plateWidth, plateHeight);
    ctx.restore();
  }

  function triggerJump(fromRamp = true) {
    const baseDuration = fromRamp ? state.jumpDuration : state.jumpDuration * .72;
    state.jump = baseDuration * setupStats.jump;
    state.jumpDurationCurrent = state.jump;
    state.shake = 5;
    setDriverMood('happy', 1.05);
    showToast(fromRamp ? 'BIG AIR!' : 'HOP!', fromRamp ? 1.05 : .62);
    if (navigator.vibrate) navigator.vibrate(35);
  }

  function triggerSpin() {
    state.spin = state.spinDuration;
    state.spinCooldown = 2.2;
    state.speed *= .72;
    state.shake = 15;
    setDriverMood('angry', 1.15);
    showToast('WILD SPIN!', 1.05);
    if (navigator.vibrate) navigator.vibrate([45, 35, 65]);
  }

  function update(dt) {
    if (!state.running) return;
    state.previousDistance = state.distance;
    const onRoad = Math.abs(state.position) < 1.04;
    const steeringTarget = input.left ? -2 : input.right ? 2 : 0;
    state.steerVisual += (steeringTarget - state.steerVisual) * Math.min(1, dt * 9);

    if (input.gas) state.speed += (155 * setupStats.accel - state.speed * .22) * dt;
    else state.speed -= 9 * dt;
    if (input.brake) state.speed -= 150 * dt;
    if (!onRoad) state.speed -= (105 / setupStats.dirt) * dt;
    if (state.spin > 0) state.speed -= 85 * dt;
    state.speed = Math.max(0, Math.min(state.maxSpeed, state.speed));

    const steerPower = (.72 + speedRatio() * 1.55) * setupStats.grip * dt;
    if (state.spin <= 0) {
      if (input.left) state.position -= steerPower;
      if (input.right) state.position += steerPower;
    }
    state.position += roadCurve(0) * speedRatio() * .25 * dt;
    state.position = Math.max(-1.62, Math.min(1.62, state.position));
    state.distance += state.speed * dt / 5.2;
    state.time += dt * 1000;

    if (state.previousDistance < state.nextRamp && state.distance >= state.nextRamp) {
      if (onRoad && state.speed > 85 && state.jump === 0) triggerJump(true);
      state.nextRamp += 620;
    }
    if (state.jump > 0) {
      state.jump = Math.max(0, state.jump - dt);
      if (state.jump === 0) {
        state.shake = 9 / setupStats.jump;
        showToast('HARD LANDING!', .6);
        if (navigator.vibrate) navigator.vibrate(45);
      }
    }
    if (state.spin > 0) state.spin = Math.max(0, state.spin - dt);
    state.spinCooldown = Math.max(0, state.spinCooldown - dt);
    state.jumpCooldown = Math.max(0, state.jumpCooldown - dt);
    jumpButton.classList.toggle('ready', state.jumpCooldown === 0 && state.jump === 0 && state.spin === 0 && state.speed >= 25);
    if (Math.abs(state.position) > 1.42 && state.speed > 145 && state.spinCooldown === 0 && state.jump === 0) triggerSpin();

    const baseShake = state.speed > 220 ? (state.speed - 220) / 110 * 2.4 : 0;
    const offRoadShake = !onRoad && state.speed > 50 ? 8 : 0;
    state.shake = Math.max(baseShake, offRoadShake, state.shake - 25 * dt);

    if (!onRoad && state.speed > 35 && state.spin === 0) setDriverMood('angry', .48);
    if (state.speed > 205 && !state.speedCelebrated) {
      state.speedCelebrated = true;
      setDriverMood('happy', 1.05);
      showToast('FULL THROTTLE!', .9);
    }
    if (state.speed < 130) state.speedCelebrated = false;
    if (moodTimer > 0) {
      moodTimer -= dt;
      if (moodTimer <= 0 && onRoad && state.spin === 0) setDriverMood('neutral');
    }

    if (state.toastTimer > 0) {
      state.toastTimer -= dt;
      if (state.toastTimer <= 0) toast.classList.remove('show');
    } else if (!onRoad && state.speed > 20) {
      toast.textContent = 'DIRT SIDE! KEEP IT DOWN!';
      toast.classList.add('show');
    } else {
      toast.classList.remove('show');
    }

    if (audioContext && engineOsc && enginePulse) {
      const now = audioContext.currentTime;
      const pitch = 44 + state.speed * .42;
      engineOsc.frequency.setTargetAtTime(pitch, now, .045);
      enginePulse.frequency.setTargetAtTime(pitch * .5, now, .055);
      engineGain.gain.setTargetAtTime(.012 + speedRatio() * .018, now, .06);
    }

    speedEl.textContent = Math.round(state.speed);
    distanceEl.textContent = (state.distance / 100).toFixed(1);
    drawCourseMap();
  }

  function render() {
    ctx.save();
    if (state.shake > 0) ctx.translate((Math.random() - .5) * state.shake, (Math.random() - .5) * state.shake);
    drawSky();
    drawRoad();
    drawRamp();
    drawRoadside();
    drawSpeedLines();
    drawCar();
    ctx.restore();
  }

  function loop(now) {
    const dt = Math.min(.033, (now - last) / 1000);
    last = now;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
})();
