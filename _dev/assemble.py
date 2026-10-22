"""Build index.html from _dev/tpl.html + fragments + the map. Run:  python -I _dev/assemble.py"""
import io, json
R = r'C:/Users/Cleo/Desktop/swift-junk-removal-v5/'
rd = lambda p: io.open(R + p, encoding='utf8').read()
tpl = rd('_dev/tpl.html')
sections = rd('_dev/frag-sections.html')
footer = rd('_dev/frag-footer.html')
m = json.load(io.open(R + '_dev/data/map.json', encoding='utf8'))

SC = 1000 / 0.48
def lonlat(lon, lat):
    import math
    return (lon + 115.33) * SC, (36.33 - lat) * SC / math.cos(math.radians(36.1))

def P(d, cls, extra=''):
    return '<path class="%s" d="%s"%s/>' % (cls, d, extra)

areas = ''.join(P(d, 'a') for k in ['par', 'spv', 'ent', 'sun', 'sum'] for d in m[k])
zones = (
    '<g id="zLV" class="z z-lv">' + ''.join(P(d, 'zp') for d in m['lv']) + '</g>'
    '<g id="zHE" class="z z-he">' + ''.join(P(d, 'zp') for d in m['hend']) + '</g>'
    '<g id="zNL" class="z z-nl">' + ''.join(P(d, 'zp') for d in m['nlv']) + '</g>'
)
roads = (P(m['r_pri'], 'r r-p') + P(m['r_other'], 'r r-o') + P(m['r_us95'], 'r r-95') + P(m['r_beltway'], 'r r-bw') + P(m['r_i15'], 'r r-15'))

lv = lonlat(-115.1398, 36.1699); he = lonlat(-114.9817, 36.0395); nl = lonlat(-115.1175, 36.1989)
hoods = [('Summerlin', -115.30, 36.17), ('Spring Valley', -115.25, 36.11), ('Enterprise', -115.22, 36.01), ('Green Valley', -115.08, 36.01), ('Anthem', -115.10, 35.98)]
hd = ''.join('<g class="hd"><circle cx="%.0f" cy="%.0f" r="4.5"/><text x="%.0f" y="%.0f">%s</text></g>' % (lonlat(lo, la) + (lonlat(lo, la)[0] + 11, lonlat(lo, la)[1] + 6, n)) for n, lo, la in hoods)
pins = (
    '<g id="pLV" class="pin" transform="translate(%.0f %.0f)"><circle class="pr" r="14"/><circle class="pr pr2" r="14"/><circle class="pd" r="9"/></g>' % lv +
    '<g id="pHE" class="pin" transform="translate(%.0f %.0f)"><circle class="pr" r="14"/><circle class="pr pr2" r="14"/><circle class="pd" r="9"/></g>' % he +
    '<g id="pNL" class="pin pin--alt" transform="translate(%.0f %.0f)"><circle class="pd" r="7"/></g>' % nl
)
labels = (
    '<text class="lb lb-lv" x="%.0f" y="%.0f">Las Vegas</text>' % (lv[0] + 24, lv[1] - 8) +
    '<text class="lb lb-he" x="%.0f" y="%.0f">Henderson</text>' % (he[0] - 24, he[1] - 24) +
    '<text class="lb lb-nl" x="%.0f" y="%.0f">North Las Vegas</text>' % (nl[0] + 14, nl[1] - 10) +
    '<text class="lb lb-rd" x="%.0f" y="%.0f">I-15</text>' % lonlat(-115.176, 36.09)
)
blobs = (
    '<circle id="bLV" class="blob" cx="%.0f" cy="%.0f" r="300" fill="url(#gb)"/>' % (lv[0] - 20, lv[1] + 30) +
    '<circle id="bHE" class="blob" cx="%.0f" cy="%.0f" r="250" fill="url(#gb)"/>' % (he[0] - 40, he[1] - 20)
)
defs = '<defs><radialGradient id="gb"><stop offset="0" stop-color="#ff5a1f" stop-opacity=".34"/><stop offset=".55" stop-color="#ff5a1f" stop-opacity=".14"/><stop offset="1" stop-color="#ff5a1f" stop-opacity="0"/></radialGradient></defs>'
svg = (
    '<svg class="map-svg" viewBox="0 0 %d %d" role="img" aria-label="Map of the Las Vegas valley">' % (m['w'], m['h']) + defs +
    '<rect class="m-bg" width="%d" height="%d"/>' % (m['w'], m['h']) +
    '<g class="m-areas">' + areas + '</g><g class="m-blobs">' + blobs + '</g><g class="m-roads">' + roads + '</g><g class="m-zones">' + zones + '</g>' +
    '<g class="m-hoods">' + hd + '</g><g class="m-pins">' + pins + '</g><g class="m-labels">' + labels + '</g></svg>'
    '<i class="map-radar" aria-hidden="true"></i>'
)
sections = sections.replace('<!--MAP-->', svg)
out = tpl.replace('<!--SECTIONS-->', sections).replace('<!--FOOTER-->', footer)
io.open(R + 'index.html', 'w', encoding='utf8', newline='').write(out)
print('index.html', len(out))
