import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { buildCast, type CharDef, type Pose, type Pt, type Step, type ZoneId } from './cast';

/*
  "People make performance": a miniature office whose state is driven by one number, s ∈ [0, 3].
    0 fragmented  → four department islands, drifting apart, each tinted differently
    1 aligned     → islands lock together, corridors fill the gaps, people cross departments
    2 leadership  → a hub table rises, leaders from every team gather, connections arc to the centre
    3 performance → a skyline of growth bars rises behind the organisation
  Characters run on looping scripts (cast.ts) and chase their scripted target, so switching scripts
  between stages makes them walk to their new place rather than teleport.
*/

export type OfficeScene = {
  setStage(s: number): void;
  setPointer(x: number, y: number): void;
  setActive(on: boolean): void;
  dispose(): void;
};

type Options = { reduced: boolean; compact: boolean; onReady?: () => void };

const COLORS = {
  floorJoined: new THREE.Color('#F7F5EF'),
  floors: { A: '#D9E2EE', B: '#EDE2CF', C: '#DFE8D3', D: '#EFDDD6' } as Record<string, string>,
  plinth: '#1B2F50',
  white: '#FBFAF6',
  navy: '#1B2F50',
  ink: '#111D32',
  wood: '#D8C3A0',
  plant: '#7F9E62',
  plantDark: '#5F7F4A',
  pot: '#E4DDCD',
  soft: '#C7D1E0',
  rug: '#E5EAF1',
  blue: '#4169E1',
  lime: '#B9D96C',
  glass: '#BCD0EE',
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const range = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);
const easeOutBack = (t: number) => {
  const c = 1.4;
  return t <= 0 ? 0 : 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};
const damp = (dt: number, k: number) => 1 - Math.exp(-dt * k);
const lerpAngle = (a: number, b: number, t: number) => {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
};

/* ── Geometry helpers ─────────────────────────────────────────────── */

function prep(g: THREE.BufferGeometry) {
  const n = g.index ? g.toNonIndexed() : g;
  for (const key of Object.keys(n.attributes)) if (!['position', 'normal', 'uv'].includes(key)) n.deleteAttribute(key);
  if (!n.attributes.uv) {
    n.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array((n.attributes.position.count) * 2), 2));
  }
  return n;
}

function rbox(w: number, h: number, d: number, r = 0.03) {
  return new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2, h / 2, d / 2) * 0.98);
}

function at(g: THREE.BufferGeometry, x: number, y: number, z: number, ry = 0) {
  if (ry) g.rotateY(ry);
  g.translate(x, y, z);
  return g;
}

class Buckets {
  private map = new Map<string, THREE.BufferGeometry[]>();
  add(key: string, ...geos: THREE.BufferGeometry[]) {
    const list = this.map.get(key) ?? [];
    geos.forEach((g) => list.push(prep(g)));
    this.map.set(key, list);
  }
  build(materials: Record<string, THREE.Material>, parent: THREE.Object3D) {
    for (const [key, list] of this.map) {
      const merged = mergeGeometries(list);
      list.forEach((g) => g.dispose());
      if (!merged) continue;
      const mesh = new THREE.Mesh(merged, materials[key]);
      const transparent = (materials[key] as THREE.MeshStandardMaterial).transparent;
      mesh.castShadow = !transparent;
      mesh.receiveShadow = !transparent;
      parent.add(mesh);
    }
  }
}

/* Furniture, in a zone's local space (y = 0 is the floor). Each piece rotates around its own centre. */
function local(b: Buckets, key: string, g: THREE.BufferGeometry, x: number, y: number, z: number, ry: number, ox = 0, oz = 0) {
  g.translate(ox, y, oz);
  if (ry) g.rotateY(ry);
  g.translate(x, 0, z);
  b.add(key, g);
}

function desk(b: Buckets, x: number, z: number, ry = 0) {
  local(b, 'white', rbox(1.0, 0.05, 0.56, 0.02), x, 0.47, z, ry);
  local(b, 'navy', rbox(0.04, 0.45, 0.5, 0.015), x, 0.225, z, ry, -0.46);
  local(b, 'navy', rbox(0.04, 0.45, 0.5, 0.015), x, 0.225, z, ry, 0.46);
}
function monitor(b: Buckets, x: number, z: number, ry = 0) {
  local(b, 'ink', rbox(0.5, 0.3, 0.03, 0.012), x, 0.72, z, ry);
  local(b, 'ink', rbox(0.05, 0.12, 0.05, 0.01), x, 0.55, z, ry, 0, -0.02);
}
function chair(b: Buckets, x: number, z: number, ry = 0) {
  local(b, 'navy', rbox(0.4, 0.07, 0.4, 0.025), x, 0.25, z, ry);
  local(b, 'navy', rbox(0.4, 0.36, 0.06, 0.025), x, 0.46, z, ry, 0, -0.19);
  local(b, 'ink', new THREE.CylinderGeometry(0.03, 0.03, 0.22, 8), x, 0.11, z, ry);
  local(b, 'ink', new THREE.CylinderGeometry(0.17, 0.17, 0.03, 16), x, 0.015, z, ry);
}
function plant(b: Buckets, x: number, z: number, s = 1) {
  local(b, 'pot', new THREE.CylinderGeometry(0.16 * s, 0.12 * s, 0.3 * s, 16), x, 0.15 * s, z, 0);
  const leaves: [number, number, number, number][] = [
    [0, 0.48, 0, 0.21], [0.1, 0.62, 0.05, 0.16], [-0.09, 0.66, -0.04, 0.15], [0.02, 0.8, 0.02, 0.12],
  ];
  leaves.forEach(([lx, ly, lz, r], i) =>
    local(b, i % 2 ? 'plantDark' : 'plant', new THREE.IcosahedronGeometry(r * s, 1), x + lx * s, ly * s, z + lz * s, 0),
  );
}
function roundTable(b: Buckets, x: number, z: number, r: number, h: number) {
  local(b, 'white', new THREE.CylinderGeometry(r, r, 0.05, 32), x, h, z, 0);
  local(b, 'navy', new THREE.CylinderGeometry(0.05, 0.05, h, 10), x, h / 2, z, 0);
  local(b, 'navy', new THREE.CylinderGeometry(r * 0.45, r * 0.5, 0.03, 24), x, 0.015, z, 0);
}
function sofa(b: Buckets, x: number, z: number, ry = 0) {
  local(b, 'soft', rbox(1.5, 0.26, 0.62, 0.07), x, 0.13, z, ry);
  local(b, 'soft', rbox(1.5, 0.36, 0.16, 0.06), x, 0.36, z, ry, 0, -0.24);
  local(b, 'soft', rbox(0.16, 0.36, 0.62, 0.06), x, 0.2, z, ry, -0.72);
  local(b, 'soft', rbox(0.16, 0.36, 0.62, 0.06), x, 0.2, z, ry, 0.72);
}

/* ── The environment ─────────────────────────────────────────────── */

const ZW = 6.4;
const ZD = 4.6;
const JOINED: Record<'A' | 'B' | 'C' | 'D', [number, number]> = { A: [-3.9, -3.0], B: [3.9, -3.0], C: [-3.9, 3.0], D: [3.9, 3.0] };
const APART: Record<'A' | 'B' | 'C' | 'D', [number, number, number, number]> = {
  // x, z, lift, rotation
  A: [-5.3, -4.25, 0.42, 0.07],
  B: [5.2, -4.05, 0.14, -0.06],
  C: [-5.1, 4.15, 0.06, -0.05],
  D: [5.4, 4.3, 0.28, 0.06],
};

type Zone = { id: 'A' | 'B' | 'C' | 'D'; group: THREE.Group; floor: THREE.MeshStandardMaterial; tint: THREE.Color };

function buildZone(id: 'A' | 'B' | 'C' | 'D', mats: Record<string, THREE.Material>) {
  const group = new THREE.Group();
  const b = new Buckets();
  const floorMat = new THREE.MeshStandardMaterial({ color: COLORS.floors[id], roughness: 0.92 });
  const floor = new THREE.Mesh(rbox(ZW, 0.06, ZD, 0.03), floorMat);
  floor.position.y = -0.03;
  floor.receiveShadow = true;
  group.add(floor);
  b.add('plinth', at(rbox(ZW - 0.04, 0.46, ZD - 0.04, 0.05), 0, -0.29, 0));

  const extras: { door?: THREE.Object3D; doorAt?: [number, number]; slides?: THREE.Object3D[]; slideAt?: [number, number] } = {};

  if (id === 'A') {
    // Open-plan workspace: two back-to-back desk rows.
    [-1.9, -0.75, 0.4].forEach((x) => {
      desk(b, x, -0.75);
      monitor(b, x, -0.58, Math.PI);
      chair(b, x, -1.32);
      desk(b, x, -0.17);
      monitor(b, x, -0.34);
      chair(b, x, 0.4, Math.PI);
    });
    local(b, 'soft', rbox(3.5, 0.22, 0.04, 0.015), -0.75, 0.6, -0.46, 0);
    local(b, 'white', rbox(3.2, 0.46, 0.4, 0.03), -0.9, 0.23, -2.0, 0);
    local(b, 'wood', rbox(3.24, 0.03, 0.42, 0.012), -0.9, 0.475, -2.0, 0);
    plant(b, 2.6, -1.8, 1.15);
    plant(b, -2.75, 1.75, 1);
    plant(b, 1.5, -2.0, 0.7);
    // Standing whiteboard.
    local(b, 'white', rbox(0.95, 0.6, 0.04, 0.02), 2.2, 0.95, 0.9, -0.5);
    local(b, 'navy', rbox(0.04, 0.7, 0.04, 0.01), 2.2, 0.35, 0.9, -0.5, -0.42);
    local(b, 'navy', rbox(0.04, 0.7, 0.04, 0.01), 2.2, 0.35, 0.9, -0.5, 0.42);
    local(b, 'blue', rbox(0.5, 0.03, 0.01, 0.005), 2.2, 1.05, 0.9, -0.5, -0.1, 0.025);
    local(b, 'lime', rbox(0.3, 0.03, 0.01, 0.005), 2.2, 0.95, 0.9, -0.5, -0.2, 0.025);
  }

  if (id === 'B') {
    // Glass meeting room with a hinged door, and two desks outside.
    const glassWall = (w: number, x: number, z: number, ry: number) => {
      local(b, 'glass', rbox(w, 0.95, 0.03, 0.01), x, 0.5, z, ry);
      local(b, 'navy', rbox(w, 0.04, 0.05, 0.01), x, 0.99, z, ry);
    };
    local(b, 'white', rbox(3.7, 1.0, 0.08, 0.02), 1.15, 0.5, -2.15, 0);
    local(b, 'white', rbox(0.08, 1.0, 3.15, 0.02), 3.0, 0.5, -0.575, 0);
    glassWall(3.15, -0.7, -0.575, Math.PI / 2);
    glassWall(0.6, -0.4, 1.0, 0);
    glassWall(2.3, 1.85, 1.0, 0);
    local(b, 'navy', rbox(0.06, 1.0, 0.06, 0.01), -0.1, 0.5, 1.0, 0);
    local(b, 'navy', rbox(0.06, 1.0, 0.06, 0.01), 0.7, 0.5, 1.0, 0);
    local(b, 'white', rbox(2.0, 0.05, 0.9, 0.03), 1.25, 0.47, -0.6, 0);
    local(b, 'navy', rbox(0.12, 0.45, 0.5, 0.03), 1.25, 0.225, -0.6, 0);
    [0.55, 1.25, 1.95].forEach((x) => {
      chair(b, x, -1.35);
      chair(b, x, 0.17, Math.PI);
    });
    local(b, 'ink', rbox(0.04, 0.62, 1.1, 0.01), 2.93, 0.78, -0.6, 0);
    local(b, 'screen', rbox(0.02, 0.54, 1.0, 0.005), 2.905, 0.78, -0.6, 0);
    desk(b, -2.2, -1.2);
    monitor(b, -2.2, -1.37);
    chair(b, -2.2, -0.62, Math.PI);
    plant(b, -2.8, 1.75, 1);
    plant(b, 2.7, 1.75, 0.9);
    // The door: a pivot at the hinge, panel extending toward +x.
    const door = new THREE.Group();
    door.position.set(-0.07, 0, 1.0);
    const panel = new THREE.Mesh(rbox(0.74, 0.93, 0.03, 0.01), mats.glassDoor);
    panel.position.set(0.39, 0.49, 0);
    const handle = new THREE.Mesh(rbox(0.03, 0.16, 0.05, 0.01), mats.navy);
    handle.position.set(0.68, 0.5, 0);
    door.add(panel, handle);
    group.add(door);
    extras.door = door;
    extras.doorAt = [0.3, 1.0];
  }

  if (id === 'C') {
    // Collaboration: a standing table, a lounge and a coffee counter.
    roundTable(b, 0.6, -0.2, 0.46, 0.62);
    local(b, 'rug', new THREE.CylinderGeometry(1.05, 1.05, 0.012, 48), -1.85, 0.006, 1.2, 0);
    sofa(b, -2.2, 1.65, Math.PI);
    local(b, 'wood', new THREE.CylinderGeometry(0.3, 0.3, 0.04, 24), -1.7, 0.24, 0.95, 0);
    local(b, 'navy', new THREE.CylinderGeometry(0.04, 0.04, 0.22, 8), -1.7, 0.11, 0.95, 0);
    local(b, 'white', rbox(2.3, 0.56, 0.5, 0.03), -1.45, 0.28, -1.95, 0);
    local(b, 'wood', rbox(2.34, 0.03, 0.52, 0.012), -1.45, 0.575, -1.95, 0);
    local(b, 'ink', rbox(0.22, 0.28, 0.2, 0.02), -2.2, 0.73, -1.95, 0);
    [-1.9, -1.2, -0.5].forEach((x) => {
      local(b, 'navy', new THREE.CylinderGeometry(0.13, 0.13, 0.04, 16), x, 0.42, -1.48, 0);
      local(b, 'ink', new THREE.CylinderGeometry(0.025, 0.025, 0.4, 8), x, 0.2, -1.48, 0);
    });
    plant(b, 2.7, -1.8, 1.1);
    plant(b, 2.8, 1.8, 0.85);
    plant(b, -2.9, -0.4, 0.75);
  }

  if (id === 'D') {
    // Reception and entrance with sliding glass doors on the outer edge.
    local(b, 'white', rbox(1.7, 0.52, 0.55, 0.04), 1.0, 0.26, -1.35, 0);
    local(b, 'blue', rbox(1.72, 0.18, 0.02, 0.008), 1.0, 0.3, -1.07, 0);
    local(b, 'wood', rbox(1.74, 0.03, 0.6, 0.012), 1.0, 0.535, -1.35, 0);
    local(b, 'navy', rbox(0.06, 1.4, 0.08, 0.01), 3.05, 0.7, -0.75, 0);
    local(b, 'navy', rbox(0.06, 1.4, 0.08, 0.01), 3.05, 0.7, 0.75, 0);
    local(b, 'navy', rbox(0.08, 0.1, 1.6, 0.01), 3.05, 1.42, 0, 0);
    local(b, 'rug', rbox(0.9, 0.012, 1.3, 0.005), 2.45, 0.006, 0, 0);
    local(b, 'blue', rbox(0.06, 0.014, 1.1, 0.005), 2.05, 0.008, 0, 0);
    [1.8, 2.45].forEach((x) => chair(b, x, 1.75, Math.PI));
    desk(b, -1.8, -1.0);
    monitor(b, -1.8, -1.17);
    chair(b, -1.8, -0.43, Math.PI);
    desk(b, -0.6, -1.0);
    monitor(b, -0.6, -1.17);
    chair(b, -0.6, -0.43, Math.PI);
    plant(b, -2.8, 1.8, 1.1);
    plant(b, 2.75, -1.9, 0.9);
    plant(b, 0.2, 1.9, 0.7);
    const slides: THREE.Object3D[] = [];
    [-0.37, 0.37].forEach((z) => {
      const p = new THREE.Mesh(rbox(0.03, 1.32, 0.72, 0.01), mats.glassDoor);
      p.position.set(3.05, 0.68, z);
      group.add(p);
      slides.push(p);
    });
    extras.slides = slides;
    extras.slideAt = [3.0, 0];
  }

  b.build(mats, group);
  return { zone: { id, group, floor: floorMat, tint: new THREE.Color(COLORS.floors[id]) } as Zone, ...extras };
}

/* ── Characters: instanced body parts on one shared rig ──────────── */

const HIP = 0.435;

function torsoGeometry() {
  const pts = [
    [0, 0], [0.125, 0], [0.14, 0.05], [0.13, 0.18], [0.125, 0.26], [0.15, 0.4], [0.165, 0.47], [0.15, 0.535], [0.09, 0.565], [0, 0.575],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const g = new THREE.LatheGeometry(pts, 18);
  g.scale(1, 1, 0.68);
  return g;
}

function headGeometry() {
  const neck = new THREE.CylinderGeometry(0.045, 0.05, 0.09, 12).translate(0, 0.04, 0);
  const head = new THREE.SphereGeometry(0.098, 22, 16).scale(0.92, 1.06, 1).translate(0, 0.165, 0.004);
  return mergeGeometries([prep(neck), prep(head)])!;
}

function hairGeometry(long: boolean) {
  const cap = new THREE.SphereGeometry(0.104, 22, 12, 0, Math.PI * 2, 0, 1.5).scale(0.95, 1.02, 1.04);
  cap.rotateX(-0.32);
  cap.translate(0, 0.176, -0.006);
  const parts = [prep(cap)];
  if (long) {
    const back = new THREE.CapsuleGeometry(0.085, 0.13, 4, 12).scale(1.12, 1, 0.62).translate(0, 0.1, -0.052);
    parts.push(prep(back));
  }
  return mergeGeometries(parts)!;
}

type CharState = {
  def: CharDef;
  x: number; y: number; z: number;
  heading: number; phase: number; speed: number; sit: number;
  armL: [number, number]; armR: [number, number]; head: [number, number];
  ready: boolean;
};

/* ── Scene ───────────────────────────────────────────────────────── */

export function createOffice(mount: HTMLElement, opts: Options): OfficeScene {
  const { reduced, compact } = opts;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 1, 200);

  /* Lights */
  const hemi = new THREE.HemisphereLight('#ffffff', '#d9d2c3', 1.25);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff4e6', 2.1);
  sun.position.set(-9, 18, 11);
  sun.castShadow = true;
  sun.shadow.mapSize.set(compact ? 1024 : 2048, compact ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -13, right: 13, top: 13, bottom: -13, near: 2, far: 50 });
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.025;
  sun.shadow.radius = 4;
  scene.add(sun);
  const fill = new THREE.DirectionalLight('#dfe7ff', 0.55);
  fill.position.set(12, 6, 8);
  scene.add(fill);
  const warmKey = new THREE.Color('#fff4e6');
  const lateKey = new THREE.Color('#fff0d6');

  /* Materials */
  const std = (color: string, extra: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.78, metalness: 0, ...extra });
  const mats: Record<string, THREE.Material> = {
    plinth: std(COLORS.plinth, { roughness: 0.85 }),
    white: std(COLORS.white, { roughness: 0.6 }),
    navy: std(COLORS.navy, { roughness: 0.55 }),
    ink: std(COLORS.ink, { roughness: 0.4 }),
    wood: std(COLORS.wood, { roughness: 0.7 }),
    plant: std(COLORS.plant, { roughness: 0.9, flatShading: true }),
    plantDark: std(COLORS.plantDark, { roughness: 0.9, flatShading: true }),
    pot: std(COLORS.pot),
    soft: std(COLORS.soft, { roughness: 0.95 }),
    rug: std(COLORS.rug, { roughness: 1 }),
    blue: std(COLORS.blue, { roughness: 0.5 }),
    lime: std(COLORS.lime, { roughness: 0.6 }),
    screen: std('#2a4fc2', { emissive: '#4169E1', emissiveIntensity: 0.55, roughness: 0.3 }),
    glass: std(COLORS.glass, { transparent: true, opacity: 0.32, roughness: 0.1, depthWrite: false }),
    glassDoor: std(COLORS.glass, { transparent: true, opacity: 0.42, roughness: 0.1, depthWrite: false }),
  };

  /* Ground shadow catcher */
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShadowMaterial({ opacity: 0.1 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.53;
  ground.receiveShadow = true;
  scene.add(ground);

  const world = new THREE.Group();
  scene.add(world);

  /* Zones */
  const zoneData = (['A', 'B', 'C', 'D'] as const).map((id) => buildZone(id, mats));
  const zones = zoneData.map((z) => z.zone);
  zones.forEach((z) => world.add(z.group));
  const door = zoneData[1].door!;
  const doorAt = zoneData[1].doorAt!;
  const slides = zoneData[3].slides!;
  const slideAt = zoneData[3].slideAt!;

  /* Corridors fill the cross-shaped gap once the islands lock together. */
  const corridorMat = new THREE.MeshStandardMaterial({ color: COLORS.floorJoined, roughness: 0.92 });
  const makeStrip = (w: number, d: number) => {
    const g = new THREE.Group();
    const top = new THREE.Mesh(rbox(w, 0.06, d, 0.03), corridorMat);
    top.position.y = -0.03;
    top.receiveShadow = true;
    const body = new THREE.Mesh(rbox(w - 0.04, 0.46, d - 0.04, 0.05), mats.plinth);
    body.position.y = -0.29;
    body.castShadow = true;
    const inlay = new THREE.Mesh(rbox(w > d ? w - 1.2 : 0.05, 0.012, w > d ? 0.05 : d - 1.2, 0.004), mats.blue);
    inlay.position.y = 0.004;
    g.add(top, body, inlay);
    return g;
  };
  const stripX = makeStrip(14.2, 1.42);
  const stripZ = makeStrip(1.42, 10.6);
  world.add(stripX, stripZ);

  /* Hub: a disc, a ring and the leadership table that rises at stage 2. */
  const hub = new THREE.Group();
  const hubDisc = new THREE.Mesh(new THREE.CylinderGeometry(1.32, 1.32, 0.03, 64), mats.white);
  hubDisc.position.y = 0.016;
  hubDisc.receiveShadow = true;
  const ringMat = new THREE.MeshStandardMaterial({ color: COLORS.blue, emissive: COLORS.blue, emissiveIntensity: 0.4 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.32, 0.03, 8, 96), ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.035;
  const table = new THREE.Group();
  {
    const tb = new Buckets();
    roundTable(tb, 0, 0, 0.6, 0.62);
    tb.build(mats, table);
    const inlay = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.012, 32), mats.lime);
    inlay.position.y = 0.65;
    table.add(inlay);
  }
  hub.add(hubDisc, ring, table);
  world.add(hub);

  /* Connection arcs from every team to the hub, with pulses travelling along them. */
  const arcMat = new THREE.MeshStandardMaterial({ color: COLORS.blue, emissive: COLORS.blue, emissiveIntensity: 0.65, roughness: 0.4 });
  const arcs = (Object.keys(JOINED) as ('A' | 'B' | 'C' | 'D')[]).map((id) => {
    const [x, z] = JOINED[id];
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(x * 0.82, 1.45, z * 0.82),
      new THREE.Vector3(x * 0.45, 3.6, z * 0.45),
      new THREE.Vector3(0, 1.6, 0),
    );
    const geo = new THREE.TubeGeometry(curve, 64, 0.045, 8, false);
    const mesh = new THREE.Mesh(geo, arcMat);
    const pulse = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 12), mats.lime);
    world.add(mesh, pulse);
    return { curve, mesh, pulse, total: geo.index!.count };
  });

  /* Growth skyline behind the organisation (stage 3). */
  const skyline = new THREE.Group();
  const ledge = makeStrip(14.2, 1.1);
  ledge.children[2].visible = false;
  skyline.add(ledge);
  skyline.position.z = -5.85;
  const barColors = ['#C9D5EA', '#B3C4E6', '#9AB1E4', '#8099E2', '#6684E2', '#5274E1', '#4169E1', COLORS.lime];
  const bars = barColors.map((c, i) => {
    const h = 0.5 + Math.pow(i / 7, 1.35) * 4.1;
    const m = new THREE.Mesh(rbox(0.9, h, 0.7, 0.08), std(c, { roughness: 0.45, emissive: c, emissiveIntensity: i === 7 ? 0.25 : 0.08 }));
    m.geometry.translate(0, h / 2, 0);
    m.position.set(-6.0 + i * (12 / 7), 0, 0);
    m.castShadow = true;
    m.receiveShadow = true;
    skyline.add(m);
    return { mesh: m, h };
  });
  const trendPts = bars.map((b) => new THREE.Vector3(b.mesh.position.x, b.h + 0.55, 0));
  const trendCurve = new THREE.CatmullRomCurve3(trendPts);
  const trendGeo = new THREE.TubeGeometry(trendCurve, 120, 0.065, 8, false);
  const trend = new THREE.Mesh(trendGeo, arcMat);
  const trendTotal = trendGeo.index!.count;
  const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.55, 20), mats.lime);
  arrow.position.copy(trendPts[trendPts.length - 1]);
  const tan = trendCurve.getTangent(1);
  arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan.normalize());
  skyline.add(trend, arrow);
  world.add(skyline);

  /* Small upward indicators above each team. */
  const chevrons = zones.map(() => {
    const m = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.28, 4), mats.lime);
    m.castShadow = true;
    world.add(m);
    return m;
  });

  /* Characters */
  const cast = buildCast(compact);
  const N = cast.length;
  const partMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.72 });
  const skinMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.6 });
  const makeInst = (geo: THREE.BufferGeometry, count: number, mat = partMat) => {
    const m = new THREE.InstancedMesh(geo, mat, Math.max(1, count));
    m.castShadow = true;
    m.receiveShadow = true;
    m.frustumCulled = false;
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(m);
    return m;
  };
  const legGeo = new THREE.CapsuleGeometry(0.058, 0.3, 4, 10).translate(0, -0.208, 0);
  const armGeo = new THREE.CapsuleGeometry(0.044, 0.3, 4, 10).translate(0, -0.195, 0);
  const handGeo = new THREE.SphereGeometry(0.044, 10, 8).translate(0, -0.4, 0.004);
  const shoeGeo = rbox(0.1, 0.055, 0.17, 0.025).translate(0, -0.405, 0.028);
  const shirtGeo = rbox(0.1, 0.16, 0.03, 0.012).translate(0, 0.49, 0.098);
  const longIdx: number[] = [];
  const shortIdx: number[] = [];
  cast.forEach((c, i) => (c.look.longHair ? longIdx : shortIdx).push(i));

  const I = {
    torso: makeInst(torsoGeometry(), N),
    shirt: makeInst(shirtGeo, N),
    head: makeInst(headGeometry(), N, skinMat),
    hairS: makeInst(hairGeometry(false), shortIdx.length),
    hairL: makeInst(hairGeometry(true), longIdx.length),
    legs: makeInst(legGeo, N * 2),
    shoes: makeInst(shoeGeo, N * 2),
    arms: makeInst(armGeo, N * 2),
    hands: makeInst(handGeo, N * 2, skinMat),
  };
  const col = new THREE.Color();
  cast.forEach((c, i) => {
    I.torso.setColorAt(i, col.set(c.look.jacket));
    I.shirt.setColorAt(i, col.set(c.look.shirt));
    I.head.setColorAt(i, col.set(c.look.skin));
    I.legs.setColorAt(i * 2, col.set(c.look.trousers));
    I.legs.setColorAt(i * 2 + 1, col);
    I.shoes.setColorAt(i * 2, col.set(c.look.shoes));
    I.shoes.setColorAt(i * 2 + 1, col);
    I.arms.setColorAt(i * 2, col.set(c.look.sleeves ?? c.look.jacket));
    I.arms.setColorAt(i * 2 + 1, col);
    I.hands.setColorAt(i * 2, col.set(c.look.skin));
    I.hands.setColorAt(i * 2 + 1, col);
  });
  shortIdx.forEach((ci, k) => I.hairS.setColorAt(k, col.set(cast[ci].look.hair)));
  longIdx.forEach((ci, k) => I.hairL.setColorAt(k, col.set(cast[ci].look.hair)));
  Object.values(I).forEach((m) => m.instanceColor && (m.instanceColor.needsUpdate = true));
  if (!shortIdx.length) I.hairS.count = 0;
  if (!longIdx.length) I.hairL.count = 0;

  // One rig, posed and read back for every character each frame.
  const rig = new THREE.Object3D();
  const rTorso = new THREE.Object3D();
  rTorso.position.y = HIP - 0.03;
  const rHead = new THREE.Object3D();
  rHead.position.y = 0.94;
  rHead.rotation.order = 'YXZ';
  const rLegL = new THREE.Object3D();
  rLegL.position.set(-0.075, HIP, 0);
  const rLegR = new THREE.Object3D();
  rLegR.position.set(0.075, HIP, 0);
  const rArmL = new THREE.Object3D();
  rArmL.position.set(-0.168, 0.86, 0);
  const rArmR = new THREE.Object3D();
  rArmR.position.set(0.168, 0.86, 0);
  rig.add(rTorso, rHead, rLegL, rLegR, rArmL, rArmR);

  const states: CharState[] = cast.map((def) => ({
    def, x: 0, y: 0, z: 0, heading: 0, phase: Math.random() * 6, speed: 0, sit: 0,
    armL: [0, 0], armR: [0, 0], head: [0, 0], ready: false,
  }));

  /* ── Zone placement for a given s ── */
  const zoneT: Record<ZoneId, { x: number; y: number; z: number; r: number }> = {
    A: { x: 0, y: 0, z: 0, r: 0 }, B: { x: 0, y: 0, z: 0, r: 0 }, C: { x: 0, y: 0, z: 0, r: 0 }, D: { x: 0, y: 0, z: 0, r: 0 },
    H: { x: 0, y: 0, z: 0, r: 0 },
  };
  const resolve = (p: Pt, out: { x: number; y: number; z: number }) => {
    const t = zoneT[p[0]];
    const c = Math.cos(t.r);
    const s = Math.sin(t.r);
    out.x = t.x + p[1] * c + p[2] * s;
    out.z = t.z - p[1] * s + p[2] * c;
    out.y = t.y;
    return out;
  };

  let sTarget = 0;
  let s = 0;
  let px = 0;
  let py = 0;
  let pxT = 0;
  let pyT = 0;
  let time = 0;

  function applyStage(sv: number, t: number) {
    const join = smooth(range(sv, 0.05, 0.85));
    zones.forEach((z) => {
      const [ax, az, lift, rot] = APART[z.id];
      const [jx, jz] = JOINED[z.id];
      const bob = (1 - join) * Math.sin(t * 0.6 + jx) * 0.05;
      const zt = zoneT[z.id];
      zt.x = ax + (jx - ax) * join;
      zt.z = az + (jz - az) * join;
      zt.y = lift * (1 - join) + bob;
      zt.r = rot * (1 - join);
      z.group.position.set(zt.x, zt.y, zt.z);
      z.group.rotation.y = zt.r;
      z.floor.color.copy(z.tint).lerp(COLORS.floorJoined, smooth(range(sv, 0.35, 1.0)));
    });

    const grow = smooth(range(sv, 0.45, 1.0));
    stripX.visible = stripZ.visible = grow > 0.001;
    stripX.scale.set(Math.max(grow, 0.001), 1, 1);
    stripZ.scale.set(1, 1, Math.max(grow, 0.001));
    stripX.position.y = stripZ.position.y = (1 - grow) * -0.35;

    const hubIn = smooth(range(sv, 0.7, 1.15));
    hub.visible = hubIn > 0.001;
    hubDisc.scale.setScalar(Math.max(hubIn, 0.001));
    ring.scale.setScalar(Math.max(hubIn, 0.001) * (1 + (sv > 1.6 ? 0.025 * Math.sin(t * 2.2) : 0)));
    ringMat.emissiveIntensity = 0.3 + 0.5 * range(sv, 1.4, 2.0);
    const tableIn = easeOutBack(range(sv, 1.1, 1.55));
    table.visible = tableIn > 0.001;
    table.scale.setScalar(Math.max(tableIn, 0.001));

    const draw = range(sv, 1.15, 1.85);
    arcs.forEach((a, i) => {
      const n = Math.floor((a.total * Math.min(1, draw * 1.1 - i * 0.03)) / 48) * 48;
      a.mesh.visible = n > 0;
      a.mesh.geometry.setDrawRange(0, Math.max(0, n));
      const on = range(sv, 1.7, 1.9);
      a.pulse.visible = on > 0.01;
      a.curve.getPoint((t * 0.32 + i * 0.25) % 1, a.pulse.position);
      a.pulse.scale.setScalar(on);
    });

    const sky = range(sv, 2.0, 2.35);
    skyline.visible = sky > 0.001;
    skyline.position.y = (1 - smooth(sky)) * -0.6;
    bars.forEach((b, i) => {
      const g = easeOutBack(range(sv, 2.15 + i * 0.06, 2.55 + i * 0.06));
      b.mesh.scale.set(1, Math.max(g, 0.001), 1);
    });
    const tr = range(sv, 2.55, 2.95);
    const tn = Math.floor((trendTotal * tr) / 48) * 48;
    trend.visible = tn > 0;
    trend.geometry.setDrawRange(0, tn);
    arrow.visible = tr > 0.97;
    arrow.scale.setScalar(smooth(range(tr, 0.97, 1)));

    const chev = smooth(range(sv, 2.45, 2.85));
    chevrons.forEach((m, i) => {
      const z = zones[i];
      m.visible = chev > 0.001;
      m.scale.setScalar(Math.max(chev, 0.001));
      m.position.set(z.group.position.x, 2.05 + Math.sin(t * 1.6 + i) * 0.08 + (1 - chev) * -0.6, z.group.position.z);
      m.rotation.y = t * 0.8 + i;
    });

    sun.color.copy(warmKey).lerp(lateKey, range(sv, 2, 3));
    sun.intensity = 2.1 + 0.25 * range(sv, 2, 3);
  }

  /* ── Scripted behaviour ── */
  const tmpA = { x: 0, y: 0, z: 0 };
  const tmpB = { x: 0, y: 0, z: 0 };
  const tmpF = { x: 0, y: 0, z: 0 };

  function program(def: CharDef, stage: number): Step[] {
    for (let k = stage; k >= 0; k--) if (def.programs[k]) return def.programs[k]!;
    return def.programs[0]!;
  }

  function evaluate(steps: Step[], tt: number) {
    let total = 0;
    for (const st of steps) total += st.dur + st.hold;
    let t = total > 0 ? ((tt % total) + total) % total : 0;
    for (let i = 0; i < steps.length; i++) {
      const st = steps[i];
      if (t < st.dur) {
        const prev = steps[(i - 1 + steps.length) % steps.length];
        resolve(prev.to, tmpA);
        resolve(st.to, tmpB);
        const e = t / st.dur;
        return { x: tmpA.x + (tmpB.x - tmpA.x) * e, y: tmpA.y + (tmpB.y - tmpA.y) * e, z: tmpA.z + (tmpB.z - tmpA.z) * e, step: st, walking: true };
      }
      t -= st.dur;
      if (t < st.hold || i === steps.length - 1) {
        resolve(st.to, tmpA);
        return { x: tmpA.x, y: tmpA.y, z: tmpA.z, step: st, walking: false };
      }
      t -= st.hold;
    }
    resolve(steps[0].to, tmpA);
    return { x: tmpA.x, y: tmpA.y, z: tmpA.z, step: steps[0], walking: false };
  }

  function poseTargets(pose: Pose, t: number, ph: number) {
    // [armL x, armL out], [armR x, armR out], [head yaw, head pitch]
    const sway = Math.sin(t * 1.1 + ph) * 0.04;
    switch (pose) {
      case 'talk':
        return [
          [-0.35 + Math.sin(t * 1.9 + ph) * 0.18, 0.18],
          [-0.75 + Math.sin(t * 2.4 + ph) * 0.3, 0.3 + Math.sin(t * 1.7) * 0.12],
          [Math.sin(t * 0.8 + ph) * 0.35, -0.02 + Math.sin(t * 3.1) * 0.03],
        ];
      case 'listen':
        return [
          [sway, 0.07],
          [-sway, 0.07],
          [Math.sin(t * 0.35 + ph) * 0.12, 0.08 + Math.max(0, Math.sin(t * 2.4 + ph)) * 0.1],
        ];
      case 'type':
        return [
          [-1.12 + Math.sin(t * 13 + ph) * 0.05, 0.12],
          [-1.12 + Math.sin(t * 13 + ph + 2) * 0.05, 0.12],
          [Math.sin(t * 0.4 + ph) * 0.1, 0.2],
        ];
      case 'point':
        return [
          [sway, 0.07],
          [-1.25 + Math.sin(t * 1.6 + ph) * 0.12, 0.15],
          [-0.15, 0.22],
        ];
      case 'shake':
        return [
          [sway, 0.07],
          [-0.95 + Math.sin(t * 9) * 0.1, 0.05],
          [0, 0.02],
        ];
      case 'present':
        return [
          [sway, 0.07],
          [-0.55 + Math.sin(t * 1.3 + ph) * 0.1, 0.95],
          [0.35 + Math.sin(t * 0.7) * 0.15, 0],
        ];
      default:
        return [
          [sway, 0.07],
          [-sway, 0.07],
          [Math.sin(t * 0.5 + ph) * 0.2, 0],
        ];
    }
  }

  function updateCharacters(dt: number, t: number, stage: number, snap: boolean) {
    let hs = 0;
    let hl = 0;
    states.forEach((c, i) => {
      const def = c.def;
      const target = evaluate(program(def, stage), t + def.offset);
      const dx = target.x - c.x;
      const dz = target.z - c.z;
      const dist = Math.hypot(dx, dz);
      let moved = 0;
      if (snap || !c.ready) {
        c.x = target.x;
        c.z = target.z;
        c.y = target.y;
        c.ready = true;
      } else {
        const maxStep = 2.6 * dt;
        moved = Math.min(dist, maxStep);
        if (dist > 1e-5) {
          c.x += (dx / dist) * moved;
          c.z += (dz / dist) * moved;
        }
        c.y += (target.y - c.y) * damp(dt, 8);
      }
      const v = dt > 0 ? moved / dt : 0;
      c.speed += (v - c.speed) * (snap ? 1 : damp(dt, 10));
      const walking = c.speed > 0.12 && !snap;
      if (walking) c.phase += moved * 10.5;

      // Heading: along the path while walking, toward the face target while holding.
      let want = c.heading;
      if (walking && dist > 0.01) want = Math.atan2(dx, dz);
      else if (target.step.face) {
        resolve(target.step.face, tmpF);
        if (Math.hypot(tmpF.x - c.x, tmpF.z - c.z) > 0.05) want = Math.atan2(tmpF.x - c.x, tmpF.z - c.z);
      }
      c.heading = snap ? want : lerpAngle(c.heading, want, damp(dt, 7));

      const sitT = target.step.sit && !target.walking && dist < 0.08 ? 1 : 0;
      c.sit = snap ? sitT : c.sit + (sitT - c.sit) * damp(dt, 6);

      const pose: Pose = walking ? 'stand' : target.step.pose;
      const [aL, aR, hd] = poseTargets(pose, t, def.offset);
      const amp = Math.min(1, c.speed / 0.7);
      const swing = walking ? Math.sin(c.phase) * 0.55 * amp : 0;
      if (walking) {
        aL[0] = swing * 0.75;
        aR[0] = -swing * 0.75;
      }
      const k = snap ? 1 : damp(dt, 6);
      c.armL[0] += (aL[0] - c.armL[0]) * k;
      c.armL[1] += (aL[1] - c.armL[1]) * k;
      c.armR[0] += (aR[0] - c.armR[0]) * k;
      c.armR[1] += (aR[1] - c.armR[1]) * k;
      c.head[0] += (hd[0] - c.head[0]) * k;
      c.head[1] += (hd[1] - c.head[1]) * k;

      const bob = walking ? Math.abs(Math.sin(c.phase)) * 0.028 * amp : Math.sin(t * 1.3 + def.offset) * 0.004;
      rig.position.set(c.x, c.y + bob - 0.165 * c.sit, c.z);
      rig.rotation.y = c.heading;
      rTorso.rotation.x = walking ? 0.05 * amp : -0.04 * c.sit;
      const legSit = -1.42 * c.sit;
      rLegL.rotation.x = -swing * (1 - c.sit) + legSit;
      rLegR.rotation.x = swing * (1 - c.sit) + legSit;
      rLegL.rotation.z = -0.02;
      rLegR.rotation.z = 0.02;
      rArmL.rotation.set(c.armL[0], 0, -c.armL[1]);
      rArmR.rotation.set(c.armR[0], 0, c.armR[1]);
      rHead.rotation.set(c.head[1], c.head[0], 0);
      rig.updateMatrixWorld(true);

      I.torso.setMatrixAt(i, rTorso.matrixWorld);
      I.shirt.setMatrixAt(i, rTorso.matrixWorld);
      I.head.setMatrixAt(i, rHead.matrixWorld);
      if (def.look.longHair) I.hairL.setMatrixAt(hl++, rHead.matrixWorld);
      else I.hairS.setMatrixAt(hs++, rHead.matrixWorld);
      I.legs.setMatrixAt(i * 2, rLegL.matrixWorld);
      I.legs.setMatrixAt(i * 2 + 1, rLegR.matrixWorld);
      I.shoes.setMatrixAt(i * 2, rLegL.matrixWorld);
      I.shoes.setMatrixAt(i * 2 + 1, rLegR.matrixWorld);
      I.arms.setMatrixAt(i * 2, rArmL.matrixWorld);
      I.arms.setMatrixAt(i * 2 + 1, rArmR.matrixWorld);
      I.hands.setMatrixAt(i * 2, rArmL.matrixWorld);
      I.hands.setMatrixAt(i * 2 + 1, rArmR.matrixWorld);
    });
    Object.values(I).forEach((m) => (m.instanceMatrix.needsUpdate = true));

    // Doors respond to whoever is near them.
    const nearest = (p: [number, number], zone: ZoneId) => {
      resolve([zone, p[0], p[1]], tmpA);
      let best = Infinity;
      states.forEach((c) => (best = Math.min(best, Math.hypot(c.x - tmpA.x, c.z - tmpA.z))));
      return best;
    };
    const dOpen = nearest(doorAt, 'B') < 0.85 ? 1 : 0;
    door.rotation.y += (dOpen * 1.35 - door.rotation.y) * (snap ? 1 : damp(dt, 5));
    const sOpen = nearest(slideAt, 'D') < 1.1 ? 1 : 0;
    slides.forEach((p, i) => {
      const goal = (i === 0 ? -1 : 1) * (0.37 + sOpen * 0.62);
      p.position.z += (goal - p.position.z) * (snap ? 1 : damp(dt, 6));
    });
  }

  /* ── Camera ── */
  let width = 1;
  let height = 1;
  const target = new THREE.Vector3();
  function placeCamera(sv: number) {
    const aspect = width / height;
    const k = range(sv, 0, 3);
    const az = 0.44 + 0.1 * k + px * 0.08;
    const el = 0.68 + 0.12 * k - py * 0.04;
    // Islands spread wider when fragmented; pull in once they lock together, ease back out for the skyline.
    const spread = 1 - smooth(range(sv, 0.05, 0.9));
    const fit = aspect < 1 ? Math.pow(1 / aspect, 1.05) : 1;
    const late = smooth(range(sv, 2, 2.8));
    const dist = (compact ? 35 : 32.5) * fit * (1 + 0.4 * spread + 0.1 * late);
    target.set(0.3, 0.2 + 1.1 * late, -0.1 - 1.5 * late);
    camera.position.set(
      target.x + Math.sin(az) * Math.cos(el) * dist,
      target.y + Math.sin(el) * dist,
      target.z + Math.cos(az) * Math.cos(el) * dist,
    );
    camera.lookAt(target);

  }

  function resize() {
    const r = mount.getBoundingClientRect();
    width = Math.max(1, r.width);
    height = Math.max(1, r.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  /* ── Loop ── */
  let raf = 0;
  let active = true;
  let last = performance.now();
  let first = true;
  const stageOf = (sv: number) => (sv < 0.6 ? 0 : sv < 1.45 ? 1 : sv < 2.4 ? 2 : 3);

  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    time += dt;
    s += (sTarget - s) * damp(dt, 3.2);
    px += (pxT - px) * damp(dt, 3);
    py += (pyT - py) * damp(dt, 3);
    applyStage(s, time);
    updateCharacters(dt, time, stageOf(s), first);
    placeCamera(s);
    renderer.render(scene, camera);
    if (first) {
      first = false;
      opts.onReady?.();
    }
    raf = active ? requestAnimationFrame(frame) : 0;
  }

  /* Reduced motion: no loop, one considered frame per stage change. */
  function renderStill() {
    s = sTarget;
    const stage = stageOf(s);
    applyStage(stage === 0 ? 0 : stage === 1 ? 1 : stage === 2 ? 2 : 3, 4);
    updateCharacters(0, 4, stage, true);
    placeCamera(s);
    renderer.render(scene, camera);
    if (first) {
      first = false;
      opts.onReady?.();
    }
  }

  const ro = new ResizeObserver(() => {
    resize();
    if (reduced) renderStill();
  });
  ro.observe(mount);
  resize();
  if (reduced) renderStill();
  else raf = requestAnimationFrame(frame);

  return {
    setStage(v) {
      sTarget = Math.min(3, Math.max(0, v));
      if (reduced) renderStill();
    },
    setPointer(x, y) {
      pxT = x;
      pyT = y;
    },
    setActive(on) {
      if (reduced || on === active) return;
      active = on;
      if (on && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    },
    dispose() {
      active = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
      });
      new Set([
        ...Object.values(mats),
        ...bars.map((b) => b.mesh.material as THREE.Material),
        partMat, skinMat, ringMat, arcMat, corridorMat,
        ...zones.map((z) => z.floor),
      ]).forEach((m) => m.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
