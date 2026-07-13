/**
 * Hero background: animated node network (Three.js)
 * Scoped entirely to #hero-canvas inside the hero section.
 */
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

const canvas = document.getElementById('hero-canvas');

if (canvas) {
  const hero = canvas.closest('.hero');
  const accent = 0xc0a300; // matches --accent-color
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (hero) {
    hero.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  let isDragging = false;
  const dragSensitivity = 0.005;
  const lastPointer = { x: 0, y: 0 };

  if (hero) {
    hero.addEventListener('mousedown', (e) => {
      if (e.button !== 2) return;
      isDragging = true;
      lastPointer.x = e.clientX;
      lastPointer.y = e.clientY;
    });
  }

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastPointer.x;
    const dy = e.clientY - lastPointer.y;
    lastPointer.x = e.clientX;
    lastPointer.y = e.clientY;
    group.rotation.y += dx * dragSensitivity;
    group.rotation.x += dy * dragSensitivity;
  });

  window.addEventListener('mouseup', (e) => {
    if (e.button === 2) isDragging = false;
  });
  window.addEventListener('blur', () => { isDragging = false; });

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.z = 10;

  const group = new THREE.Group();
  scene.add(group);

  const isSmall = window.innerWidth < 768;
  const pointCount = isSmall ? 70 : 150;
  const bounds = { x: 9, y: 5, z: 4 };
  const linkDistance = 2.4;

  const positions = new Float32Array(pointCount * 3);
  for (let i = 0; i < pointCount; i++) {
    positions[i * 3] = (Math.random() * 2 - 1) * bounds.x;
    positions[i * 3 + 1] = (Math.random() * 2 - 1) * bounds.y;
    positions[i * 3 + 2] = (Math.random() * 2 - 1) * bounds.z;
  }

  const pointsGeometry = new THREE.BufferGeometry();
  pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pointsMaterial = new THREE.PointsMaterial({
    color: accent,
    size: 0.06,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.85,
  });
  group.add(new THREE.Points(pointsGeometry, pointsMaterial));

  const linkPositions = [];
  for (let i = 0; i < pointCount; i++) {
    const ax = positions[i * 3], ay = positions[i * 3 + 1], az = positions[i * 3 + 2];
    for (let j = i + 1; j < pointCount; j++) {
      const bx = positions[j * 3], by = positions[j * 3 + 1], bz = positions[j * 3 + 2];
      const dist = Math.hypot(ax - bx, ay - by, az - bz);
      if (dist < linkDistance) {
        linkPositions.push(ax, ay, az, bx, by, bz);
      }
    }
  }
  const linesGeometry = new THREE.BufferGeometry();
  linesGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linkPositions), 3));
  const linesMaterial = new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.18 });
  group.add(new THREE.LineSegments(linesGeometry, linesMaterial));

  const mouse = { x: 0, y: 0 };
  const targetCamera = { x: 0, y: 0 };
  window.addEventListener('pointermove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  });

  // --- Hero nav icons: the same Bootstrap Icons used in the sidebar for
  // About/Resume/Portfolio/Contact, extruded into wireframe 3D shapes. ---
  const navItems = Array.from(document.querySelectorAll('#hero-nav .hero-nav-item'));
  const navSpheres = [];
  const navBaseColor = new THREE.Color(accent);
  const navHoverColor = new THREE.Color(0xffe066);
  const navTargetSize = 1.1; // world-space footprint, matches the previous sphere's diameter

  // bi-person, bi-file-earmark-text, bi-images, bi-envelope (twbs/icons, MIT)
  const navIconPaths = [
    ['M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z'],
    [
      'M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5',
      'M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z',
    ],
    [
      'M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3',
      'M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2M14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1M2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1z',
    ],
    ['M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z'],
  ];

  function buildNavIconGroup(paths) {
    const iconGroup = new THREE.Group();
    const material = new THREE.MeshBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0.85,
    });

    // Parse each "d" string via a tiny wrapper SVG (one shape set per path),
    // and bake the Y-flip (SVG is Y-down) straight into each geometry's
    // vertices so the group's own transform stays purely position/rotation -
    // that's what makes the rotation pivot land on the icon's true center.
    const geometries = [];
    paths.forEach((d) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="${d}"/></svg>`;
      const svgData = new SVGLoader().parse(svg);
      svgData.paths.forEach((path) => {
        SVGLoader.createShapes(path).forEach((shape) => {
          const geometry = new THREE.ExtrudeGeometry(shape, { depth: 2, bevelEnabled: false, curveSegments: 8 });
          geometry.scale(1, -1, 1);
          geometries.push(geometry);
        });
      });
    });

    const box = new THREE.Box3();
    geometries.forEach((geometry) => {
      geometry.computeBoundingBox();
      box.union(geometry.boundingBox);
    });
    const center = box.getCenter(new THREE.Vector3());
    geometries.forEach((geometry) => {
      geometry.translate(-center.x, -center.y, -center.z);
      iconGroup.add(new THREE.Mesh(geometry, material));
    });

    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const baseScale = navTargetSize / maxDim;

    return { group: iconGroup, material, baseScale };
  }

  if (navItems.length) {
    navItems.forEach((item, i) => {
      const slot = item.querySelector('.hero-nav-slot');
      const paths = navIconPaths[i % navIconPaths.length];
      if (!slot || !paths) return;

      const { group: iconGroup, material, baseScale } = buildNavIconGroup(paths);
      scene.add(iconGroup);

      const state = { mesh: iconGroup, material, baseScale, slot, hover: 0, hovering: false, wigglePhase: i * 1.3 };
      navSpheres.push(state);

      item.addEventListener('mouseenter', () => { state.hovering = true; });
      item.addEventListener('mouseleave', () => { state.hovering = false; });
      item.addEventListener('focus', () => { state.hovering = true; });
      item.addEventListener('blur', () => { state.hovering = false; });
    });
  }

  const ndcVector = new THREE.Vector3();
  // localX/localY are pixels relative to the hero element's own box (NOT the
  // viewport), so this stays correct regardless of page scroll position.
  function localToWorld(localX, localY, z) {
    const width = hero ? hero.clientWidth : window.innerWidth;
    const height = hero ? hero.clientHeight : window.innerHeight;
    ndcVector.set((localX / width) * 2 - 1, -(localY / height) * 2 + 1, 0.5);
    ndcVector.unproject(camera);
    const dir = ndcVector.sub(camera.position).normalize();
    const distance = (z - camera.position.z) / dir.z;
    return camera.position.clone().add(dir.multiplyScalar(distance));
  }

  // Slot positions are cached relative to the hero box and only recomputed on
  // resize/layout change - never read live during the render loop, so
  // scrolling the page (which only moves the hero within the viewport, not
  // within itself) can't perturb the icons.
  function updateNavSlotOffsets() {
    if (!navSpheres.length || !hero) return;
    const heroRect = hero.getBoundingClientRect();
    navSpheres.forEach((state) => {
      const slotRect = state.slot.getBoundingClientRect();
      state.localX = slotRect.left - heroRect.left + slotRect.width / 2;
      state.localY = slotRect.top - heroRect.top + slotRect.height / 2;
    });
  }

  function updateNavSpheres(delta) {
    if (!navSpheres.length) return;
    navSpheres.forEach((state) => {
      if (state.localX !== undefined) {
        state.mesh.position.copy(localToWorld(state.localX, state.localY, 3));
      }

      const target = state.hovering ? 1 : 0;
      state.hover += (target - state.hover) * Math.min(delta * 6, 1);

      state.mesh.scale.setScalar(state.baseScale * (1 + state.hover * 0.22));
      state.material.opacity = 0.75 + state.hover * 0.25;
      state.material.color.lerpColors(navBaseColor, navHoverColor, state.hover);

      if (!reduceMotion) {
        // Slow, small idle wiggle rather than a continuous spin - fast
        // rotation makes an asymmetric icon shape unrecognizable most of
        // the time, unlike the old rotationally-symmetric sphere.
        state.age = (state.age || 0) + delta;
        state.mesh.rotation.y = Math.sin(state.age * 1.4 + state.wigglePhase) * 0.18;
        state.mesh.rotation.x = Math.cos(state.age * 1.1 + state.wigglePhase) * 0.1;
        state.mesh.rotation.z = Math.sin(state.age * 0.9 + state.wigglePhase) * 0.12;
      }
    });
  }

  function resize() {
    const width = hero ? hero.clientWidth : window.innerWidth;
    const height = hero ? hero.clientHeight : window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    updateNavSlotOffsets();
  }
  resize();
  window.addEventListener('resize', resize);
  // AOS fade-in / web font swaps can shift the label layout slightly after
  // the first paint; re-measure once things settle.
  window.addEventListener('load', updateNavSlotOffsets);
  setTimeout(updateNavSlotOffsets, 600);

  let running = true;
  if ('IntersectionObserver' in window && hero) {
    const observer = new IntersectionObserver(
      (entries) => { running = entries[0].isIntersecting; },
      { threshold: 0 }
    );
    observer.observe(hero);
  }

  let lastTime = performance.now();
  function animate(now) {
    requestAnimationFrame(animate);
    if (!running) return;

    const delta = (now - lastTime) / 1000;
    lastTime = now;

    if (!reduceMotion && !isDragging) {
      group.rotation.y += delta * 0.05;
      group.rotation.x += delta * 0.01;
    }

    targetCamera.x += (mouse.x * 0.8 - targetCamera.x) * 0.03;
    targetCamera.y += (-mouse.y * 0.5 - targetCamera.y) * 0.03;
    camera.position.x = targetCamera.x;
    camera.position.y = targetCamera.y;
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld(); // force-refresh before unprojecting, render() would otherwise do this too late

    updateNavSpheres(delta);

    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);
}
