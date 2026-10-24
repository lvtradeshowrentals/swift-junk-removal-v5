// Renderer, environment and the three lights, shared by the hero and the dev labs.
import { THREE } from './kit.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export function makeStudio(canvas, opt = {}) {
  const low = !!opt.low;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: !!opt.preserve });
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = opt.exposure ?? .92;
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.03).texture; scene.environmentIntensity = opt.env ?? .4; pm.dispose();
  const camera = new THREE.PerspectiveCamera(opt.fov ?? 21, 1, 1, 160);
  const key = new THREE.DirectionalLight('#fff3e6', opt.key ?? 3.1);
  key.position.set(8, 12.5, 8); key.castShadow = true; key.shadow.mapSize.set(low ? 1024 : 2048, low ? 1024 : 2048);
  const R = opt.shadowR ?? 9, sc = key.shadow.camera; sc.left = -R; sc.right = R; sc.top = R; sc.bottom = -R; sc.near = 2; sc.far = 46;
  key.shadow.bias = -0.0003; key.shadow.normalBias = .035; key.shadow.radius = 5;
  scene.add(key);
  scene.add(new THREE.HemisphereLight('#f2f6ff', '#d8cbb8', .55));
  const fill = new THREE.DirectionalLight('#dfe9ff', .55); fill.position.set(-8, 5, 9); scene.add(fill);
  return { renderer, scene, camera, key, fill };
}
