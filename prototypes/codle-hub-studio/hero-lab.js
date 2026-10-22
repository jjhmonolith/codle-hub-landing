import * as THREE from './vendor/three/three.module.min.js';

// A local, real-time web experiment, not a HyperFrames/video composition.
// All geometry and lighting are original procedural work. No remote models,
// generated images, trackers or product-data dependencies.
const $ = (id) => document.getElementById(id);
const stage = $('experiments');
const canvas = $('lab-canvas');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const TAU = Math.PI * 2;
const COUNT = 192;
const state = { mode: 'class', frequency: 2.4, joined: 0, pulses: 0, paused: reduced.matches, visible: true, lost: false, dragging: false };
const motion = { x: -.23, y: -.48, tx: -.23, ty: -.48, pointerX: 0, pointerY: 0, phase: 0, time: 0, assembly: [0, 0, 0, 0], wave: 0 };
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
} catch {
  $('status').textContent = '이 브라우저에서는 3D 체험을 표시할 수 없어요. 아래 링크에서 교육 프로그램을 살펴보세요.';
  document.querySelectorAll('.modes button, .controls button, .controls input, #pause').forEach(e => e.disabled = true);
}
if (renderer) init();

function init() {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.13;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#080c17');
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 80);
  camera.position.set(0, 0, 15.2);
  const sculpture = new THREE.Group();
  scene.add(sculpture);

  // Large reflected studio panels draw the curvature of the machined ribs.
  const studio = new THREE.Scene();
  studio.background = new THREE.Color('#111a32');
  const studioObjects = [];
  function softbox(x, y, z, width, height, color, strength) {
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(strength), side: THREE.DoubleSide }));
    panel.position.set(x, y, z); panel.lookAt(0, 0, 0); studio.add(panel); studioObjects.push(panel);
  }
  softbox(-7, 8, 7, 5, 16, '#e7f0ff', 6);
  softbox(7, 4, 5, 3, 15, '#ffffff', 5);
  softbox(0, 10, -4, 16, 4, '#a0baff', 4);
  softbox(-4, -6, 3, 12, 2, '#426aff', 2);
  softbox(6, -2, -7, 4, 9, '#5065fc', 3);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(studio, .035, .1, 60);
  scene.environment = environment.texture;
  pmrem.dispose();
  studioObjects.forEach(o => { o.geometry.dispose(); o.material.dispose(); });
  scene.add(new THREE.HemisphereLight('#a7c4ff', '#02030a', 1.1));
  const key = new THREE.DirectionalLight('#eef4ff', 3.7); key.position.set(-5, 7, 8); scene.add(key);
  const rim = new THREE.DirectionalLight('#6183ff', 3.2); rim.position.set(5, -1, -5); scene.add(rim);
  const fill = new THREE.DirectionalLight('#f1f5ff', 1.3); fill.position.set(4, 1, 8); scene.add(fill);

  // Each rib is a bevelled, solid piece. Repetition forms one continuous
  // twisted sculpture, not a cloud of unrelated decorative objects.
  const path = new THREE.Shape();
  const w = .067, h = .5, r = .042;
  path.moveTo(-w + r, -h); path.lineTo(w - r, -h); path.quadraticCurveTo(w, -h, w, -h + r);
  path.lineTo(w, h - r); path.quadraticCurveTo(w, h, w - r, h); path.lineTo(-w + r, h);
  path.quadraticCurveTo(-w, h, -w, h - r); path.lineTo(-w, -h + r); path.quadraticCurveTo(-w, -h, -w + r, -h);
  const geometry = new THREE.ExtrudeGeometry(path, { depth: .18, bevelEnabled: true, bevelSize: .025, bevelThickness: .025, bevelSegments: 3, curveSegments: 6, steps: 1 });
  geometry.center(); geometry.computeVertexNormals();
  const material = new THREE.MeshPhysicalMaterial({ metalness: .79, roughness: .23, clearcoat: 1, clearcoatRoughness: .15, envMapIntensity: 1.25 });
  const ribs = new THREE.InstancedMesh(geometry, material, COUNT);
  ribs.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  ribs.frustumCulled = false;
  sculpture.add(ribs);
  const baseColors = [];
  for (let i = 0; i < COUNT; i++) {
    const t = i / COUNT;
    const color = new THREE.Color(t > .24 && t < .46 ? '#e5ebf5' : t > .69 && t < .78 ? '#5e7ff2' : '#1643e5');
    baseColors.push(color); ribs.setColorAt(i, color);
  }

  // A quiet technical floor establishes scale and orientation.
  const floor = new THREE.GridHelper(65, 80, '#182845', '#111b2e');
  floor.position.y = -5.4; floor.position.z = -4;
  floor.material.transparent = true; floor.material.opacity = .36;
  scene.add(floor);
  const haloGeometry = new THREE.RingGeometry(4.9, 4.91, 180);
  const halo = new THREE.Mesh(haloGeometry, new THREE.MeshBasicMaterial({ color: '#5979b4', transparent: true, opacity: .14, side: THREE.DoubleSide }));
  halo.position.z = -3; halo.scale.set(1.2, 1, 1); scene.add(halo);

  const transform = new THREE.Object3D();
  const tangent = new THREE.Vector3(), vertical = new THREE.Vector3(), normal = new THREE.Vector3();
  const basis = new THREE.Matrix4();
  const color = new THREE.Color();
  const pointer = new THREE.Vector2(10, 10);
  const ray = new THREE.Raycaster();
  const waves = [];
  let frame = 0, previous = 0, settleUntil = 0, mobile = false;
  let pointerStart = null, dragged = false, hitIndex = null;
  let pulseUntil = 0;

  function geometryAt(dt) {
    const ease = reduced.matches ? 1 : 1 - Math.exp(-dt * 6);
    motion.x += (motion.tx - motion.x) * ease;
    motion.y += (motion.ty - motion.y) * ease;
    motion.phase += (state.frequency - motion.phase) * ease;
    motion.wave += ((state.mode === 'wave' ? 1 : 0) - motion.wave) * ease;
    for (let q = 0; q < 4; q++) {
      const target = state.mode === 'build' && q >= state.joined ? 1 : 0;
      motion.assembly[q] += (target - motion.assembly[q]) * ease;
    }
    const time = motion.time;
    const phase = motion.phase;
    sculpture.rotation.set(motion.x + motion.pointerY * .025, motion.y + motion.pointerX * .035, -.16);
    sculpture.position.set(mobile ? .25 : .8, mobile ? -.4 : -.15, 0);
    const sculptScale = mobile ? .76 : 1.16;
    sculpture.scale.set(sculptScale * 1.16, sculptScale, sculptScale);
    for (let i = 0; i < COUNT; i++) {
      const angle = i / COUNT * TAU;
      const quadrant = Math.floor(i / (COUNT / 4));
      const separated = motion.assembly[quadrant];
      let pulse = 0;
      for (const wave of waves) {
        const distance = Math.min(Math.abs(angle - wave.angle), TAU - Math.abs(angle - wave.angle));
        const age = time - wave.time;
        pulse += Math.exp(-Math.pow(distance - age * 2.2, 2) * 9) * Math.exp(-age * .85) * Math.sin(age * 8 - distance * 3) * .7;
      }
      const breath = Math.sin(time * .48 + angle * 2) * .055;
      const radius = 2.9 + .22 * Math.cos(angle * 3 + phase * .6) + separated * 1.15 + pulse * .2;
      const twist = angle * .5 + .32 * Math.sin(angle * 3) + Math.sin(angle * phase) * .34 + motion.wave * .2 * Math.sin(angle * 5 - time * .8);
      const cx = Math.cos(angle), sy = Math.sin(angle);
      transform.position.set(cx * radius, sy * radius * .83, .58 * Math.sin(angle * 2) + breath + separated * Math.sin(quadrant * 2) * .8 + pulse);
      tangent.set(-sy, cx, 0).normalize();
      vertical.set(cx * Math.cos(twist), sy * Math.cos(twist), Math.sin(twist)).normalize();
      normal.crossVectors(tangent, vertical).normalize();
      vertical.crossVectors(normal, tangent).normalize();
      basis.makeBasis(tangent, vertical, normal);
      transform.quaternion.setFromRotationMatrix(basis);
      const length = 2.65 + .6 * Math.sin(angle * 3 + phase * .45) + pulse * 1.4 + motion.wave * .35 * Math.cos(angle * 4 - time);
      transform.scale.set(1 - separated * .10, length, 1 + Math.max(0, pulse) * .35);
      transform.updateMatrix(); ribs.setMatrixAt(i, transform.matrix);
      color.copy(baseColors[i]);
      if (state.mode === 'build' && separated > .05) color.lerp(new THREE.Color('#626d88'), separated * .72);
      if (pulse > .02) color.lerp(new THREE.Color('#c9eaff'), Math.min(pulse * .7, .6));
      ribs.setColorAt(i, color);
    }
    ribs.instanceMatrix.needsUpdate = true; ribs.instanceColor.needsUpdate = true;
    while (waves.length && time - waves[0].time > 5) waves.shift();
  }

  function render(now) {
    frame = 0;
    if (!state.visible || document.hidden || state.lost) { previous = 0; return; }
    const dt = Math.min((now - (previous || now - 16)) / 1000, .045); previous = now;
    // Pause stops ambient drift, but deliberate actions can still settle.
    if (!state.paused || now < pulseUntil) motion.time += dt;
    geometryAt(dt);
    renderer.render(scene, camera);
    if (!state.paused || state.dragging || now < settleUntil || now < pulseUntil) frame = requestAnimationFrame(render);
    else previous = 0;
  }
  function wake() {
    settleUntil = performance.now() + (reduced.matches ? 80 : 1600);
    if (!frame && state.visible && !document.hidden && !state.lost) frame = requestAnimationFrame(render);
  }
  function resize() {
    const { width, height } = stage.getBoundingClientRect();
    mobile = width < 640;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = mobile ? 18.7 : 15.2;
    camera.fov = mobile ? 41 : 34;
    camera.updateProjectionMatrix();
    wake();
  }
  new ResizeObserver(resize).observe(stage);

  const modes = {
    class: { kicker: '01 / CHANGE A VARIABLE', title: '내가 바꾼 값이,<br>새로운 형태로.', instruction: '드래그해서 돌리고, 아래 값으로 형태를 바꿔 보세요.', formula: 'form = sin(angle × frequency)', link: '코들 수업 플랫폼 살펴보기', href: 'https://codle.io/' },
    build: { kicker: '02 / BUILD SOMETHING', title: '흩어진 생각을,<br>하나의 작품으로.', instruction: '조각을 클릭하거나 연결 버튼으로 하나씩 조립해 보세요.', formula: 'pieces → connect → create', link: '짓다 AI 해커톤 살펴보기', href: 'https://landing.jitda.io/' },
    wave: { kicker: '03 / TRY & DISCOVER', title: '직접 해보면,<br>경험이 되니까.', instruction: '작품을 눌러 파동을 만들고, 드래그해서 반응을 관찰해 보세요.', formula: 'touch → ripple → discover', link: '코들 AI 캠프 살펴보기', href: 'https://contents.codle.io/aicamp-landing' }
  };
  function changeMode(mode) {
    state.mode = mode; stage.dataset.mode = mode;
    const content = modes[mode];
    $('mode-kicker').textContent = content.kicker; $('mode-title').innerHTML = content.title;
    $('instruction').textContent = content.instruction; $('formula').textContent = content.formula;
    $('program-link').innerHTML = `${content.link} <span>↗</span>`; $('program-link').href = content.href;
    document.querySelectorAll('[data-mode][aria-pressed]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
    ['class', 'build', 'wave'].forEach(name => $(`${name}-controls`).hidden = name !== mode);
    $('pointer-hint').textContent = mode === 'class' ? 'DRAG' : mode === 'build' ? 'CONNECT' : 'TOUCH';
    $('announcement').textContent = content.instruction;
    if (mode === 'wave' && !reduced.matches) pulse(TAU * .65, false);
    wake();
  }
  document.querySelectorAll('.modes button').forEach(button => button.addEventListener('click', () => changeMode(button.dataset.mode)));
  $('frequency').addEventListener('input', e => {
    state.frequency = Number(e.target.value); $('frequency-output').value = state.frequency.toFixed(1); wake();
  });
  function updateBuild() {
    $('build-progress').textContent = `${state.joined} / 4 조립됨`;
    $('connect').innerHTML = state.joined === 4 ? '다시 조립하기 <span>↺</span>' : '조각 연결하기 <span>＋</span>';
    $('formula').textContent = state.joined === 4 ? '4 pieces → 1 creation' : 'pieces → connect → create';
  }
  function connect() {
    state.joined = state.joined === 4 ? 0 : state.joined + 1;
    updateBuild();
    $('announcement').textContent = state.joined === 4 ? '네 조각이 하나의 작품으로 연결됐어요.' : `${state.joined}개의 조각이 연결됐어요.`;
    wake();
  }
  $('connect').addEventListener('click', connect);
  function pulse(angle = TAU * .2, count = true) {
    if (waves.length >= 8) waves.shift();
    waves.push({ angle, time: motion.time });
    if (count) { state.pulses++; $('wave-count').textContent = `${state.pulses}번의 작은 실험`; }
    // Reduced-motion keeps deliberate feedback brief and static.
    if (reduced.matches) { waves[waves.length - 1].time -= .15; } else pulseUntil = performance.now() + 4800;
    wake();
  }
  $('pulse').addEventListener('click', () => pulse((state.pulses * 1.9 + .7) % TAU));
  function pointerAt(e) {
    const rect = canvas.getBoundingClientRect();
    pointer.set((e.clientX - rect.left) / rect.width * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    motion.pointerX = pointer.x; motion.pointerY = pointer.y;
    const hint = $('pointer-hint');
    hint.style.transform = `translate(${e.clientX - rect.left - 31}px,${e.clientY - rect.top - 31}px)`;
    $('coord').textContent = `x ${pointer.x.toFixed(2)}   y ${pointer.y.toFixed(2)}`;
  }
  canvas.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    pointerAt(e); dragged = false; state.dragging = true;
    pointerStart = { x: e.clientX, y: e.clientY, rx: motion.tx, ry: motion.ty };
    ray.setFromCamera(pointer, camera); hitIndex = ray.intersectObject(ribs)[0]?.instanceId ?? null;
    canvas.setPointerCapture(e.pointerId); canvas.classList.add('dragging'); wake();
  });
  canvas.addEventListener('pointermove', e => {
    pointerAt(e);
    if (e.pointerType === 'mouse') $('pointer-hint').classList.add('visible');
    if (state.dragging && pointerStart) {
      const dx = e.clientX - pointerStart.x, dy = e.clientY - pointerStart.y;
      if (Math.hypot(dx, dy) > 5) dragged = true;
      motion.ty = pointerStart.ry + dx * .0045;
      motion.tx = THREE.MathUtils.clamp(pointerStart.rx + dy * .0035, -1.2, 1.2);
    }
    wake();
  }, { passive: true });
  function release(e, cancelled = false) {
    if (!state.dragging) return;
    if (!cancelled && !dragged) {
      if (state.mode === 'build' && hitIndex !== null) connect();
      if (state.mode === 'wave') pulse(hitIndex !== null ? hitIndex / COUNT * TAU : ((Math.atan2(pointer.y, pointer.x) + TAU) % TAU));
    }
    state.dragging = false; pointerStart = null; canvas.classList.remove('dragging');
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    wake();
  }
  canvas.addEventListener('pointerup', e => release(e));
  canvas.addEventListener('pointercancel', e => release(e, true));
  canvas.addEventListener('lostpointercapture', e => release(e, true));
  canvas.addEventListener('pointerleave', () => { $('pointer-hint').classList.remove('visible'); motion.pointerX = 0; motion.pointerY = 0; wake(); });
  canvas.addEventListener('keydown', e => {
    let handled = true;
    if (e.key === 'ArrowLeft') motion.ty -= .18;
    else if (e.key === 'ArrowRight') motion.ty += .18;
    else if (e.key === 'ArrowUp') motion.tx = Math.max(-1.2, motion.tx - .14);
    else if (e.key === 'ArrowDown') motion.tx = Math.min(1.2, motion.tx + .14);
    else if (e.key === ' ' || e.key === 'Enter') {
      if (state.mode === 'build') connect();
      else if (state.mode === 'wave') pulse();
      else { state.frequency = state.frequency >= 6 ? 1 : Math.min(6, state.frequency + .5); $('frequency').value = state.frequency; $('frequency-output').value = state.frequency.toFixed(1); }
    } else if (e.key === 'Escape') reset();
    else handled = false;
    if (handled) { e.preventDefault(); wake(); }
  });
  function reset() {
    motion.tx = -.23; motion.ty = -.48; motion.pointerX = 0; motion.pointerY = 0;
    state.frequency = 2.4; state.joined = 0; state.pulses = 0; waves.length = 0; pulseUntil = 0;
    $('frequency').value = '2.4'; $('frequency-output').value = '2.4';
    $('wave-count').textContent = '직접 파동을 만들어 보세요'; updateBuild();
    $('formula').textContent = modes[state.mode].formula;
    $('announcement').textContent = '현재 체험을 처음 상태로 되돌렸어요.'; wake();
  }
  $('reset').addEventListener('click', reset);
  function updatePause() {
    $('pause').setAttribute('aria-pressed', String(state.paused));
    $('pause').setAttribute('aria-label', state.paused ? '자동 움직임 켜기' : '자동 움직임 멈추기');
    $('pause').textContent = state.paused ? '▷' : 'Ⅱ';
    $('pause').disabled = reduced.matches;
    wake();
  }
  $('pause').addEventListener('click', () => { state.paused = !state.paused; updatePause(); });
  reduced.addEventListener('change', () => { state.paused = reduced.matches; waves.length = 0; pulseUntil = 0; updatePause(); });
  new IntersectionObserver(([entry]) => {
    state.visible = entry.isIntersecting;
    if (!state.visible) { cancelAnimationFrame(frame); frame = 0; previous = 0; } else wake();
  }).observe(stage);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; previous = 0; } else wake();
  });
  canvas.addEventListener('webglcontextlost', e => {
    e.preventDefault(); state.lost = true; cancelAnimationFrame(frame); frame = 0;
    $('status').hidden = false; $('status').textContent = '3D 연결이 중단됐어요. 새로고침하면 다시 체험할 수 있습니다.';
  });
  motion.phase = state.frequency;
  resize(); geometryAt(.016); renderer.render(scene, camera);
  $('status').hidden = true; stage.dataset.ready = 'true';
  changeMode('class'); updatePause();
}
