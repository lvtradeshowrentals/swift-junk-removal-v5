from PIL import Image
S=r'C:/Users/Cleo/Desktop/swift-junk-removal-v5/_dev/shots/stills/'
O=r'C:/Users/Cleo/Desktop/swift-junk-removal-v5/img/'
for n in ['scene-home','scene-furniture','scene-construction','scene-commercial','scene-yard']:
    im=Image.open(S+n+'.png').convert('RGBA')
    bb=im.getchannel('A').point(lambda a:255 if a>8 else 0).getbbox()
    c=im.crop(bb)
    W,H=1200,900
    k=min(W*0.9/c.width,H*0.88/c.height)
    c=c.resize((round(c.width*k),round(c.height*k)),Image.LANCZOS)
    out=Image.new('RGBA',(W,H),(0,0,0,0))
    out.alpha_composite(c,((W-c.width)//2,(H-c.height)//2+10))
    out.save(O+n+'.webp','WEBP',quality=90,method=6)
    print(n,c.size)
