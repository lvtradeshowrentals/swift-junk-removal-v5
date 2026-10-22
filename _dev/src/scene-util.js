import { THREE, blob } from './kit.js';

/* places props on the floor (with a soft contact shadow) or on a wall, and keeps the list of items */
export function maker() {
  const items = [];
  const root = (obj, name) => { const r = new THREE.Group(); r.add(obj); r.userData.name = name || ''; items.push(r); return r; };
  const put = (prop, x, z, ry = 0, o = {}) => {
    const w = new THREE.Group(); w.add(prop); w.position.set(x, o.y || 0, z); w.rotation.y = ry;
    const r = root(w, o.name);
    if (o.fp) { const b = blob(o.fp[0], o.fp[1], o.op ?? 1); b.position.set(x, .012, z); b.rotation.z = -ry; r.add(b); }
    return r;
  };
  const wall = (prop, x, y, z, ry = 0, o = {}) => { prop.position.set(x, y, z); prop.rotation.y = ry; return root(prop, o.name); };
  const lay = (o) => { o.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(o); o.position.y -= b.min.y; return o; };
  const tilt = (obj, rx = 0, ry = 0, rz = 0) => { const g = new THREE.Group(); g.add(obj); g.rotation.set(rx, ry, rz); return g; };
  const grp = (...k) => { const g = new THREE.Group(); k.flat().forEach((o) => o && g.add(o)); return g; };
  return { items, put, wall, lay, tilt, grp };
}
