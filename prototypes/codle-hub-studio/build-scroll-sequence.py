from pathlib import Path
import re
from html import escape

root=Path(__file__).parent
html=(root/'hero-opening.html').read_text(encoding='utf-8')
# Keep the approved clean wordmark, including the separate d/e counters.
svg=re.search(r'<svg class="logo".*?</svg>',html,re.S)
if svg:
    solid=re.search(r'<g class="logo-solid".*?</g>',svg.group(),re.S).group()
    solid=re.sub(r'\s(?:class|fill|stroke|stroke-opacity|stroke-width)="[^"]*"','',solid)
    (root/'codle-clean-mark.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 774.61 304.29">'+solid+'</svg>',encoding='utf-8')
else:
    solid=re.search(r'<g.*</g>',(root/'codle-clean-mark.svg').read_text(encoding='utf-8'),re.S).group()
jitda=(root/'hub-showroom/assets/jitda-logo.svg').read_text(encoding='utf-8')
jitda=re.sub(r'^.*?<svg[^>]*>|</svg>\s*$','',jitda,flags=re.S)
jitda=re.sub(r'<defs>.*?</defs>|<!--.*?-->','',jitda,flags=re.S)
mono=re.sub(r' class="st[0-3]"','',jitda)
for name,color in [('st0','#ffce2c'),('st1','#fcc204'),('st2','#e9ad03')]:
    jitda=jitda.replace(f'class="{name}"',f'fill="{color}"')
jitda=jitda.replace('class="st3"','')
defs=f'''<svg width="0" height="0" aria-hidden="true" style="position:absolute"><defs>
<linearGradient id="codle-surface" x1="0" y1="0" x2=".75" y2="1"><stop stop-color="#fffef3"/><stop offset=".4" stop-color="#e9e9f3"/><stop offset=".65" stop-color="#bfc3de"/><stop offset="1" stop-color="#f2f1df"/></linearGradient>
<linearGradient id="jitda-surface" x1="0" y1="0" x2=".6" y2="1"><stop stop-color="#fff9dd"/><stop offset=".5" stop-color="#eee5c2"/><stop offset="1" stop-color="#c8bc85"/></linearGradient>
<symbol id="codle-mark" viewBox="0 0 774.61 304.29">{solid}</symbol>
<symbol id="jitda-mark" viewBox="0 35 775 215">{jitda}</symbol>
<symbol id="jitda-depth" viewBox="0 35 775 215">{mono}</symbol>
</defs></svg>'''
def brand(name,label):
    return f'<div class="brand brand-{name}" role="img" aria-label="{label}"><div class="logo-object"><svg class="logo-layer logo-face" aria-hidden="true"><use href="#{name}-mark"/></svg></div></div>'
destinations=[('platform','수업 플랫폼','https://ai.codle.io/kr'),('contents','오리지널 콘텐츠','https://ai.codle.io/kr/contents'),('textbook','코들 × 교과서','https://exhibition.codle.io/'),('camp','AI 집중캠프','https://contents.codle.io/aicamp-landing'),('hack','AI 해커톤','https://landing.jitda.io/')]
links=''.join(f'<a class="panel {name}" href="{url}" tabindex="-1" aria-hidden="true"><h2>{escape(title)}</h2></a>' for name,title,url in destinations)
page=f'''<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="코들과 짓다. 매일의 수업부터 세상을 바꾸는 도전까지, 다섯 가지 배움의 경험을 만나보세요."><title>코들 × 짓다 · 배움의 다음 장면</title><link rel="stylesheet" href="scroll-sequence.css?v=3"><script type="importmap">{{"imports":{{"three":"./vendor/three/three.module.min.js"}}}}</script><script src="landing-previews.js?v=sequence-3" defer></script><script src="scroll-sequence.js?v=3" defer></script><script type="module" src="logo-3d.js?v=3"></script></head>
<body>{defs}<main class="story"><div class="stage">
<header class="topline"><span class="edition">배움의 다음 장면</span><div class="top-actions"><button class="skip-intro" type="button">바로 둘러보기 ↘</button><a href="https://ai.codle.io/kr/help/contact">도입 상담 ↗</a></div></header>
{brand('codle','코들')}{brand('jitda','짓다')}
<section class="hero" aria-hidden="true"><p class="eyebrow">A NEW CHAPTER OF LEARNING</p><h1><span>배움의 시작,</span><span><em>가능성의 확장.</em></span></h1><p class="description">매일의 수업부터 세상을 바꾸는 도전까지.<br>코들과 함께, 배움의 다음 장을 열어요.</p></section>
<nav aria-label="다섯 교육 상품">{links}</nav>
<div class="bottomline"><span class="scroll-rule"><i></i></span><span class="scroll-caption">스크롤해 배움의 다음 장면을 만나보세요</span><span class="scroll-arrow" aria-hidden="true">↓</span></div>
</div></main></body></html>'''
(root/'hero-opening.html').write_text(page,encoding='utf-8')
print('Scroll sequence page generated with both original vector logos.')
