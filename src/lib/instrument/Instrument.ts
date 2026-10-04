import * as THREE from 'three';
import { INTERACTION } from '../interaction/config';
import { pointerField, type Impulse } from '../interaction/pointerField';
import { emitLabel } from '../interaction/labels';

/**
 * The instrument: the site's single WebGL subsystem.
 *
 * One renderer, one canvas, one scene. The canvas is moved into whichever host
 * is on screen (the hero, or the work explorer) and aimed at a DOM "anchor", so
 * a 3D system can converge on, say, the full stop of a DOM headline.
 *
 * Four modes, each an abstraction of a real mechanism in one project:
 *   race      LPU Reserve: 500 attempts converge on one slot; a membrane (the
 *             exclusion constraint) lets one through and ripples where it refuses.
 *   boundary  VulnTrack: an organization is a closed volume; requests from outside
 *             hit its wall and are turned away (404), members move inside.
 *   dedupe    Tenora: events arrive in twins with the same id; the first passes the
 *             gate (a unique index) and is stored, the second dies against it.
 *   pipeline  AI Interview Platform: résumés travel through six stations; re-uploads
 *             of the same file leave at the hash station; the rest are persisted.
 *
 * The pointer is part of the system, not a cursor effect. It is read from the
 * shared pointer field (src/lib/interaction) and acts as one more client:
 *   moving      presses a dimple into the membrane (slow) or drags a wake (fast);
 *               agents near it are pushed aside and settle back (viscous offsets)
 *   click/tap   sends your own request into the current system, with a real outcome
 *               per mode (refused 23P01, 404, stored, duplicate, queued, same file)
 *   double      a sharper shockwave; stampede (rapid clicks) sends concurrent requests
 *   mode change the membrane carries a transition wave
 * All of its numbers live in INTERACTION (config.ts).
 *
 * Rules: geometry is bounded (one instanced draw for every agent), positions are
 * closed-form functions of time and a seed (deterministic, scrubbable), the
 * loop runs only while something is moving, and nothing renders while hidden.
 */

export type Mode = 'race' | 'boundary' | 'dedupe' | 'pipeline';

export interface Palette {
  bg: string;
  ink: string;
  ink3: string;
  signal: string;
}

export interface InstrumentEvents {
  onCounts?: (attempts: number, refused: number, booked: number) => void;
  /** A request sent by the visitor reached its outcome. */
  onVisitor?: (outcome: VisitorOutcome) => void;
  onBooked?: () => void;
  /** The current system started over (a replay): counts are back to zero, nothing is booked. */
  onRestart?: () => void;
  onSettled?: (mode: Mode) => void;
}

export type VisitorOutcome = 'refused' | 'stored' | 'duplicate' | '404' | 'queued' | 'same-file';

const MAX = 520;
/** Agent slots reserved at the end of the pool for the visitor's own requests. */
const VIS = 16;
const VIS_BASE = MAX - VIS;
const IMPACTS = 12;
const FOV = 35;
const CAM_Z = 20;

const COUNTS: Record<Mode, number> = { race: 500, boundary: 380, dedupe: 160, pipeline: 72 };

const MEMBRANE_VERT = /* glsl */ `
  uniform float uTime;
  uniform vec4 uImp[${IMPACTS}];
  uniform float uImpK[${IMPACTS}];
  uniform vec4 uRip[3];
  uniform vec3 uPtr;
  uniform vec2 uVel;
  uniform vec2 uDimple;
  uniform vec3 uWake;
  varying vec2 vUv;
  varying float vH;
  void main() {
    vec3 p = position;
    float h = 0.0;
    // Impulses: a ripple per impact, shaped by its kind (click, shock, soft).
    for (int i = 0; i < ${IMPACTS}; i++) {
      vec4 im = uImp[i];
      float dt = uTime - im.z;
      if (im.w > 0.0 && dt > 0.0 && dt < 3.0) {
        vec4 k = uRip[int(uImpK[i])];
        float d = distance(p.xy, im.xy);
        float front = dt * k.z;
        float env = smoothstep(front, front - 0.7, d) * exp(-dt * k.w) * exp(-d * 0.6);
        h += im.w * k.x * sin(d * k.y - dt * k.z * 4.4) * env;
      }
    }
    // The pointer: a dimple where it presses, a wake behind it when it moves fast.
    if (uPtr.z > 0.0) {
      vec2 dp = p.xy - uPtr.xy;
      h -= uPtr.z * uDimple.x * exp(-dot(dp, dp) / (uDimple.y * uDimple.y));
      float vl = length(uVel);
      if (vl > 0.02) {
        vec2 dir = uVel / vl;
        float along = dot(dp, -dir);
        float across = dot(dp, vec2(-dir.y, dir.x));
        if (along > 0.0) {
          float env = exp(-across * across * 5.0) * exp(-along / uWake.z) * min(vl, 1.0);
          h += uPtr.z * uWake.x * sin(along * uWake.y - uTime * 11.0) * env;
        }
      }
    }
    p.z += h;
    vH = h;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const MEMBRANE_FRAG = /* glsl */ `
  uniform vec3 uLine;
  uniform vec3 uHot;
  uniform float uOpacity;
  uniform float uCells;
  uniform vec4 uHole;
  varying vec2 vUv;
  varying float vH;
  void main() {
    vec2 hd = abs(vUv - uHole.xy) - uHole.zw;
    if (uHole.z > 0.0 && max(hd.x, hd.y) < 0.0) discard;
    vec2 cell = vUv * uCells;
    vec2 g = abs(fract(cell - 0.5) - 0.5) / fwidth(cell);
    float line = 1.0 - min(min(g.x, g.y), 1.0);
    float r = distance(vUv, vec2(0.5));
    float fade = smoothstep(0.5, 0.2, r);
    float hot = clamp(abs(vH) * 5.0, 0.0, 1.0);
    vec3 col = mix(uLine, uHot, hot);
    float a = (line * 0.5 + hot * 0.45) * fade * uOpacity;
    if (a < 0.003) discard;
    gl_FragColor = vec4(col, a);
  }
`;

function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);

/** A request the visitor sent (click or tap), with its fate decided at send time. */
interface Visitor {
  i: number;
  t0: number;
  outcome: VisitorOutcome;
  /** Pivot-local: origin, hit point on the membrane/wall, resting place. */
  o: THREE.Vector3;
  h: THREE.Vector3;
  g: THREE.Vector3;
  announced: boolean;
  label: string;
  accepted: boolean;
  strength: number;
  shock: boolean;
}

const LABELS: Record<VisitorOutcome, string> = {
  refused: 'refused · 23P01',
  stored: 'stored',
  duplicate: 'same event id · ignored',
  '404': '404 · not a member',
  queued: 'queued · off the request path',
  'same-file': 'same file · no AI call',
};

/** Per-agent output of a mode at a time. */
interface Pose {
  x: number;
  y: number;
  z: number;
  /** 0 hidden … 1 full size */
  s: number;
  /** colour code: 0 ink3, 1 ink, 2 signal */
  c: number;
}

export class Instrument {
  readonly canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 200);
  private pivot = new THREE.Group();
  private agents: THREE.InstancedMesh;
  private membrane: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private rays: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  private cube: THREE.LineSegments<THREE.EdgesGeometry, THREE.LineBasicMaterial>;
  private rings: THREE.InstancedMesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>;
  private path: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;

  private colors = { ink: new THREE.Color(), ink3: new THREE.Color(), signal: new THREE.Color() };
  private palette: Palette;

  private host: HTMLElement | null = null;
  private anchor: HTMLElement | null = null;
  private w = 1;
  private h = 1;
  private S = new THREE.Vector3();
  private slotR = 0.3;

  private mode: Mode = 'race';
  private count = COUNTS.race;
  private clock = 0;
  private released = false;
  private releaseAt = 0;
  private modeStart = 0;
  private blendFrom: Float32Array = new Float32Array(MAX * 3);
  private blendUntil = 0;
  private cur: Float32Array = new Float32Array(MAX * 3);
  private arrived: Uint8Array = new Uint8Array(MAX);
  private r: Float32Array[] = [];
  private winner = 0;
  /** Whether refused racers come to rest in a heap (explorer) or fade away (hero). */
  private heap = true;
  private duration = 4;
  private impactI = 0;
  private refused = 0;
  private booked = 0;
  private attempts = 0;

  private raf = 0;
  private last = 0;
  private frameDt = 1 / 60;
  private active = false;
  private reduced: boolean;
  private mobile: boolean;
  private rotTarget = new THREE.Vector2();
  private rotBase = new THREE.Vector2();
  private settledNotified = false;
  private ro: ResizeObserver;
  private dummy = new THREE.Object3D();
  private tmpColor = new THREE.Color();

  // Pointer interaction state (numbers in INTERACTION).
  private rect: DOMRect | null = null;
  private ray = new THREE.Raycaster();
  private ndc = new THREE.Vector2();
  private plane = new THREE.Plane();
  private ptrLocal = new THREE.Vector3();
  private ptrS = 0;
  private ptrSpeed = 0;
  private dragVel = new THREE.Vector2();
  private off: Float32Array = new Float32Array(MAX * 3);
  private offEnergy = 0;
  private visitors: Visitor[] = [];
  private visNext = 0;
  private storedVisitors = 0;
  private unsub: (() => void)[] = [];
  private v3a = new THREE.Vector3();
  private v3b = new THREE.Vector3();

  constructor(palette: Palette, public events: InstrumentEvents, opts: { reduced: boolean }) {
    this.reduced = opts.reduced;
    this.mobile = window.matchMedia('(max-width: 767px)').matches;
    const q = this.mobile ? INTERACTION.quality.mobile : INTERACTION.quality.desktop;
    this.palette = palette;
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('aria-hidden', 'true');
    this.canvas.className = 'pointer-events-none absolute inset-0 h-full w-full';
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: q.antialias, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, q.dprMax));

    this.camera.position.set(0, 0, CAM_Z);
    this.scene.add(this.pivot);
    // Phones get the same systems at a smaller scale, so they stay inside the frame.
    this.pivot.scale.setScalar(this.mobile ? 0.6 : 1);
    this.scene.fog = new THREE.Fog(palette.bg, CAM_Z - 2, CAM_Z + 58);

    // Agents: one instanced draw. A thin box, stretched along its direction of travel.
    const agentGeo = new THREE.BoxGeometry(1, 1, 1);
    this.agents = new THREE.InstancedMesh(agentGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, fog: true }), MAX);
    this.agents.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.agents.frustumCulled = false;
    for (let i = 0; i < MAX; i++) this.agents.setColorAt(i, new THREE.Color(1, 1, 1));
    this.pivot.add(this.agents);

    // The membrane: the constraint, as a surface that ripples where it refuses.
    const imp: THREE.Vector4[] = Array.from({ length: IMPACTS }, () => new THREE.Vector4(0, 0, -99, 0));
    this.membrane = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 6, q.membraneSegments, q.membraneSegments),
      new THREE.ShaderMaterial({
        vertexShader: MEMBRANE_VERT,
        fragmentShader: MEMBRANE_FRAG,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uImp: { value: imp },
          uLine: { value: new THREE.Color() },
          uHot: { value: new THREE.Color() },
          uOpacity: { value: 1 },
          uCells: { value: 18 },
          uHole: { value: new THREE.Vector4(0.5, 0.5, 0, 0) },
          uImpK: { value: new Array(IMPACTS).fill(0) },
          uRip: {
            value: (['click', 'shock', 'soft'] as const).map((k) => {
              const c = INTERACTION.membrane.ripple[k];
              return new THREE.Vector4(c.amplitude, c.frequency, c.speed, c.decay);
            }),
          },
          uPtr: { value: new THREE.Vector3(0, 0, 0) },
          uVel: { value: new THREE.Vector2(0, 0) },
          uDimple: { value: new THREE.Vector2(INTERACTION.membrane.dimpleDepth, INTERACTION.membrane.dimpleRadius) },
          uWake: { value: new THREE.Vector3(INTERACTION.membrane.wakeAmplitude, INTERACTION.membrane.wakeFrequency, INTERACTION.membrane.wakeLength) },
        },
      }),
    );
    this.pivot.add(this.membrane);

    this.rays = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ transparent: true, opacity: 0.14, fog: true }));
    this.pivot.add(this.rays);

    this.cube = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)), new THREE.LineBasicMaterial({ transparent: true, opacity: 0.6, fog: true }));
    this.pivot.add(this.cube);

    this.rings = new THREE.InstancedMesh(new THREE.TorusGeometry(1, 0.035, 8, this.mobile ? 40 : 72), new THREE.MeshBasicMaterial({ color: 0xffffff, fog: true }), 6);
    for (let i = 0; i < 6; i++) this.rings.setColorAt(i, new THREE.Color(1, 1, 1));
    this.pivot.add(this.rings);

    this.path = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ transparent: true, opacity: 0.35, fog: true }));
    this.pivot.add(this.path);

    const rand = seeded(20020);
    for (let k = 0; k < 7; k++) {
      const a = new Float32Array(MAX);
      for (let i = 0; i < MAX; i++) a[i] = rand();
      this.r.push(a);
    }

    this.applyPalette(palette);
    this.ro = new ResizeObserver(() => this.resize());

    // The pointer joins the system (not under reduced motion: no continuous response there).
    if (!this.reduced) {
      pointerField.start();
      this.unsub.push(
        pointerField.onWake(() => {
          if (this.active && !this.raf) this.kick();
        }),
        pointerField.onImpulse((imp) => this.onImpulse(imp)),
      );
    }
  }

  /* ── Public API ─────────────────────────────────────────────────────────── */

  /** Move the canvas into a host and aim at an anchor element inside it. */
  attach(host: HTMLElement, anchor: HTMLElement, palette: Palette) {
    if (this.host !== host) {
      if (this.host) this.ro.unobserve(this.host);
      this.host = host;
      host.prepend(this.canvas);
      this.ro.observe(host);
    }
    this.anchor = anchor;
    if (palette.bg !== this.palette.bg || palette.ink !== this.palette.ink) this.applyPalette(palette);
    this.resize();
  }

  /** The element currently holding the canvas. */
  get currentHost() {
    return this.host;
  }

  setActive(active: boolean) {
    this.active = active;
    if (active) this.kick();
    else this.stop();
  }

  setPalette(p: Palette) {
    this.applyPalette(p);
    this.renderOnce();
  }

  /** Switch the system being shown. `hold` keeps a race waiting at its barrier. */
  /**
   * Switch the system being shown. `hold` keeps a race waiting at its barrier.
   * Re-entering the mode already running is a no-op (scrolling back must not
   * restart it) unless `restart` is set, which is what a replay does.
   */
  setMode(mode: Mode, opts: { hold?: boolean; heap?: boolean; restart?: boolean } = {}) {
    this.heap = opts.heap ?? true;
    if (mode === this.mode && this.modeStart > 0 && !opts.hold && !opts.restart) return;
    const switching = this.modeStart > 0 && mode !== this.mode;
    // Remember where everything is, so the new arrangement grows out of the old one.
    this.blendFrom.set(this.cur);
    this.blendUntil = this.clock + (this.modeStart > 0 ? 0.9 : 0);
    this.mode = mode;
    this.count = Math.min(MAX, this.mobile && mode === 'boundary' ? 260 : COUNTS[mode]);
    this.modeStart = this.clock || 0.0001;
    this.released = !opts.hold;
    this.releaseAt = this.clock;
    this.arrived.fill(0);
    this.refused = 0;
    this.booked = 0;
    this.attempts = 0;
    this.settledNotified = false;
    this.clearImpacts();
    this.visitors = [];
    this.storedVisitors = 0;
    this.layoutMode();
    // The system transforms: one wave across the surface as the new arrangement forms.
    if (switching && !this.reduced) this.addImpact(0, 0, 1, 1);
    if (this.reduced) {
      this.blendUntil = 0;
      this.renderOnce();
      this.events.onSettled?.(mode);
      return;
    }
    this.kick();
  }

  /** Release a held race (the hero's barrier). */
  release() {
    if (this.released) return;
    this.released = true;
    this.releaseAt = this.clock;
    if (this.reduced) {
      this.renderOnce();
      return;
    }
    this.kick();
  }

  /** Play the current mode again from the start. */
  replay() {
    this.setMode(this.mode, { hold: false, heap: this.heap, restart: true });
    this.events.onRestart?.();
    this.events.onCounts?.(0, 0, 0);
  }

  /** The reduced-motion and static frames: counts as the test reports them. */
  get staticCounts() {
    return { attempts: COUNTS.race, refused: COUNTS.race - 1, booked: 1 };
  }

  dispose() {
    this.stop();
    this.unsub.forEach((u) => u());
    if (!this.reduced) pointerField.stop();
    this.ro.disconnect();
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose?.();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose?.();
    });
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.canvas.remove();
  }

  /* ── Internals ──────────────────────────────────────────────────────────── */

  private applyPalette(p: Palette) {
    this.palette = p;
    this.colors.ink.set(p.ink);
    this.colors.ink3.set(p.ink3);
    this.colors.signal.set(p.signal);
    (this.scene.fog as THREE.Fog).color.set(p.bg);
    const u = this.membrane.material.uniforms;
    (u.uLine.value as THREE.Color).set(p.ink3);
    (u.uHot.value as THREE.Color).set(p.ink);
    this.rays.material.color.set(p.ink3);
    this.cube.material.color.set(p.ink);
    this.path.material.color.set(p.ink3);
  }

  private resize() {
    if (!this.host) return;
    const r = this.host.getBoundingClientRect();
    this.w = Math.max(1, r.width);
    this.h = Math.max(1, r.height);
    this.renderer.setSize(this.w, this.h, false);
    this.camera.aspect = this.w / this.h;
    this.camera.updateProjectionMatrix();
    this.aim();
    this.layoutMode();
    this.renderOnce();
  }

  /** Put the system's focal point (S) where the DOM anchor is, on the z = 0 plane. */
  private aim() {
    if (!this.host || !this.anchor) return;
    // Layout offsets, not bounding rects: they ignore transforms, so an anchor
    // that is mid-animation (a headline rising into place) is measured where it will land.
    const offsetIn = (el: HTMLElement, stop: Element | null) => {
      let x = 0;
      let y = 0;
      let n: HTMLElement | null = el;
      while (n && n !== stop) {
        x += n.offsetLeft;
        y += n.offsetTop;
        n = n.offsetParent as HTMLElement | null;
      }
      return { x, y };
    };
    const common = this.host.offsetParent;
    const a = offsetIn(this.anchor, common);
    const h = offsetIn(this.host, common);
    const viewH = 2 * CAM_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const viewW = viewH * this.camera.aspect;
    const px = (a.x - h.x + this.anchor.offsetWidth / 2) / this.w;
    const py = (a.y - h.y + this.anchor.offsetHeight / 2) / this.h;
    this.S.set((px - 0.5) * viewW, -(py - 0.5) * viewH, 0);
    this.slotR = (this.anchor.offsetWidth / this.w) * viewW * 0.5;
    this.pivot.position.copy(this.S);
  }

  /** Re-measure the anchor (after a layout change the ResizeObserver cannot see). */
  reaim() {
    this.aim();
    this.layoutMode();
    this.renderOnce();
  }

  /** Static geometry per mode (all in pivot-local space, S at the origin). */
  private layoutMode() {
    const m = this.mode;
    const u = this.membrane.material.uniforms;
    this.membrane.visible = m !== 'pipeline';
    this.cube.visible = m === 'boundary';
    this.rings.visible = m === 'pipeline';
    this.path.visible = m === 'pipeline';
    this.rays.visible = m === 'race' || m === 'dedupe';
    this.membrane.rotation.set(0, 0, 0);
    this.membrane.position.set(0, 0, 0);
    this.rotBase.set(0, 0);

    u.uOpacity.value = this.mobile ? 0.55 : 1;
    if (m === 'race') {
      this.membrane.scale.set(0.8, 0.8, 1);
      const half = Math.max(0.12, this.slotR / this.pivot.scale.x) / 4.8;
      (u.uHole.value as THREE.Vector4).set(0.5, 0.5, half, half);
      u.uCells.value = 18;
      this.buildRays(this.raceSpawn.bind(this), 26);
    } else if (m === 'dedupe') {
      this.membrane.scale.set(0.8, 0.8, 1);
      (u.uHole.value as THREE.Vector4).set(0.5, 0.5, 0, 0);
      u.uCells.value = 14;
      this.buildRays(this.dedupeSpawn.bind(this), 20);
    } else if (m === 'boundary') {
      const L = 4.6;
      this.cube.scale.set(L, L, L);
      this.cube.position.set(0, 0, -L / 2);
      this.membrane.scale.set(L / 6, L / 6, 1);
      this.membrane.rotation.set(0, -Math.PI / 2, 0);
      this.membrane.position.set(-L / 2, 0, -L / 2);
      (u.uHole.value as THREE.Vector4).set(0.5, 0.5, 0, 0);
      u.uCells.value = 10;
      this.rotBase.set(0.62, -0.16);
    } else {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 64; i++) pts.push(this.pipePoint(i / 64, new THREE.Vector3()));
      this.path.geometry.setFromPoints(pts);
      const stations = [0.08, 0.26, 0.44, 0.62, 0.8, 0.97];
      const p = new THREE.Vector3();
      const q = new THREE.Vector3();
      stations.forEach((s, i) => {
        this.pipePoint(s, p);
        this.pipePoint(Math.min(1, s + 0.01), q);
        this.dummy.position.copy(p);
        this.dummy.lookAt(q);
        const sc = lerp(1.3, 0.75, s);
        this.dummy.scale.set(sc, sc, sc);
        this.dummy.updateMatrix();
        this.rings.setMatrixAt(i, this.dummy.matrix);
      });
      this.rings.instanceMatrix.needsUpdate = true;
      this.rotBase.set(0.18, -0.05);
    }

    if (m === 'race') {
      let best = Infinity;
      for (let i = 0; i < this.count; i++) {
        const t = this.raceDelay(i) + this.raceDur(i);
        if (t < best) {
          best = t;
          this.winner = i;
        }
      }
      this.duration = 0;
      for (let i = 0; i < this.count; i++) this.duration = Math.max(this.duration, this.raceDelay(i) + this.raceDur(i));
      this.duration += 1.4;
    } else if (m === 'boundary') this.duration = 5.2;
    else if (m === 'dedupe') this.duration = 5.4;
    else this.duration = 72 * 0.075 + 3.2;
  }

  private buildRays(spawn: (i: number, out: THREE.Vector3) => THREE.Vector3, n: number) {
    const v = new THREE.Vector3();
    const pos: number[] = [];
    for (let k = 0; k < n; k++) {
      spawn(Math.floor((k / n) * this.count), v);
      pos.push(v.x, v.y, v.z, 0, 0, 0);
    }
    this.rays.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  }

  /* Race (LPU Reserve) */
  private raceSpawn(i: number, out: THREE.Vector3) {
    const r = this.r;
    return out.set(lerp(-26, 7, r[0][i]), lerp(-11, 11, r[1][i]), lerp(-76, -28, r[2][i]));
  }
  private raceDelay(i: number) {
    return this.r[5][i] * 0.28;
  }
  private raceDur(i: number) {
    const z = lerp(-76, -28, this.r[2][i]);
    return 1.45 + ((-z - 28) / 48) * 0.85 + this.r[0][i] * 0.35;
  }

  /* Dedupe (Tenora) */
  private dedupeSpawn(i: number, out: THREE.Vector3) {
    const k = Math.floor(i / 2);
    const r = this.r;
    return out.set(lerp(-15, 5, r[0][k]), lerp(-7, 7, r[1][k]), lerp(-62, -26, r[2][k]));
  }

  /* Pipeline (AI Interview Platform): a gentle curve out of the depth to the anchor. */
  private pipePoint(s: number, out: THREE.Vector3) {
    const a = new THREE.Vector3(1.5, -3, -46);
    const b = new THREE.Vector3(-2.8, 3.4, -24);
    const c = new THREE.Vector3(-1.2, -1.6, -8);
    const d = new THREE.Vector3(0, 0, 0);
    const t = clamp01(s);
    const it = 1 - t;
    return out
      .set(0, 0, 0)
      .addScaledVector(a, it * it * it)
      .addScaledVector(b, 3 * it * it * t)
      .addScaledVector(c, 3 * it * t * t)
      .addScaledVector(d, t * t * t);
  }

  private v = new THREE.Vector3();
  private w2 = new THREE.Vector3();

  /** Where agent i is at mode time t (seconds since release). Pivot-local. */
  private pose(i: number, t: number, out: Pose) {
    const r = this.r;
    const m = this.mode;
    out.s = 1;
    out.c = 0;

    if (m === 'race') {
      const sp = this.raceSpawn(i, this.v);
      const winner = i === this.winner;
      const a = r[3][i] * Math.PI * 2;
      const rad = (this.slotR / this.pivot.scale.x) * 1.4 + r[4][i] * 2;
      const hx = winner ? 0 : Math.cos(a) * rad;
      const hy = winner ? 0 : Math.sin(a) * rad * 0.8;
      const delay = this.raceDelay(i);
      const dur = this.raceDur(i);
      if (t <= delay) {
        out.x = sp.x;
        out.y = sp.y;
        out.z = sp.z;
        out.c = winner ? 1 : 0;
        return out;
      }
      const u = clamp01((t - delay) / dur);
      if (u < 1) {
        const e = u * u * (1.6 - 0.6 * u);
        out.x = lerp(sp.x, hx, e);
        out.y = lerp(sp.y, hy, e);
        out.z = lerp(sp.z, 0, e);
        out.c = winner ? 1 : 0;
        return out;
      }
      const s = t - delay - dur;
      if (winner) {
        // Through the slot. In the explorer it stays there, lit: the one booking.
        // In the hero the DOM full stop is the slot, so the winner is absorbed into it.
        const e = easeOut(s / 0.35);
        out.x = 0;
        out.y = 0;
        out.z = lerp(0, -0.25, e);
        out.s = this.heap ? lerp(1, 4, e) : Math.max(0, 1 - s / 0.3);
        out.c = 2;
        return out;
      }
      // Refused: knocked back off the membrane, they fall and come to rest in a heap below it.
      const vx = (r[0][i] - 0.5) * 2.4;
      const vy = 1.5 + r[1][i] * 2.5;
      const vz = -(1.2 + r[2][i] * 2.6);
      const floor = -2.6 - r[6][i] * 0.9 - this.slotR;
      const land = (vy + Math.sqrt(vy * vy + 28 * (hy - floor))) / 14;
      const k = this.heap ? Math.min(s, land) : s;
      out.x = hx + vx * k;
      out.y = hy + vy * k - 7 * k * k;
      out.z = vz * k;
      out.s = this.heap ? (s < land ? 1 : 0.7) : Math.max(0, 1 - s / 1.2);
      return out;
    }

    if (m === 'boundary') {
      const L = 4.6;
      const members = Math.round(this.count * 0.24);
      if (i < members) {
        const bx = (r[0][i] - 0.5) * L * 0.8;
        const by = (r[1][i] - 0.5) * L * 0.8;
        const bz = -L / 2 + (r[2][i] - 0.5) * L * 0.8;
        const live = 1 - smooth((t - (this.duration - 1.2)) / 1.2);
        const ph = r[3][i] * 6.28;
        out.x = bx + Math.sin(t * 0.9 + ph) * 0.35 * live;
        out.y = by + Math.cos(t * 0.7 + ph) * 0.3 * live;
        out.z = bz + Math.sin(t * 0.6 + ph * 2) * 0.3 * live;
        out.c = 2;
        out.s = 0.9;
        return out;
      }
      const wall = -L / 2;
      const ty = (r[4][i] - 0.5) * L * 0.9;
      const tz = -L / 2 + (r[5][i] - 0.5) * L * 0.9;
      // A short run-up from just outside the wall (they fade in as they start), so the
      // requests never cross the text column, whatever the scene's rotation.
      const sx = wall - lerp(1.5, 4, r[0][i]);
      const sy = ty + (r[1][i] - 0.5) * 3;
      const sz = tz + (r[2][i] - 0.5) * 3;
      const delay = r[6][i] * 3;
      const dur = 0.7 + r[0][i] * 0.4;
      if (t <= delay) {
        out.x = sx;
        out.y = sy;
        out.z = sz;
        out.s = 0;
        return out;
      }
      const u = clamp01((t - delay) / dur);
      if (u < 1) {
        const e = u * u;
        out.x = lerp(sx, wall, e);
        out.y = lerp(sy, ty, e);
        out.z = lerp(sz, tz, e);
        out.s = Math.min(1, u * 4);
        return out;
      }
      const s = t - delay - dur;
      out.x = wall - (4 + r[2][i] * 6) * s;
      out.y = ty + (r[3][i] - 0.5) * 4 * s - 5 * s * s;
      out.z = tz + (r[4][i] - 0.5) * 4 * s;
      out.s = Math.max(0, 1 - s / 1.1);
      return out;
    }

    if (m === 'dedupe') {
      const k = Math.floor(i / 2);
      const twin = i % 2 === 1;
      const sp = this.dedupeSpawn(i, this.v);
      const a = r[3][k] * Math.PI * 2;
      const rad = r[4][k] * 1.9;
      const hx = Math.cos(a) * rad;
      const hy = Math.sin(a) * rad * 0.8;
      const delay = r[5][k] * 3.4 + (twin ? 0.4 : 0);
      const dur = 1.3 + r[6][k] * 0.5;
      if (t <= delay) {
        out.x = sp.x;
        out.y = sp.y;
        out.z = sp.z;
        out.s = 0;
        return out;
      }
      const u = clamp01((t - delay) / dur);
      if (u < 1) {
        const e = u * u * (1.6 - 0.6 * u);
        out.x = lerp(sp.x, hx, e);
        out.y = lerp(sp.y, hy, e);
        out.z = lerp(sp.z, 0, e);
        out.s = Math.min(1, u * 3);
        out.c = twin ? 0 : 1;
        return out;
      }
      const s = t - delay - dur;
      if (twin) {
        out.x = hx + (r[0][k] - 0.5) * 2 * s;
        out.y = hy + 2.5 * s - 7 * s * s;
        out.z = -(4 + r[1][k] * 5) * s;
        out.s = Math.max(0, 1 - s / 1.1);
        return out;
      }
      // Stored: through the gate and into the table, one row each.
      const cols = 10;
      const gx = 1.5 + (k % cols) * 0.22;
      const gy = 1.2 - Math.floor(k / cols) * 0.22;
      const e = easeOut(s / 0.7);
      out.x = lerp(hx, gx, e);
      out.y = lerp(hy, gy, e);
      out.z = lerp(0, 0.6, e);
      out.c = 2;
      out.s = lerp(1, 0.7, e);
      return out;
    }

    // pipeline
    const st = i * 0.075;
    const dup = i % 5 === 2;
    const hashAt = 0.26;
    const prog = clamp01((t - st) / 2.8);
    if (t <= st) {
      this.pipePoint(0, this.w2);
      out.x = this.w2.x;
      out.y = this.w2.y;
      out.z = this.w2.z;
      out.s = 0;
      return out;
    }
    if (dup && prog >= hashAt) {
      this.pipePoint(hashAt, this.w2);
      const s = t - st - hashAt * 2.8;
      out.x = this.w2.x + 1.5 * s;
      out.y = this.w2.y - 2.5 * s - 3 * s * s;
      out.z = this.w2.z + 1.2 * s;
      out.s = Math.max(0, 1 - s / 0.9);
      return out;
    }
    if (prog < 1) {
      this.pipePoint(prog, this.w2);
      out.x = this.w2.x;
      out.y = this.w2.y;
      out.z = this.w2.z;
      out.s = Math.min(1, prog * 20);
      out.c = 1;
      return out;
    }
    // Persisted: a neat stack beside the last station.
    let j = 0;
    for (let q = 0; q < i; q++) if (q % 5 !== 2) j++;
    const s = t - st - 2.8;
    const e = easeOut(s / 0.5);
    const gx = 1.2 + (j % 6) * 0.26;
    const gy = -1.6 + Math.floor(j / 6) * 0.2;
    out.x = lerp(0, gx, e);
    out.y = lerp(0, gy, e);
    out.z = lerp(0, 0.4, e);
    out.c = 2;
    out.s = 0.85;
    return out;
  }

  private clearImpacts() {
    const imp = this.membrane.material.uniforms.uImp.value as THREE.Vector4[];
    imp.forEach((v) => v.set(0, 0, -99, 0));
  }

  /** A ripple on the membrane. kind: 0 click, 1 shock, 2 soft (see INTERACTION.membrane.ripple). */
  private addImpact(localX: number, localY: number, strength: number, kind: 0 | 1 | 2 = 0) {
    const u = this.membrane.material.uniforms;
    const imp = u.uImp.value as THREE.Vector4[];
    const kinds = u.uImpK.value as number[];
    const slot = this.impactI % IMPACTS;
    imp[slot].set(localX, localY, u.uTime.value as number, strength);
    kinds[slot] = kind;
    this.impactI++;
  }

  /** Mode time: seconds since the mode started (or since release for a held race). */
  private modeTime() {
    if (!this.released) return 0;
    return this.clock - this.releaseAt;
  }

  private update(dt: number) {
    this.clock += dt;
    this.membrane.material.uniforms.uTime.value = this.clock;
    this.readPointer(dt);
    // Ease towards the pointer and the mode's base angle.
    const tx = this.rotBase.x + this.rotTarget.x;
    const ty = this.rotBase.y + this.rotTarget.y;
    this.pivot.rotation.y += (tx - this.pivot.rotation.y) * Math.min(1, dt * 4);
    this.pivot.rotation.x += (-ty - this.pivot.rotation.x) * Math.min(1, dt * 4);
  }

  /** Compute every agent's pose and write the instance buffers. Returns true while anything moves. */
  private writeAgents(): boolean {
    const t = this.reduced ? this.staticTime() : this.modeTime();
    const pose: Pose = { x: 0, y: 0, z: 0, s: 1, c: 0 };
    const blending = this.clock < this.blendUntil;
    const bk = blending ? smooth(1 - (this.blendUntil - this.clock) / 0.9) : 1;
    const thick = this.mobile ? 0.07 : 0.055;
    let changedCounts = false;
    let moving = blending;
    const field = this.fieldStep();

    for (let i = 0; i < MAX; i++) {
      const o = i * 3;
      const visitor = i >= VIS_BASE ? this.visitorAt(i) : null;
      if ((i >= this.count && !visitor) || (visitor && !this.visitorPose(visitor, pose))) {
        this.dummy.position.set(0, 0, 0);
        this.dummy.scale.set(0, 0, 0);
        this.dummy.updateMatrix();
        this.agents.setMatrixAt(i, this.dummy.matrix);
        continue;
      }
      if (!visitor) this.pose(i, t, pose);
      else moving = true;
      let x = pose.x;
      let y = pose.y;
      let z = pose.z;
      if (blending && !visitor) {
        x = lerp(this.blendFrom[o], x, bk);
        y = lerp(this.blendFrom[o + 1], y, bk);
        z = lerp(this.blendFrom[o + 2], z, bk);
      }
      // The pointer's influence: viscous offsets that push agents aside and let them settle.
      // The booking itself does not move: it holds its slot whatever the pointer does.
      if (!visitor && field && !(this.mode === 'race' && i === this.winner)) {
        this.applyField(o, x, y, z, field);
        x += this.off[o];
        y += this.off[o + 1];
        z += this.off[o + 2];
      }
      const px = this.cur[o];
      const py = this.cur[o + 1];
      const pz = this.cur[o + 2];
      this.cur[o] = x;
      this.cur[o + 1] = y;
      this.cur[o + 2] = z;
      const dx = x - px;
      const dy = y - py;
      const dz = z - pz;
      const speed = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (speed > 1e-4) moving = true;

      this.dummy.position.set(x, y, z);
      if (speed > 1e-4) this.dummy.lookAt(x + dx, y + dy, z + dz);
      // At rest: lie along the floor, alternating, instead of inheriting another agent's angle.
      else this.dummy.lookAt(x + (i % 2 ? 1 : 0.6), y, z + (i % 2 ? 0.25 : -0.8));
      const len = Math.min(1.6, 0.18 + speed * 4);
      this.dummy.scale.set(thick * pose.s, thick * pose.s, len * pose.s);
      this.dummy.updateMatrix();
      this.agents.setMatrixAt(i, this.dummy.matrix);
      const col = pose.c === 2 ? this.colors.signal : pose.c === 1 ? this.colors.ink : this.colors.ink3;
      this.agents.setColorAt(i, this.tmpColor.copy(col));

      // Arrival events: counts, impacts, the booking.
      if (!this.reduced && !visitor && !this.arrived[i]) {
        const hit = this.hitEvent(i, t);
        if (hit) {
          this.arrived[i] = 1;
          changedCounts = true;
        }
      }
    }
    this.agents.instanceMatrix.needsUpdate = true;
    if (this.agents.instanceColor) this.agents.instanceColor.needsUpdate = true;

    if (this.mode === 'pipeline') this.lightRings();
    if (changedCounts) this.events.onCounts?.(this.attempts, this.refused, this.booked);
    if (field) this.offEnergy = field.energy;
    return moving;
  }

  /* ── The pointer ─────────────────────────────────────────────────────────── */

  /** Sample the shared field and project the pointer into the system (once per frame). */
  private readPointer(dt: number) {
    const u = this.membrane.material.uniforms;
    const ptr = u.uPtr.value as THREE.Vector3;
    if (this.reduced || !this.host) {
      ptr.z = 0;
      return;
    }
    const f = pointerField.step();
    const r = (this.rect = this.host.getBoundingClientRect());
    const inside = f.present && !f.touch && f.sx >= r.left && f.sx <= r.right && f.sy >= r.top && f.sy <= r.bottom;
    const target = inside ? f.strength : 0;
    this.ptrS += (target - this.ptrS) * (1 - Math.pow(0.85, dt * 60));
    if (this.ptrS < 0.003) this.ptrS = 0;
    // Depth response: the whole system leans a little toward the pointer (wide screens only).
    if (!this.mobile && inside) this.rotTarget.set(((f.sx - r.left) / r.width * 2 - 1) * 0.14, ((f.sy - r.top) / r.height * 2 - 1) * 0.09);
    else if (!inside) this.rotTarget.set(0, 0);
    if (this.ptrS === 0) {
      ptr.z = 0;
      this.ptrSpeed = 0;
      this.dragVel.set(0, 0);
      return;
    }
    this.ndc.set(((f.sx - r.left) / r.width) * 2 - 1, -((f.sy - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(this.ndc, this.camera);
    this.pivot.updateMatrixWorld(true);
    const normal = this.v3a.set(0, 0, 1).transformDirection(this.membrane.matrixWorld);
    this.plane.setFromNormalAndCoplanarPoint(normal, this.membrane.getWorldPosition(this.v3b));
    const hit = this.ray.ray.intersectPlane(this.plane, this.v3b);
    if (!hit) {
      ptr.z = 0;
      return;
    }
    const speedK = Math.min(1, f.speed / INTERACTION.pointer.wakeSpeed);
    this.ptrSpeed = f.speed;
    this.ptrLocal.copy(hit);
    this.pivot.worldToLocal(this.ptrLocal);
    const ml = this.membrane.worldToLocal(this.v3a.copy(hit));
    // Slow: it presses. Fast: it presses less and drags a wake.
    ptr.set(ml.x, ml.y, this.ptrS * (1 - 0.55 * speedK));
    (u.uVel.value as THREE.Vector2).set(f.vx / INTERACTION.pointer.wakeSpeed, -f.vy / INTERACTION.pointer.wakeSpeed);
    const unitsPerPx = (2 * CAM_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2))) / this.h / this.pivot.scale.x;
    if (f.dragging) this.dragVel.set(f.vx * unitsPerPx, -f.vy * unitsPerPx);
    else this.dragVel.multiplyScalar(0.8);
  }

  /** Per-frame constants for the offset field, or null when nothing acts on the agents. */
  private fieldStep() {
    if (this.reduced) return null;
    const a = INTERACTION.agents;
    const dt = Math.min(0.05, Math.max(0.001, this.frameDt));
    const active = this.ptrS > 0 || this.offEnergy > 0.0015;
    if (!active) return null;
    return {
      dt,
      decay: Math.pow(a.viscosity, dt * 60),
      r2: a.influenceRadius * a.influenceRadius,
      push: a.repel * this.ptrS * (0.25 + Math.min(1.5, this.ptrSpeed / INTERACTION.pointer.wakeSpeed)) * dt,
      drag: this.dragVel.lengthSq() > 1e-6,
      energy: 0,
    };
  }

  private applyField(o: number, x: number, y: number, z: number, f: NonNullable<ReturnType<Instrument['fieldStep']>>) {
    const off = this.off;
    if (this.ptrS > 0) {
      const dx = x - this.ptrLocal.x;
      const dy = y - this.ptrLocal.y;
      const dz = z - this.ptrLocal.z;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < f.r2 && d2 > 1e-6) {
        const d = Math.sqrt(d2);
        const fall = (1 - d / Math.sqrt(f.r2)) ** 2;
        off[o] += (dx / d) * f.push * fall;
        off[o + 1] += (dy / d) * f.push * fall;
        off[o + 2] += (dz / d) * f.push * fall * 0.5;
        if (f.drag) {
          const k = INTERACTION.agents.dragForce * fall;
          off[o] += this.dragVel.x * k;
          off[o + 1] += this.dragVel.y * k;
        }
      }
    }
    off[o] *= f.decay;
    off[o + 1] *= f.decay;
    off[o + 2] *= f.decay;
    f.energy = Math.max(f.energy, Math.abs(off[o]) + Math.abs(off[o + 1]) + Math.abs(off[o + 2]));
  }

  /** Radial kick to every agent near a local point (a click landing). */
  private kickAgents(at: THREE.Vector3, strength: number) {
    const a = INTERACTION.agents;
    const R = a.impulseRadius;
    for (let i = 0; i < this.count; i++) {
      if (this.mode === 'race' && i === this.winner) continue;
      const o = i * 3;
      const dx = this.cur[o] - at.x;
      const dy = this.cur[o + 1] - at.y;
      const dz = this.cur[o + 2] - at.z;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d > R || d < 1e-4) continue;
      const k = a.impulse * strength * (1 - d / R) ** 2;
      this.off[o] += (dx / d) * k;
      this.off[o + 1] += (dy / d) * k;
      this.off[o + 2] += (dz / d) * k * 0.6;
    }
    this.offEnergy = Math.max(this.offEnergy, 0.1);
  }

  /** A click or tap inside the host: send the visitor's own request into the system. */
  private onImpulse(imp: Impulse) {
    if (!this.active || !this.host || this.reduced) return;
    const r = this.host.getBoundingClientRect();
    if (imp.x < r.left || imp.x > r.right || imp.y < r.top || imp.y > r.bottom) return;
    this.rect = r;
    this.ndc.set(((imp.x - r.left) / r.width) * 2 - 1, -((imp.y - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(this.ndc, this.camera);
    this.pivot.updateMatrixWorld(true);

    const L = 4.6;
    const m = this.mode;
    const depth = m === 'boundary' ? -L / 2 : m === 'pipeline' ? -3 : -5;
    const normal = this.v3a.set(0, 0, 1).transformDirection(this.pivot.matrixWorld);
    this.plane.setFromNormalAndCoplanarPoint(normal, this.pivot.localToWorld(this.v3b.set(0, 0, depth)));
    const hit = this.ray.ray.intersectPlane(this.plane, new THREE.Vector3());
    if (!hit) return;
    const origin = this.pivot.worldToLocal(hit);

    const same = imp.sincePrevious < INTERACTION.impulses.sameEventMs;
    const n = imp.kind === 'stampede' ? 4 : 1;
    const slotLocal = this.slotR / this.pivot.scale.x;
    for (let k = 0; k < n; k++) {
      const o = origin.clone().add(new THREE.Vector3((k % 2 ? 1 : -1) * k * 0.35, (k > 1 ? 1 : -1) * k * 0.25, 0));
      const h = new THREE.Vector3();
      const g = new THREE.Vector3();
      let outcome: VisitorOutcome;
      if (m === 'race' || m === 'dedupe') {
        const len = Math.hypot(o.x, o.y);
        const dir = len > 1e-3 ? new THREE.Vector2(o.x / len, o.y / len) : new THREE.Vector2(1, 0);
        const rad = Math.min(1.8, Math.max(slotLocal * 1.9, len * 0.55));
        h.set(dir.x * rad, dir.y * rad, 0);
        if (m === 'race') outcome = 'refused';
        else {
          outcome = same || k > 0 ? 'duplicate' : 'stored';
          const idx = 80 + this.storedVisitors;
          g.set(1.5 + (idx % 10) * 0.22, 1.2 - Math.floor(idx / 10) * 0.22, 0.6);
        }
      } else if (m === 'boundary') {
        o.x = Math.min(o.x, -L / 2 - 3.5);
        h.set(-L / 2, Math.max(-L * 0.45, Math.min(L * 0.45, o.y)), Math.max(-L * 0.95, Math.min(-L * 0.05, o.z)));
        outcome = '404';
      } else {
        this.pipePoint(0.08, h);
        outcome = same || k > 0 ? 'same-file' : 'queued';
        const j = 58 + this.storedVisitors;
        g.set(1.2 + (j % 6) * 0.26, -1.6 + Math.floor(j / 6) * 0.2, 0.4);
      }
      if (outcome === 'stored' || outcome === 'queued') this.storedVisitors++;
      const label =
        k > 0
          ? ''
          : imp.kind === 'stampede'
            ? m === 'race'
              ? '4 at once · still one booking'
              : m === 'dedupe'
                ? '4 deliveries · stored once'
                : m === 'pipeline'
                  ? '4 uploads · analysed once'
                  : '4 requests · 404 each'
            : LABELS[outcome];
      this.addVisitor({
        i: VIS_BASE + (this.visNext++ % VIS),
        t0: this.clock + k * 0.045,
        outcome,
        o,
        h,
        g,
        announced: false,
        label,
        accepted: outcome === 'stored' || outcome === 'queued',
        strength: imp.weight * (imp.kind === 'double' ? 1.6 : 1),
        shock: imp.kind === 'double',
      });
    }
    this.kick();
  }

  private addVisitor(v: Visitor) {
    this.visitors = this.visitors.filter((x) => x.i !== v.i);
    this.visitors.push(v);
  }

  private visitorAt(i: number) {
    for (let k = 0; k < this.visitors.length; k++) if (this.visitors[k].i === i) return this.visitors[k];
    return null;
  }

  /** Pose of a visitor's request. Returns false once it has gone. Fires its outcome once. */
  private visitorPose(v: Visitor, out: Pose): boolean {
    const s = this.clock - v.t0;
    if (s < 0) return false;
    out.s = 1.25;
    out.c = 1;
    const FLY = 0.55;
    if (v.outcome === 'queued' || v.outcome === 'same-file') {
      const p = this.v3a;
      if (s < 0.5) {
        const e = easeOut(s / 0.5);
        out.x = lerp(v.o.x, v.h.x, e);
        out.y = lerp(v.o.y, v.h.y, e);
        out.z = lerp(v.o.z, v.h.z, e);
        return true;
      }
      if (!v.announced) this.announce(v, v.h);
      const end = v.outcome === 'same-file' ? 0.26 : 1;
      const dur = v.outcome === 'same-file' ? 0.45 : 2.4;
      const prog = Math.min(1, (s - 0.5) / dur);
      this.pipePoint(lerp(0.08, end, prog), p);
      if (prog < 1) {
        out.x = p.x;
        out.y = p.y;
        out.z = p.z;
        return true;
      }
      const k = s - 0.5 - dur;
      if (v.outcome === 'same-file') {
        if (k > 1) return false;
        out.x = p.x + 1.5 * k;
        out.y = p.y - 2.5 * k - 3 * k * k;
        out.z = p.z + 1.2 * k;
        out.s = Math.max(0, 1.25 * (1 - k));
        return true;
      }
      const e = easeOut(k / 0.5);
      out.x = lerp(p.x, v.g.x, e);
      out.y = lerp(p.y, v.g.y, e);
      out.z = lerp(p.z, v.g.z, e);
      out.c = 2;
      out.s = 0.85;
      return true;
    }
    if (s < FLY) {
      const e = (s / FLY) ** 2;
      out.x = lerp(v.o.x, v.h.x, e);
      out.y = lerp(v.o.y, v.h.y, e);
      out.z = lerp(v.o.z, v.h.z, e);
      return true;
    }
    if (!v.announced) this.announce(v, v.h);
    const k = s - FLY;
    if (v.outcome === 'stored') {
      const e = easeOut(k / 0.55);
      out.x = lerp(v.h.x, v.g.x, e);
      out.y = lerp(v.h.y, v.g.y, e);
      out.z = lerp(v.h.z, v.g.z, e);
      out.c = 2;
      out.s = lerp(1.25, 0.7, e);
      return true;
    }
    if (k > 1.2) return false;
    const back = v.outcome === '404' ? this.v3a.set(-(4 + v.o.y * 0.2), 1.5, 0) : this.v3a.set(v.h.x * 0.6, 2.2, -5);
    out.x = v.h.x + back.x * k;
    out.y = v.h.y + back.y * k - 6 * k * k;
    out.z = v.h.z + back.z * k;
    out.s = Math.max(0, 1.25 * (1 - k / 1.2));
    return true;
  }

  /** The moment a visitor's request meets the system: ripple, kick, label, counts. */
  private announce(v: Visitor, at: THREE.Vector3) {
    v.announced = true;
    if (this.mode !== 'pipeline' && v.outcome !== 'stored') {
      const ml = this.membrane.worldToLocal(this.pivot.localToWorld(this.v3b.copy(at)));
      this.addImpact(ml.x, ml.y, v.strength, v.shock ? 1 : 0);
    }
    this.kickAgents(at, v.strength);
    if (this.mode === 'race') {
      this.attempts++;
      this.refused++;
      this.events.onCounts?.(this.attempts, this.refused, this.booked);
    }
    this.events.onVisitor?.(v.outcome);
    if (v.label) {
      const c = this.toClient(at);
      if (c) emitLabel({ text: v.label, x: c.x, y: c.y, accepted: v.accepted });
    }
  }

  /** Pivot-local point → client coordinates (for DOM labels). */
  private toClient(local: THREE.Vector3) {
    if (!this.rect) return null;
    const w = this.pivot.localToWorld(this.v3b.copy(local)).project(this.camera);
    return { x: this.rect.left + ((w.x + 1) / 2) * this.rect.width, y: this.rect.top + ((1 - w.y) / 2) * this.rect.height };
  }

  /** Detect the frame an agent reaches the membrane, and record what happened. */
  private hitEvent(i: number, t: number): boolean {
    const r = this.r;
    if (this.mode === 'race') {
      const at = this.raceDelay(i) + this.raceDur(i);
      if (t < at) return false;
      this.attempts++;
      if (i === this.winner) {
        this.booked = 1;
        this.events.onBooked?.();
      } else {
        this.refused++;
        if (i % 6 === 0) {
          const a = r[3][i] * Math.PI * 2;
          const rad = (this.slotR / this.pivot.scale.x) * 1.4 + r[4][i] * 2;
          this.addImpact((Math.cos(a) * rad) / 0.8, Math.sin(a) * rad, 1);
        }
      }
      return true;
    }
    if (this.mode === 'boundary') {
      const members = Math.round(this.count * 0.24);
      if (i < members) return false;
      const at = r[6][i] * 3 + 0.7 + r[0][i] * 0.4;
      if (t < at) return false;
      if (i % 4 === 0) {
        const L = 4.6;
        // Membrane local: after the -90° turn about y, local x runs along world +z.
        const tz = -L / 2 + (r[5][i] - 0.5) * L * 0.9;
        const ty = (r[4][i] - 0.5) * L * 0.9;
        this.addImpact(((tz + L / 2) * 6) / L, (ty * 6) / L, 1);
      }
      return true;
    }
    if (this.mode === 'dedupe') {
      const k = Math.floor(i / 2);
      const twin = i % 2 === 1;
      const at = r[5][k] * 3.4 + (twin ? 0.4 : 0) + 1.3 + r[6][k] * 0.5;
      if (t < at) return false;
      if (twin) {
        const a = r[3][k] * Math.PI * 2;
        const rad = r[4][k] * 1.9;
        this.addImpact((Math.cos(a) * rad) / 0.8, (Math.sin(a) * rad * 0.8) / 0.8, 0.9);
      }
      return true;
    }
    return false;
  }

  private ringGlow = new Float32Array(6);
  private lightRings() {
    const stations = [0.08, 0.26, 0.44, 0.62, 0.8, 0.97];
    const p = new THREE.Vector3();
    stations.forEach((s, k) => {
      this.pipePoint(s, p);
      let g = 0;
      for (let i = 0; i < this.count; i++) {
        const o = i * 3;
        const dx = this.cur[o] - p.x;
        const dy = this.cur[o + 1] - p.y;
        const dz = this.cur[o + 2] - p.z;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < 2) g = Math.max(g, 1 - d2 / 2);
      }
      // The pointer near a station lights it too: focus before anything is sent.
      if (this.ptrS > 0) g = Math.max(g, this.ptrS * Math.max(0, 1 - p.distanceToSquared(this.ptrLocal) / 3));
      this.ringGlow[k] = Math.max(g, this.ringGlow[k] * 0.9);
      this.rings.setColorAt(k, this.tmpColor.copy(this.colors.ink3).lerp(this.colors.signal, this.ringGlow[k]));
    });
    if (this.rings.instanceColor) this.rings.instanceColor.needsUpdate = true;
  }

  /** The single frame shown under reduced motion: a decisive moment of each system. */
  private staticTime() {
    if (this.mode === 'race') return this.released ? this.raceDelay(this.winner) + this.raceDur(this.winner) * 0.995 : 0;
    if (this.mode === 'boundary') return 2.4;
    if (this.mode === 'dedupe') return 3.2;
    return 3.6;
  }

  private ripplesAlive() {
    const imp = this.membrane.material.uniforms.uImp.value as THREE.Vector4[];
    return imp.some((v) => v.w > 0 && this.clock - v.z < 3);
  }

  private renderOnce() {
    if (!this.host) return;
    this.writeAgents();
    this.renderer.render(this.scene, this.camera);
  }

  private kick() {
    if (this.raf || !this.active || this.reduced) {
      if (this.reduced && this.active) this.renderOnce();
      return;
    }
    this.last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.frameDt = dt;
      this.update(dt);
      const moving = this.writeAgents();
      this.renderer.render(this.scene, this.camera);
      const rotating =
        Math.abs(this.rotBase.x + this.rotTarget.x - this.pivot.rotation.y) > 0.0008 ||
        Math.abs(-(this.rotBase.y + this.rotTarget.y) - this.pivot.rotation.x) > 0.0008;
      const running = this.released && this.modeTime() < this.duration;
      const busy =
        moving ||
        rotating ||
        running ||
        this.ripplesAlive() ||
        this.clock < this.blendUntil ||
        this.ptrS > 0 ||
        this.offEnergy > 0.0015 ||
        this.visitors.some((v) => this.clock - v.t0 < 4);
      if (!busy && this.released && !this.settledNotified) {
        this.settledNotified = true;
        this.events.onSettled?.(this.mode);
      }
      this.raf = busy && this.active && !document.hidden ? requestAnimationFrame(step) : 0;
    };
    this.raf = requestAnimationFrame(step);
  }

  private stop() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  /** Re-start the loop after the tab becomes visible. */
  resume() {
    this.kick();
  }
}

/** True when a WebGL context can be created at all. */
export function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null;
    // Release the probe's context straight away; browsers cap live contexts.
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}
