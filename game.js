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
  const mapCanvas = document.querySelector('#map-canvas');
  const mapCtx = mapCanvas.getContext('2d');
  const lapCount = document.querySelector('#lap-count');
  const jumpButton = document.querySelector('#jump');
  const speedNeedle = document.querySelector('#speed-needle');
  const zoneName = document.querySelector('#zone-name');
  const reactionPop = document.querySelector('#reaction-pop');
  const countdownEl = document.querySelector('#countdown');
  const lapBanner = document.querySelector('#lap-banner');
  const itemSlot = document.querySelector('#item-slot');
  const garagePreview = document.querySelector('#garage-car-preview');
  const selectBack = document.querySelector('#select-back');
  const selectContinue = document.querySelector('#select-continue');
  const courseBack = document.querySelector('#course-back');
  const courseContinue = document.querySelector('#course-continue');
  const menuButton = document.querySelector('#menu-button');
  const pauseMenu = document.querySelector('#pause-menu');
  const resumeButton = document.querySelector('#resume-button');
  const restartButton = document.querySelector('#restart-button');
  const titleButton = document.querySelector('#title-button');
  const volumeControl = document.querySelector('#volume-control');
  const startGirls = document.querySelector('#start-girls');
  const profileRole = document.querySelector('#profile-role');
  const profileCopy = document.querySelector('#profile-copy');
  const profileType = document.querySelector('#profile-type');
  const profileMove = document.querySelector('#profile-move');
  const profileEffect = document.querySelector('#profile-effect');
  const signatureButton = document.querySelector('#signature-button');
  const signatureName = document.querySelector('#signature-name');
  const signatureState = document.querySelector('#signature-state');

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
  const speedCarSprite = loadImage('./assets/rival/speed-coupe.png');
  const nasuBackground = loadImage('./assets/course/nasushiobara-sunset.jpg');
  const utsunomiyaBackground = loadImage('./assets/course/utsunomiya-sunset.jpg');
  const dogCarSprite = loadImage('./assets/car-dog/rear.png');
  const dogCarAngles = {
    rear: dogCarSprite,
    rearRight: loadImage('./assets/car-dog/rear-right.png'),
    front: loadImage('./assets/car-dog/front.png'),
    sideLeft: loadImage('./assets/car-dog/side-left.png'),
    sideRight: loadImage('./assets/car-dog/side-right.png'),
    underside: loadImage('./assets/car-dog/jump-underside.png')
  };
  const womanCarAngles = {
    rearLeft: loadImage('./assets/car-woman/rear-left.png'),
    rearRight: loadImage('./assets/car-woman/rear-right.png'),
    front: loadImage('./assets/car-woman/front.png'),
    sideLeft: loadImage('./assets/car-woman/side-left.png'),
    sideRight: loadImage('./assets/car-woman/side-right.png'),
    underside: loadImage('./assets/car-woman/jump-underside.png')
  };

  const drivers = {
    woman: {
      name: 'THE CLOSER', type: 'PLAYER 01 · SEDAN', preview: './assets/select/woman-sedan-three-quarter.png',
      role: '営業・顧客サポート',
      profile: '相談を整理し、仲間を巻き込みながら最後までやり切るチームの推進役。',
      ability: { type: 'power', typeLabel: 'POWER TYPE', name: 'RAM JAM', effect: '一定時間、接触した相手をひるませる', duration: 5.5, reaction: 'MAKE WAY!!', mood: 'angry' },
      moods: {
        neutral: { src: './assets/driver/woman/woman-neutral-v2.png', label: 'LOCKED IN!' },
        happy: { src: './assets/driver/woman/woman-happy-v2.png', label: 'SEE YA!!' },
        angry: { src: './assets/driver/woman/woman-hit-v2.png', label: 'HEY!!' }
      }
    },
    speedster: {
      name: 'THE SPEEDSTER', type: 'PLAYER 02 · SPEED', preview: './assets/select/speed-coupe-three-quarter.png',
      role: '代表・プロジェクト推進',
      profile: '判断したらすぐ動く。現場の先頭に立ち、仕事を最短距離で前へ進める。',
      ability: { type: 'speed', typeLabel: 'SPEED TYPE', name: 'REDLINE RUSH', effect: '一定時間、最高速と加速力が大幅アップ', duration: 4.8, reaction: 'FULL SEND!!', mood: 'happy' },
      moods: {
        neutral: { src: './assets/rival/speed-rival-neutral-v2.png', label: 'ICE COLD' },
        happy: { src: './assets/rival/speed-rival-happy-v2.png', label: 'TOO SLOW!' },
        angry: { src: './assets/rival/speed-rival-hit-v2.png', label: 'MY GLASSES!' }
      }
    },
    dog: {
      name: 'GOLDEN ACE', type: 'PLAYER 03 · OFF ROAD', preview: './assets/select/dog-offroad-three-quarter.png',
      role: '公式看板犬・広報',
      profile: '誰とでも一瞬で距離を縮め、会社の空気を明るくする愛されトレードマーク。',
      ability: { type: 'charisma', typeLabel: 'CHARISMA TYPE', name: 'LUCKY JACK', effect: '相手が持つ、または次に取るアイテムを1回奪う', duration: 0, reaction: 'GIMME THAT!!', mood: 'happy' },
      moods: {
        neutral: { src: './assets/driver/dog/dog-neutral.png', label: 'READY TO RUN!' },
        happy: { src: './assets/driver/dog/dog-happy.png', label: 'WOOF! WOOF!!' },
        angry: { src: './assets/driver/dog/dog-hit.png', label: 'ARF?!' }
      }
    }
  };
  let selectedDriver = 'woman';
  let selectedCourse = 'nasu';

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
    speedCelebrated: false, toastTimer: 0, countdown: 0, countdownMark: 0, raceActive: false,
    nextItem: 260, itemLane: .35, roulette: 0, heldItem: '', turbo: 0, shield: 0,
    trainHitCooldown: 0, rescue: 0, paused: false, currentLap: 1, finished: false,
    signatureReady: true, signatureActive: 0, stealArmed: false
  };
  const rival = {
    distance: 72, previousRelative: 72, speed: 190, lane: -.38, targetLane: .42,
    laneTimer: 1.7, hit: 0, collisionCooldown: 0, mood: 'neutral', moodTimer: 0,
    heldItem: '', itemTimer: 6.5, useItemTimer: 0, turbo: 0
  };
  let reactionTimer = null;

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
  let masterGain = null;
  let musicGain = null;
  let musicTimer = null;

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
    if (selectedDriver === 'dog') {
      setupStats.topSpeed -= .04; setupStats.grip += .05; setupStats.dirt += .18; setupStats.jump += .14;
    }
    const barIds = { topSpeed: 'stat-speed', accel: 'stat-accel', grip: 'stat-grip', dirt: 'stat-dirt', jump: 'stat-jump' };
    Object.entries(barIds).forEach(([stat, id]) => {
      const percent = Math.max(12, Math.min(100, 50 + (setupStats[stat] - 1) * 210));
      document.querySelector(`#${id}`).style.width = `${percent}%`;
    });
    setupName.textContent = getBuildName();
    const driverTopSpeed = selectedDriver === 'speedster' ? 1.075 : 1;
    state.maxSpeed = Math.round(330 * setupStats.topSpeed * driverTopSpeed);
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
    if (!state.running || !state.raceActive || state.jump > 0 || state.spin > 0 || state.jumpCooldown > 0 || state.speed < 25) return;
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
  signatureButton.addEventListener('pointerdown', event => {
    event.preventDefault();
    activateSignature();
  });

  const keys = {
    ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'gas', ArrowDown: 'brake',
    a: 'left', d: 'right', w: 'gas', s: 'brake'
  };
  addEventListener('keydown', event => {
    if (event.key.toLowerCase() === 'e') { useItem(); event.preventDefault(); return; }
    if (event.key.toLowerCase() === 'q') { activateSignature(); event.preventDefault(); return; }
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
    masterGain = audioContext.createGain();
    musicGain = audioContext.createGain();
    masterGain.gain.value = Number(volumeControl.value) / 100;
    musicGain.gain.value = .16;
    musicGain.connect(masterGain);
    masterGain.connect(audioContext.destination);
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
    engineGain.connect(masterGain);
    engineOsc.start();
    enginePulse.start();
    startHotRodMusic();
  }

  function musicNote(frequency, when, duration, type = 'sawtooth', level = .08) {
    if (!audioContext || !musicGain) return;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = type; osc.frequency.setValueAtTime(frequency, when);
    gain.gain.setValueAtTime(level, when); gain.gain.exponentialRampToValueAtTime(.001, when + duration);
    osc.connect(gain); gain.connect(musicGain); osc.start(when); osc.stop(when + duration);
  }

  function scheduleHotRodBar() {
    if (!audioContext) return;
    const start = audioContext.currentTime + .04;
    const beat = .19;
    const bass = [82.4,82.4,110,82.4,123.5,110,82.4,73.4];
    bass.forEach((note,index) => {
      musicNote(note,start+index*beat,beat*.82,'square',.075);
      musicNote(note*2,start+index*beat,beat*.42,'sawtooth',.028);
      if (index%2===0) musicNote(55,start+index*beat,.06,'triangle',.12);
      if (index%2===1) musicNote(220,start+index*beat,.045,'square',.025);
    });
  }

  function startHotRodMusic() {
    if (musicTimer) return;
    scheduleHotRodBar();
    musicTimer = setInterval(scheduleHotRodBar,1520);
  }

  function playCrashSound() {
    if (!audioContext) return;
    const now = audioContext.currentTime;
    const length = Math.floor(audioContext.sampleRate * .24);
    const buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
    const noise = audioContext.createBufferSource();
    const filter = audioContext.createBiquadFilter();
    const crashGain = audioContext.createGain();
    noise.buffer = buffer;
    filter.type = 'bandpass';
    filter.frequency.value = 720;
    filter.Q.value = .8;
    crashGain.gain.setValueAtTime(.22, now);
    crashGain.gain.exponentialRampToValueAtTime(.001, now + .24);
    noise.connect(filter);
    filter.connect(crashGain);
    crashGain.connect(masterGain || audioContext.destination);
    noise.start(now);

    const thud = audioContext.createOscillator();
    const thudGain = audioContext.createGain();
    thud.type = 'square';
    thud.frequency.setValueAtTime(105, now);
    thud.frequency.exponentialRampToValueAtTime(38, now + .18);
    thudGain.gain.setValueAtTime(.16, now);
    thudGain.gain.exponentialRampToValueAtTime(.001, now + .2);
    thud.connect(thudGain);
    thudGain.connect(masterGain || audioContext.destination);
    thud.start(now);
    thud.stop(now + .21);
  }

  function playCountTone(frequency = 330, duration = .1) {
    if (!audioContext) return;
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'square'; osc.frequency.value = frequency;
    gain.gain.setValueAtTime(.08, now); gain.gain.exponentialRampToValueAtTime(.001, now + duration);
    osc.connect(gain); gain.connect(masterGain || audioContext.destination); osc.start(now); osc.stop(now + duration);
  }

  function playSignatureSound() {
    playCountTone(165, .12);
    setTimeout(() => playCountTone(330, .14), 85);
    setTimeout(() => playCountTone(660, .22), 170);
  }

  function renderDriverProfile() {
    const driver = drivers[selectedDriver];
    const ability = driver.ability;
    profileRole.textContent = driver.role;
    profileCopy.textContent = driver.profile;
    profileType.textContent = ability.typeLabel;
    profileMove.textContent = ability.name;
    profileEffect.textContent = ability.effect;
    document.querySelectorAll('.type-legend span').forEach(item => item.classList.toggle('active', item.dataset.type === ability.type));
    signatureName.textContent = ability.name;
    updateSignatureButton();
  }

  function updateSignatureButton() {
    const ability = drivers[selectedDriver].ability;
    signatureName.textContent = ability.name;
    signatureButton.classList.toggle('active', state.signatureActive > 0);
    signatureButton.classList.toggle('armed', state.stealArmed);
    signatureButton.classList.toggle('spent', !state.signatureReady && state.signatureActive <= 0 && !state.stealArmed);
    if (state.signatureActive > 0) signatureState.textContent = `${state.signatureActive.toFixed(1)} SEC`;
    else if (state.stealArmed) signatureState.textContent = 'STEAL ARMED';
    else signatureState.textContent = state.signatureReady ? '1 SHOT' : 'SPENT';
  }

  function stealRivalItem() {
    const stolen = rival.heldItem || ['turbo', 'shield', 'shock'][Math.floor(Math.random() * 3)];
    rival.heldItem = '';
    rival.useItemTimer = 0;
    state.heldItem = stolen;
    state.stealArmed = false;
    updateItemSlot();
    showToast(`LUCKY JACK STOLE ${stolen.toUpperCase()}!`, 1.35);
    showReaction('MINE NOW!!');
    setDriverMood('happy', 1.6);
    updateSignatureButton();
  }

  function activateSignature() {
    if (!state.running || !state.raceActive || state.paused || state.finished || !state.signatureReady) return;
    const ability = drivers[selectedDriver].ability;
    state.signatureReady = false;
    setDriverMood(ability.mood, Math.max(1.6, ability.duration));
    showReaction(ability.reaction);
    showToast(`${ability.typeLabel} · ${ability.name}!`, 1.45);
    playSignatureSound();
    if (navigator.vibrate) navigator.vibrate([35, 30, 70]);

    if (ability.type === 'charisma') {
      if (rival.heldItem) stealRivalItem();
      else {
        state.stealArmed = true;
        driverCard.classList.add('signature-fired');
      }
    } else {
      state.signatureActive = ability.duration;
      driverCard.classList.add('signature-fired');
    }
    updateSignatureButton();
  }

  function applyDriverSelection() {
    const driver = drivers[selectedDriver];
    garagePreview.src = driver.preview;
    currentMood = '';
    setDriverMood('neutral');
    renderDriverProfile();
    updateSetup();
    try { localStorage.setItem('nasuRiotDriver', selectedDriver); } catch (_) {}
  }

  try {
    const savedDriver = localStorage.getItem('nasuRiotDriver');
    if (drivers[savedDriver]) selectedDriver = savedDriver;
    const savedCourse = localStorage.getItem('tochigiRiotCourse');
    if (['nasu','utsunomiya'].includes(savedCourse)) selectedCourse = savedCourse;
  } catch (_) {}

  document.querySelectorAll('.driver-choice').forEach(choice => {
    choice.classList.toggle('selected', choice.dataset.driver === selectedDriver);
    choice.addEventListener('click', () => {
      selectedDriver = choice.dataset.driver;
      document.querySelectorAll('.driver-choice').forEach(item => item.classList.toggle('selected', item === choice));
      applyDriverSelection();
    });
  });
  applyDriverSelection();

  document.querySelectorAll('.course-choice').forEach(choice => {
    choice.classList.toggle('selected', choice.dataset.course === selectedCourse);
    choice.addEventListener('click', () => {
      selectedCourse = choice.dataset.course;
      document.querySelectorAll('.course-choice').forEach(item => item.classList.toggle('selected', item === choice));
      try { localStorage.setItem('tochigiRiotCourse', selectedCourse); } catch (_) {}
    });
  });

  garageButton.addEventListener('click', () => startPanel.classList.add('course-open'));
  courseBack.addEventListener('click', () => startPanel.classList.remove('course-open'));
  courseContinue.addEventListener('click', () => {
    startPanel.classList.remove('course-open');
    startPanel.classList.add('select-open');
  });
  selectBack.addEventListener('click', () => {
    startPanel.classList.remove('select-open');
    startPanel.classList.add('course-open');
  });
  selectContinue.addEventListener('click', () => {
    startPanel.classList.remove('select-open');
    startPanel.classList.add('garage-open');
  });
  garageBack.addEventListener('click', () => {
    startPanel.classList.remove('garage-open');
    startPanel.classList.add('select-open');
  });

  function resetRace() {
    updateSetup();
    state.running = true;
    state.raceActive = false;
    state.countdown = 3.65;
    state.countdownMark = 4;
    state.speed = 0;
    state.position = 0; state.distance = 0; state.previousDistance = 0; state.nextRamp = 420;
    state.nextItem = 260; state.itemLane = .35; state.heldItem = ''; state.roulette = 0;
    state.spin = 0; state.jump = 0; state.rescue = 0; state.paused = false;
    state.currentLap = 1; state.finished = false; state.signatureReady = true; state.signatureActive = 0; state.stealArmed = false;
    rival.distance = 72;
    rival.previousRelative = 72;
    rival.speed = 190; rival.heldItem = ''; rival.itemTimer = 5.5 + Math.random() * 3; rival.useItemTimer = 0; rival.turbo = 0;
    updateItemSlot();
    updateSignatureButton();
    document.querySelector('#game-shell').classList.add('running');
    document.querySelector('#game-shell').classList.add('counting');
    startPanel.classList.add('hidden');
    startEngineAudio();
    showToast(`${getBuildName()} READY!`, 1.25);
    if (screen.orientation?.lock) screen.orientation.lock('landscape').catch(() => {});
  }

  startButton.addEventListener('click', () => {
    resetRace();
  });

  function setPause(open) {
    if (!state.running) return;
    state.paused = open;
    pauseMenu.classList.toggle('open',open);
    if (masterGain && audioContext) masterGain.gain.setTargetAtTime(open ? .06 : Number(volumeControl.value)/100,audioContext.currentTime,.05);
  }
  menuButton.addEventListener('click', () => setPause(true));
  resumeButton.addEventListener('click', () => setPause(false));
  restartButton.addEventListener('click', () => { setPause(false); resetRace(); });
  titleButton.addEventListener('click', () => location.reload());
  volumeControl.addEventListener('input', () => {
    if (masterGain && audioContext) masterGain.gain.setTargetAtTime(state.paused ? .06 : Number(volumeControl.value)/100,audioContext.currentTime,.04);
  });

  function setDriverMood(mood, duration = 0) {
    const moods = drivers[selectedDriver].moods;
    if (!moods[mood]) return;
    if (mood === currentMood) {
      if (duration) moodTimer = duration;
      return;
    }
    currentMood = mood;
    moodTimer = duration;
    driverFace.src = moods[mood].src;
    driverCard.className = `driver-card mood-${mood}`;
    if (state.signatureActive > 0 || state.stealArmed) driverCard.classList.add('signature-fired');
  }

  function setRivalMood(mood, duration = 0) {
    rival.mood = mood;
    rival.moodTimer = duration;
  }

  driverCard.addEventListener('click', () => {
    const order = ['neutral', 'happy', 'angry'];
    const nextMood = order[(order.indexOf(currentMood) + 1) % order.length];
    setDriverMood(nextMood, 1.4);
    showReaction(drivers[selectedDriver].moods[nextMood].label);
  });

  function showToast(message, duration = .8) {
    toast.textContent = message;
    state.toastTimer = duration;
    toast.classList.add('show');
  }

  function showReaction(message) {
    reactionPop.querySelector('span').textContent = message;
    reactionPop.classList.remove('show');
    void reactionPop.offsetWidth;
    reactionPop.classList.add('show');
    clearTimeout(reactionTimer);
    reactionTimer = setTimeout(() => reactionPop.classList.remove('show'), 760);
  }

  function showLapBanner(message) {
    lapBanner.textContent = message;
    lapBanner.classList.remove('show');
    void lapBanner.offsetWidth;
    lapBanner.classList.add('show');
    setTimeout(() => lapBanner.classList.remove('show'),1750);
  }

  function updateItemSlot() {
    const labels = { turbo: ['NITRO', 'BOOST!'], shield: ['SHIELD', 'BLOCK!'], shock: ['SHOCK', 'ZAP!'] };
    const item = labels[state.heldItem];
    itemSlot.classList.toggle('empty', !item);
    itemSlot.querySelector('strong').textContent = state.roulette > 0 ? ['?', '⚡', 'N₂O', '◆'][Math.floor(state.time / 75) % 4] : (item ? item[0] : '?');
    itemSlot.querySelector('span').textContent = state.roulette > 0 ? 'ROLLING' : (item ? item[1] : 'EMPTY');
  }

  function useItem() {
    if (!state.heldItem || state.roulette > 0 || !state.raceActive) return;
    if (state.heldItem === 'turbo') { state.turbo = 2.1; showReaction('NITRO!'); }
    if (state.heldItem === 'shield') { state.shield = 5; showReaction('GUARD!'); }
    if (state.heldItem === 'shock') { rival.hit = 1; rival.speed *= .55; showReaction('ZAAAP!'); playCrashSound(); }
    state.heldItem = '';
    updateItemSlot();
  }
  itemSlot.addEventListener('click', useItem);
  updateItemSlot();

  const speedRatio = () => Math.min(1, state.speed / state.maxSpeed);
  const horizonY = () => h * (.39 - speedRatio() * .075);
  const courseProgress = () => ((state.distance % 1800) + 1800) % 1800;
  function currentZone() {
    const p = courseProgress();
    if (selectedCourse === 'utsunomiya') {
      if (p >= 360 && p < 680) return 'LIGHTLINE CROSSING';
      if (p >= 900 && p < 1290) return 'OYA STONE CAVE';
      return 'UTSUNOMIYA NIGHT DRIVE';
    }
    if (p >= 380 && p < 790) return 'MOMIJI BRIDGE';
    if (p >= 1020 && p < 1320) return 'SHINKANSEN CROSSING';
    return 'NASUSHIOBARA SUNSET';
  }
  const onBridge = () => selectedCourse === 'nasu' && currentZone() === 'MOMIJI BRIDGE';

  function roadCurve(z) {
    const world = state.distance * 1.75;
    return Math.sin(world * .018 + z * .026) * .58 + Math.sin(world * .007 + z * .011) * .4;
  }

  function roadProjection(z, side = 0) {
    const horizon = horizonY();
    const p = 1 - Math.max(0, Math.min(150, z)) / 150;
    const bottom = h * 1.04;
    const y = horizon + Math.pow(p, 1.72) * (bottom - horizon);
    const widthFactor = onBridge() ? .39 : .62;
    const roadWidth = w * (.035 + Math.pow(p, 1.28) * (widthFactor + speedRatio() * .05));
    const center = w / 2 + roadCurve(z) * w * .22 * Math.pow(p, .45) - state.position * w * .22;
    return { p, y, roadWidth, x: center + roadWidth * side };
  }

  function drawSky() {
    const horizon = horizonY();
    const background = selectedCourse === 'utsunomiya' ? utsunomiyaBackground : nasuBackground;
    if (background.complete && background.naturalWidth) {
      const scale = Math.max(w / background.naturalWidth, (h * .72) / background.naturalHeight);
      const dw = background.naturalWidth * scale;
      const dh = background.naturalHeight * scale;
      const pan = Math.sin(state.distance * .002) * w * .035;
      ctx.drawImage(background, (w - dw) / 2 + pan, horizon - dh * .58, dw, dh);
    }
    const sky = ctx.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, 'rgba(16,9,36,.44)');
    sky.addColorStop(.55, 'rgba(87,36,79,.2)');
    sky.addColorStop(1, 'rgba(243,106,39,.18)');
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

    ctx.fillStyle = 'rgba(36,20,47,.72)';
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    for (let x = 0; x <= w; x += w / 10) {
      const y = horizon - (Math.sin(x * .015) * 15 + 25 + ((x / (w / 10)) % 3) * 18);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, horizon);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(18,13,25,.86)';
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
    const maxRoadWidth = (onBridge() ? .39 : .62) + speedRatio() * .05;

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

      ctx.fillStyle = onBridge() ? (rumble ? '#12091a' : '#09050e') : (currentZone() === 'OYA STONE CAVE' ? '#17141b' : (rumble ? '#235739' : '#173d27'));
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

      ctx.fillStyle = onBridge() ? (rumble ? '#5a4433' : '#6f5138') : (rumble ? '#2c2933' : '#3b3742');
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

  function drawBridgeRails() {
    if (currentZone() !== 'MOMIJI BRIDGE') return;
    const horizon = horizonY();
    ctx.save();
    ctx.strokeStyle = '#24101d';
    ctx.lineWidth = Math.max(3, w * .006);
    [-1, 1].forEach(side => {
      ctx.beginPath();
      for (let z = 145; z >= 0; z -= 5) {
        const p = roadProjection(z, side * 1.05);
        const y = p.y - (1 - z / 150) * h * .11;
        if (z === 145) ctx.moveTo(p.x, y); else ctx.lineTo(p.x, y);
      }
      ctx.stroke();
    });
    for (let z = 140; z > 4; z -= 13) {
      [-1, 1].forEach(side => {
        const a = roadProjection(z, side * 1.05);
        const b = roadProjection(Math.max(0, z - 7), side * 1.05);
        ctx.lineWidth = Math.max(1, a.p * 5);
        ctx.beginPath(); ctx.moveTo(a.x, a.y - a.p * h * .11); ctx.lineTo(b.x, b.y); ctx.stroke();
      });
    }
    ctx.fillStyle = '#ff5526';
    ctx.fillRect(w * .12, horizon - h * .17, w * .035, h * .25);
    ctx.fillRect(w * .845, horizon - h * .17, w * .035, h * .25);
    ctx.restore();
  }

  function trainPhase() { return (state.time * .00032) % 1; }
  function drawTrainCrossing() {
    const shinkansen = currentZone() === 'SHINKANSEN CROSSING';
    const lightline = currentZone() === 'LIGHTLINE CROSSING';
    if (!shinkansen && !lightline) return;
    const progress = courseProgress();
    const distanceTo = (shinkansen ? 1170 : 520) - progress;
    if (distanceTo < -35 || distanceTo > 150) return;
    const point = roadProjection(Math.max(2, distanceTo));
    const scale = .25 + point.p * 1.25;
    const phase = trainPhase();
    const trainX = -w * .75 + phase * w * (shinkansen ? 2.5 : 2.05);
    ctx.save();
    ctx.translate(0, point.y - 48 * scale);
    ctx.fillStyle = '#20212a';
    ctx.fillRect(0, 35 * scale, w, 5 * scale);
    ctx.fillStyle = shinkansen ? '#f3f2e9' : '#ffd52a';
    ctx.beginPath();
    ctx.moveTo(trainX, 0); ctx.lineTo(trainX + (shinkansen?430:300) * scale, 0); ctx.quadraticCurveTo(trainX + (shinkansen?500:330) * scale, 12 * scale, trainX + (shinkansen?525:342) * scale, 34 * scale); ctx.lineTo(trainX, 34 * scale); ctx.closePath(); ctx.fill();
    ctx.fillStyle = shinkansen ? '#164982' : '#232b37'; ctx.fillRect(trainX + 35 * scale, 8 * scale, (shinkansen?430:270) * scale, 10 * scale);
    ctx.fillStyle = shinkansen ? '#d7242e' : '#ece5c8'; ctx.fillRect(trainX + 25 * scale, 27 * scale, (shinkansen?455:295) * scale, 3 * scale);
    ctx.fillStyle = '#111a27';
    for (let x = 55; x < (shinkansen?430:280); x += 35) ctx.fillRect(trainX + x * scale, 7 * scale, 22 * scale, 8 * scale);
    ctx.strokeStyle = '#fff225'; ctx.lineWidth = 4 * scale;
    [-1,1].forEach(side => { const px = point.x + side * point.roadWidth * 1.08; ctx.beginPath(); ctx.moveTo(px, 44 * scale); ctx.lineTo(px, -42 * scale); ctx.stroke(); });
    ctx.restore();
  }

  function drawOyaCave() {
    if (currentZone() !== 'OYA STONE CAVE') return;
    const horizon = horizonY();
    ctx.save();
    ctx.fillStyle = 'rgba(5,5,10,.72)'; ctx.fillRect(0,0,w,horizon*.85);
    ctx.fillStyle = '#27242d';
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(w*.22,0); ctx.lineTo(w*.33,horizon*.62); ctx.lineTo(w*.25,h); ctx.lineTo(0,h); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(w,0); ctx.lineTo(w*.78,0); ctx.lineTo(w*.67,horizon*.62); ctx.lineTo(w*.75,h); ctx.lineTo(w,h); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#3e3943';
    for(let i=0;i<8;i++){const x=i%2?w*(.75+(i%4)*.06):w*(.04+(i%4)*.06);const y=horizon*.3+(i%3)*h*.18;ctx.fillRect(x,y,w*.045,h*.09);}
    ctx.fillStyle='#f2b23c';
    [w*.31,w*.69].forEach(x=>{ctx.beginPath();ctx.arc(x,horizon*.72,6,0,Math.PI*2);ctx.fill();});
    ctx.restore();
  }

  function drawItemPickup() {
    const distanceTo = state.nextItem - state.distance;
    if (distanceTo <= 0 || distanceTo > 150) return;
    const p = roadProjection(distanceTo, state.itemLane * .6);
    const size = 7 + p.p * 55;
    ctx.save();
    ctx.translate(p.x, p.y - size * .75);
    ctx.rotate(state.time * .004);
    ctx.fillStyle = '#65eff2'; ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(2,size*.08);
    ctx.beginPath(); ctx.moveTo(0,-size*.62); ctx.lineTo(size*.5,0); ctx.lineTo(0,size*.62); ctx.lineTo(-size*.5,0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.rotate(-state.time * .004);
    ctx.fillStyle = '#ff1c83'; ctx.font = `900 ${size*.72}px Impact`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('?',0,0);
    ctx.restore();
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
  const lapLength = 1800;

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
    const rivalPoint = pointOnTrack((rival.distance % lapLength) / lapLength);
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
    mapCtx.save();
    mapCtx.translate(rivalPoint[0], rivalPoint[1]);
    mapCtx.rotate(Math.PI / 4);
    mapCtx.fillStyle = '#ff3ec8';
    mapCtx.strokeStyle = '#fff';
    mapCtx.lineWidth = 2;
    mapCtx.fillRect(-5, -5, 10, 10);
    mapCtx.strokeRect(-5, -5, 10, 10);
    mapCtx.restore();
    lapCount.textContent = state.currentLap === 3 ? 'FINAL LAP' : `LAP ${state.currentLap}/3`;
  }

  function drawRival() {
    const relative = rival.distance - state.distance;
    const rivalSprite = selectedDriver === 'woman' ? speedCarSprite : carSprites.steering[2];
    if (relative <= 1 || relative > 150 || !rivalSprite.complete || !rivalSprite.naturalWidth) return;
    const point = roadProjection(relative, rival.lane * .58);
    const size = 18 + point.p * Math.min(210, h * .48);
    const hitProgress = rival.hit > 0 ? 1 - rival.hit : 0;
    ctx.save();
    ctx.translate(point.x, point.y - size * .56);
    if (rival.hit > 0) {
      ctx.translate(Math.sin(hitProgress * 34) * size * .08, 0);
      ctx.rotate(Math.sin(hitProgress * 24) * .24);
    }
    ctx.drawImage(rivalSprite, -size / 2, -size / 2, size, size);
    if (rival.hit > 0) {
      ctx.strokeStyle = '#fff229';
      ctx.lineWidth = Math.max(2, size * .025);
      for (let i = 0; i < 7; i++) {
        const angle = i / 7 * Math.PI * 2 + hitProgress * 5;
        const inner = size * .34;
        const outer = size * (.45 + (i % 3) * .07);
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
        ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function currentCarSprite() {
    if (selectedDriver === 'speedster') return speedCarSprite;
    if (selectedDriver === 'woman') {
      if (state.spin > 0) {
        const frames=[womanCarAngles.rearLeft,womanCarAngles.sideLeft,womanCarAngles.front,womanCarAngles.sideRight,womanCarAngles.rearRight,womanCarAngles.sideRight,womanCarAngles.front,womanCarAngles.sideLeft];
        const progress=1-state.spin/state.spinDuration;
        return frames[Math.floor(progress*frames.length)%frames.length];
      }
      if (state.jump > 0) {
        const progress=1-state.jump/state.jumpDurationCurrent;
        return progress>.28&&progress<.78?womanCarAngles.underside:womanCarAngles.rearLeft;
      }
      return state.steerVisual<-.35?womanCarAngles.rearRight:womanCarAngles.rearLeft;
    }
    if (selectedDriver === 'dog') {
      if (state.spin > 0) {
        const frames = [dogCarAngles.rear,dogCarAngles.sideLeft,dogCarAngles.front,dogCarAngles.sideRight,dogCarAngles.rearRight,dogCarAngles.sideRight,dogCarAngles.front,dogCarAngles.sideLeft];
        const progress = 1-state.spin/state.spinDuration;
        return frames[Math.floor(progress*frames.length)%frames.length];
      }
      if (state.jump > 0) {
        const progress = 1-state.jump/state.jumpDurationCurrent;
        return progress>.28 && progress<.78 ? dogCarAngles.underside : dogCarAngles.rear;
      }
      if (state.steerVisual < -.55) return dogCarAngles.rearRight;
      return dogCarAngles.rear;
    }
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
    const rescueHeight = state.rescue > 0 ? h * (.18 + Math.sin((2.4-state.rescue)*4)*.025) : 0;
    const x = w / 2 - size / 2 + state.position * w * .052;
    const y = h - size - Math.max(14, h * .015) + speedBounce - jumpHeight - rescueHeight;
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    if (state.spin > 0) ctx.rotate(Math.sin((1 - state.spin / state.spinDuration) * Math.PI * 2) * .08);
    if (sprite.complete && sprite.naturalWidth) ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
    drawSponsorPlate(size);
    ctx.restore();
  }

  function drawRescueRig() {
    if (state.rescue <= 0) return;
    const x = w/2 + state.position*w*.052;
    const y = h*.28 + Math.sin(state.time*.01)*5;
    ctx.save();
    ctx.strokeStyle='#f8c52b';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y+26);ctx.lineTo(x,h*.58);ctx.stroke();
    ctx.fillStyle='#171019';ctx.strokeStyle='#fff0cc';ctx.lineWidth=3;ctx.fillRect(x-48,y-17,96,34);ctx.strokeRect(x-48,y-17,96,34);
    ctx.fillStyle='#ff4b12';ctx.fillRect(x-35,y-8,70,16);
    ctx.fillStyle='#f8c52b';ctx.font='900 13px Impact';ctx.textAlign='center';ctx.fillText('RIOT RESCUE',x,y+4);
    ctx.fillStyle='#65e2dc';ctx.beginPath();ctx.arc(x-52,y,14,0,Math.PI*2);ctx.arc(x+52,y,14,0,Math.PI*2);ctx.fill();
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
    if (fromRamp) showReaction('BIG AIR!');
    if (navigator.vibrate) navigator.vibrate(35);
  }

  function triggerSpin() {
    state.spin = state.spinDuration;
    state.spinCooldown = 2.2;
    state.speed *= .72;
    state.shake = 15;
    setDriverMood('angry', 1.15);
    showToast('WILD SPIN!', 1.05);
    showReaction('WHOA!!');
    if (navigator.vibrate) navigator.vibrate([45, 35, 65]);
  }

  function triggerRivalCollision() {
    if (state.signatureActive > 0 && drivers[selectedDriver].ability.type === 'power') {
      rival.hit = 2.1; rival.collisionCooldown = 1.5; rival.speed *= .38; state.speed *= .93; state.shake = 18;
      setDriverMood('happy', 1.2); setRivalMood('angry', 1.6);
      showToast('RAM JAM! RIVAL STUNNED!', 1.05); showReaction('BOOM!!'); playCrashSound();
      if (navigator.vibrate) navigator.vibrate([45, 25, 80]);
      return;
    }
    if (state.shield > 0) {
      rival.hit = 1; rival.speed *= .55; state.shake = 10; showReaction('BLOCK!'); playCrashSound(); return;
    }
    rival.hit = 1;
    rival.collisionCooldown = 1.25;
    rival.speed *= .68;
    state.speed *= .7;
    state.shake = 22;
    state.position += state.position < rival.lane ? -.2 : .2;
    setDriverMood('angry', 1.25);
    setRivalMood('angry', 1.35);
    showToast('KRAAASH!!', 1.05);
    showReaction('KRAAASH!!');
    playCrashSound();
    if (navigator.vibrate) navigator.vibrate([70, 30, 100]);
  }

  function receiveRivalItemAttack() {
    const intellectGuard = state.signatureActive > 0 && drivers[selectedDriver].ability.type === 'intellect';
    if (intellectGuard || state.shield > 0) {
      showToast(intellectGuard ? 'BRAIN SHIELD! ATTACK CANCELLED!' : 'SHIELD BLOCKED THE HIT!', 1.15);
      showReaction('NOPE!!');
      setDriverMood('happy', 1.15);
      playCountTone(720, .16);
      return;
    }
    state.speed *= .58;
    triggerSpin();
    playCrashSound();
    showReaction('CHEAP SHOT!!');
  }

  function updateRivalItems(dt, relative) {
    rival.turbo = Math.max(0, rival.turbo - dt);
    if (rival.heldItem) {
      rival.useItemTimer -= dt;
      if (rival.useItemTimer <= 0) {
        const item = rival.heldItem;
        rival.heldItem = '';
        rival.itemTimer = 6.5 + Math.random() * 5;
        if (item === 'turbo') {
          rival.turbo = 2.4;
          showToast('RIVAL FIRED NITRO!', .9);
        } else if (Math.abs(relative) < 190) {
          receiveRivalItemAttack();
        }
      }
      return;
    }
    rival.itemTimer -= dt;
    if (rival.itemTimer > 0) return;
    rival.heldItem = Math.random() < .52 ? 'shock' : 'turbo';
    rival.useItemTimer = 1.55;
    if (state.stealArmed) stealRivalItem();
    else showToast(`RIVAL GOT ${rival.heldItem.toUpperCase()}!`, .85);
  }

  function updateRival(dt) {
    const relativeBefore = rival.distance - state.distance;
    updateRivalItems(dt, relativeBefore);
    rival.laneTimer -= dt;
    if (rival.laneTimer <= 0) {
      rival.targetLane = -.72 + Math.random() * 1.44;
      rival.laneTimer = 1.7 + Math.random() * 2.4;
    }
    rival.lane += (rival.targetLane - rival.lane) * Math.min(1, dt * 1.25);

    const speedBuild = Math.min(100, state.distance * .18);
    let targetSpeed = 190 + speedBuild + Math.sin(state.time * .00062) * 30;
    if (rival.turbo > 0) targetSpeed += 105;
    if (relativeBefore < -24) targetSpeed += 45;
    if (relativeBefore > 145) targetSpeed -= 45;
    if (rival.hit > 0) targetSpeed *= .68;
    targetSpeed = Math.max(145, Math.min(355, targetSpeed));
    rival.speed += (targetSpeed - rival.speed) * Math.min(1, dt * .9);
    rival.distance += rival.speed * dt / 5.2;

    rival.hit = Math.max(0, rival.hit - dt * 1.25);
    rival.collisionCooldown = Math.max(0, rival.collisionCooldown - dt);
    if (rival.moodTimer > 0) {
      rival.moodTimer -= dt;
      if (rival.moodTimer <= 0) setRivalMood('neutral');
    }

    let relative = rival.distance - state.distance;
    const lateralGap = Math.abs(state.position - rival.lane);
    const collided = Math.abs(relative) < 11 && lateralGap < .42 && state.jump === 0 && rival.collisionCooldown === 0;
    if (collided) {
      triggerRivalCollision();
    } else if (rival.previousRelative > 3 && relative <= -3) {
      setDriverMood('happy', 1.3);
      setRivalMood('angry', 1.3);
      showToast('OVERTAKE!', .95);
      showReaction('PASS!!');
    } else if (rival.previousRelative < -3 && relative >= 3) {
      setDriverMood('angry', 1.2);
      setRivalMood('happy', 1.35);
      showToast('HE BLEW PAST!', .95);
      showReaction('TOO SLOW!');
    }

    if (relative < -135) {
      rival.distance = state.distance + 155;
      relative = 155;
    } else if (relative > 245) {
      rival.distance = state.distance + 115;
      relative = 115;
    }
    rival.previousRelative = relative;
  }

  function update(dt) {
    if (!state.running) return;
    if (state.paused) return;
    state.time += dt * 1000;
    if (state.finished) {
      state.speed = Math.max(0,state.speed-180*dt);
      speedEl.textContent = Math.round(state.speed);
      speedNeedle.style.transform = `rotate(${-125 + speedRatio()*250}deg)`;
      return;
    }
    if (!state.raceActive) {
      startGirls.src = Math.floor(state.time/170)%2 ? './assets/ui/start-flag-women.png' : './assets/ui/start-flag-women-frame2.png';
      state.countdown -= dt;
      const mark = state.countdown > .58 ? Math.max(1, Math.floor(state.countdown)) : 0;
      if (mark !== state.countdownMark) {
        state.countdownMark = mark;
        countdownEl.textContent = mark ? String(mark) : 'START!';
        countdownEl.classList.remove('show'); void countdownEl.offsetWidth; countdownEl.classList.add('show');
        playCountTone(mark ? 300 + (3 - mark) * 70 : 660, mark ? .1 : .24);
      }
      if (state.countdown <= 0) {
        state.raceActive = true; state.speed = 55;
        countdownEl.classList.remove('show');
        document.querySelector('#game-shell').classList.remove('counting');
        showReaction('GO!!');
      }
      return;
    }
    if (state.signatureActive > 0) {
      state.signatureActive = Math.max(0, state.signatureActive - dt);
      if (state.signatureActive === 0) {
        driverCard.classList.remove('signature-fired');
        showToast(`${drivers[selectedDriver].ability.name} COMPLETE`, .7);
      }
      updateSignatureButton();
    }
    if (state.rescue > 0) {
      state.rescue = Math.max(0,state.rescue-dt);
      state.speed = 0;
      state.position += (0-state.position)*Math.min(1,dt*2.2);
      if (state.rescue === 0) { state.position=0; state.speed=55; setDriverMood('neutral'); showReaction('SAFE!'); }
      return;
    }
    state.previousDistance = state.distance;
    const roadLimit = onBridge() ? .68 : 1.04;
    const onRoad = Math.abs(state.position) < roadLimit;
    const steeringTarget = input.left ? -2 : input.right ? 2 : 0;
    state.steerVisual += (steeringTarget - state.steerVisual) * Math.min(1, dt * 9);

    const speedSignature = state.signatureActive > 0 && drivers[selectedDriver].ability.type === 'speed';
    if (input.gas) state.speed += ((speedSignature ? 220 : 155) * setupStats.accel - state.speed * (speedSignature ? .12 : .22)) * dt;
    if (speedSignature) state.speed += 145 * dt;
    if (state.turbo > 0) state.speed += 125 * dt;
    else state.speed -= 9 * dt;
    if (input.brake) state.speed -= 150 * dt;
    if (!onRoad) state.speed -= (105 / setupStats.dirt) * dt;
    if (state.spin > 0) state.speed -= 85 * dt;
    const speedLimitBoost = Math.max(state.turbo > 0 ? 1.15 : 1, speedSignature ? 1.28 : 1);
    state.speed = Math.max(0, Math.min(state.maxSpeed * speedLimitBoost, state.speed));

    const steerPower = (.72 + speedRatio() * 1.55) * setupStats.grip * dt;
    if (state.spin <= 0) {
      if (input.left) state.position -= steerPower;
      if (input.right) state.position += steerPower;
    }
    state.position += roadCurve(0) * speedRatio() * .25 * dt;
    state.position = Math.max(-1.62, Math.min(1.62, state.position));
    state.distance += state.speed * dt / 5.2;
    const newLap = Math.min(3,Math.floor(state.distance/lapLength)+1);
    if (newLap !== state.currentLap) {
      state.currentLap = newLap;
      if (newLap === 3) { showLapBanner('FINAL LAP!'); showReaction('LET\'S FINISH!!'); playCountTone(760,.32); }
      else { showLapBanner(`LAP ${newLap}`); playCountTone(540,.2); }
    }
    if (state.distance >= lapLength*3) {
      state.distance = lapLength*3; state.finished = true;
      setDriverMood('happy',5); showLapBanner('FINISH!!'); showReaction('WE DID IT!!'); playCountTone(880,.5);
      return;
    }
    updateRival(dt);

    if (onBridge() && Math.abs(state.position) > .79 && state.jump === 0) {
      state.rescue = 2.4; state.speed = 0; state.shake = 18;
      setDriverMood('angry',2.4); showReaction('HELP!!'); showToast('RIOT RESCUE INBOUND!',1.5);
      if(navigator.vibrate) navigator.vibrate([80,40,80]);
      return;
    }

    if (state.previousDistance < state.nextItem && state.distance >= state.nextItem) {
      if (Math.abs(state.position - state.itemLane) < .55) {
        state.roulette = 1.05; state.heldItem = ''; showReaction('ITEM!');
      }
      state.nextItem += 360 + Math.random() * 160;
      state.itemLane = -.75 + Math.random() * 1.5;
    }
    if (state.roulette > 0) {
      state.roulette = Math.max(0,state.roulette-dt);
      if (state.roulette === 0) {
        const items = ['turbo','shield','shock']; state.heldItem = items[Math.floor(Math.random()*items.length)];
        showReaction(state.heldItem.toUpperCase() + '!');
      }
      updateItemSlot();
    }
    state.turbo = Math.max(0,state.turbo-dt);
    state.shield = Math.max(0,state.shield-dt);
    state.trainHitCooldown = Math.max(0,state.trainHitCooldown-dt);

    const zoneProgress = courseProgress();
    const hazardCenter = currentZone() === 'SHINKANSEN CROSSING' ? 1170 : 520;
    const railZone = currentZone() === 'SHINKANSEN CROSSING' || currentZone() === 'LIGHTLINE CROSSING';
    const trainDanger = railZone && Math.abs(zoneProgress - hazardCenter) < 9 && trainPhase() > .18 && trainPhase() < .8;
    if (trainDanger && state.jump === 0 && state.trainHitCooldown === 0) {
      state.trainHitCooldown = 3; state.speed *= .18; triggerSpin(); playCrashSound(); showReaction('WHAAAM!!');
    }

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
    if (!onBridge() && Math.abs(state.position) > 1.42 && state.speed > 145 && state.spinCooldown === 0 && state.jump === 0) triggerSpin();

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
    speedNeedle.style.transform = `rotate(${-125 + speedRatio() * 250}deg)`;
    distanceEl.textContent = (state.distance / 100).toFixed(1);
    zoneName.textContent = currentZone();
    drawCourseMap();
  }

  function render() {
    ctx.save();
    if (state.shake > 0) ctx.translate((Math.random() - .5) * state.shake, (Math.random() - .5) * state.shake);
    drawSky();
    drawRoad();
    drawOyaCave();
    drawBridgeRails();
    drawRamp();
    drawRoadside();
    drawTrainCrossing();
    drawItemPickup();
    drawRival();
    drawSpeedLines();
    drawCar();
    drawRescueRig();
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
