import json, math, io, sys
D = r'C:/Users/Cleo/Desktop/swift-junk-removal-v5/_dev/data/'
LON0, LON1, LAT0, LAT1 = -115.33, -114.85, 35.96, 36.33
K = 1000 / ((LON1 - LON0) * math.cos(math.radians(36.1)))
W = 1000
H = (LAT1 - LAT0) * K / math.cos(math.radians(36.1)) * math.cos(math.radians(36.1))  # same scale on both axes below
SC = 1000 / (LON1 - LON0)
def proj(lon, lat):
    x = (lon - LON0) * SC
    y = (LAT1 - lat) * SC / math.cos(math.radians(36.1))
    return x, y
HH = (LAT1 - LAT0) * SC / math.cos(math.radians(36.1))

def dp(pts, eps):
    if len(pts) < 3: return pts
    a, b = pts[0], pts[-1]
    dx, dy = b[0] - a[0], b[1] - a[1]
    L = math.hypot(dx, dy) or 1e-9
    dmax, idx = 0, 0
    for i in range(1, len(pts) - 1):
        d = abs(dy * pts[i][0] - dx * pts[i][1] + b[0] * a[1] - b[1] * a[0]) / L
        if d > dmax: dmax, idx = d, i
    if dmax > eps:
        return dp(pts[:idx + 1], eps)[:-1] + dp(pts[idx:], eps)
    return [a, b]

def path(pts, close=False):
    s = 'M' + ' '.join('%.1f %.1f' % p for p in pts[:1]) + 'L' + ' '.join('%.1f %.1f' % p for p in pts[1:])
    return s + ('Z' if close else '')

def inview(p):
    return -60 <= p[0] <= W + 60 and -60 <= p[1] <= HH + 60

def poly_paths(gj, eps=.7):
    polys = gj['coordinates'] if gj['type'] == 'MultiPolygon' else [gj['coordinates']]
    out = []
    for poly in polys:
        for ring in poly[:1]:
            pts = [proj(lon, lat) for lon, lat in ring]
            if not any(inview(p) for p in pts): continue
            k = max(range(len(pts)), key=lambda i: math.hypot(pts[i][0] - pts[0][0], pts[i][1] - pts[0][1]))
            pts = dp(pts[:k + 1], eps)[:-1] + dp(pts[k:], eps)
            if len(pts) > 3: out.append(path(pts, True))
    return out

def load(n):
    return json.load(open(D + n + '.json'))[0]

res = {'w': W, 'h': round(HH, 1)}
for key, f in [('lv', 'b_LasVegasNevada'), ('hend', 'b_HendersonNevada'), ('nlv', 'b_NorthLasVegasNevada'), ('par', 'b_ParadiseNevada'), ('spv', 'b_SpringValleyNevada'), ('ent', 'b_EnterpriseNevada'), ('sun', 'b_SunriseManorNevada'), ('sum', 'b_SummerlinSouthNevada')]:
    j = load(f)
    res[key] = poly_paths(j['geojson'])
    res[key + '_c'] = [round(c, 1) for c in proj(float(j['lon']), float(j['lat']))]

roads = json.load(open(D + 'roads.json'))['elements']
groups = {'i15': [], 'beltway': [], 'us95': [], 'other': []}
for e in roads:
    t = e.get('tags', {}); ref = t.get('ref') or ''
    pts = [proj(g['lon'], g['lat']) for g in e['geometry']]
    if not any(inview(p) for p in pts): continue
    pts = dp(pts, .6)
    if len(pts) < 2: continue
    if 'I 15' in ref: g = 'i15'
    elif 'CC 215' in ref or ref.startswith('I 215') or 'SR 564' in ref or 'NV 564' in ref: g = 'beltway'
    elif 'US 95' in ref or 'I 11' in ref: g = 'us95'
    else: g = 'other'
    groups[g].append(path(pts))
for g in groups: res['r_' + g] = ''.join(groups[g])

# primary arterials: integer, relative path, heavily simplified
def path_rel(pts):
    q = [(round(x), round(y)) for x, y in pts]
    out = [q[0]]
    for a in q[1:]:
        if a != out[-1]: out.append(a)
    if len(out) < 2: return ''
    d = 'M%d %d' % out[0]
    px, py = out[0]
    seg = ''
    for x, y in out[1:]:
        seg += 'l%d %d' % (x - px, y - py) if False else ' %d %d' % (x - px, y - py)
        px, py = x, y
    return d + 'l' + seg.strip().replace(' -', '-')
pri = json.load(open(D + 'primary.json'))['elements']
seen = set(); parts = []
for e in pri:
    pts = [proj(g['lon'], g['lat']) for g in e['geometry']]
    if not any(inview(p) for p in pts): continue
    pts = dp(pts, 1.1)
    if len(pts) < 2: continue
    L = sum(math.hypot(pts[i+1][0]-pts[i][0], pts[i+1][1]-pts[i][1]) for i in range(len(pts)-1))
    if L < 2.2: continue
    d = path_rel(pts)
    if d: parts.append(d)
res['r_pri'] = ''.join(parts)
print('pri paths', len(parts), len(res['r_pri']))
json.dump(res, io.open(D + 'map.json', 'w'), separators=(',', ':'))
tot = sum(len(json.dumps(v)) for v in res.values())
print('bytes', tot, 'h', res['h'])
for k in ['lv', 'hend', 'nlv', 'par', 'spv', 'ent', 'sun', 'sum']: print(k, len(res[k]), res[k + '_c'])
print({g: len(res['r_' + g]) for g in groups})
