"""Build index.html from _dev/tpl.html + fragments + the map. Run:  python -I _dev/assemble.py"""
import io, json
R = r'C:/Users/Cleo/Desktop/swift-junk-removal-v5/'
rd = lambda p: io.open(R + p, encoding='utf8').read()
tpl = rd('_dev/tpl.html')
sections = rd('_dev/frag-sections.html')
footer = rd('_dev/frag-footer.html')
out = tpl.replace('<!--SECTIONS-->', sections).replace('<!--FOOTER-->', footer)
io.open(R + 'index.html', 'w', encoding='utf8', newline='').write(out)
print('index.html', len(out))
