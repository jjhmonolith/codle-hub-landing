"""Record the completed 2026-10-19 browser review, superseding the draft record."""
from pathlib import Path
import json
import re
import html

root = Path(__file__).resolve().parents[1]
def read(name):
    return json.loads((root / name).read_text(encoding='utf-8'))
def save(name, data):
    (root / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

data = read('reference-directions.json')
items = {item['id']: item for item in data['items']}
items['platform']['image'] = '../product-feedback/platform-restored.png'
items['platform']['difference'] = 'Linear 적용안은 사용자 피드백으로 철회했습니다. 이미지는 이번 복원 후 실제 브라우저에서 확인한 화면입니다.'
items['textbook'].update(
    image='../product-feedback/textbook-desktop.png',
    implementation='실제 씨마스 표지가 책등을 축으로 약 110도 열리며 실제 33쪽을 드러냅니다. 열린 책이 옆으로 비켜나며 랜딩이 나타납니다.',
    difference='클릭을 스크롤로 옮기고 열리는 각도와 깊이를 조정했습니다. 표지 안쪽은 인쇄 없는 종이색입니다. 임의의 교과서 내용은 만들지 않았습니다. 데스크톱과 모바일 적용 화면을 검토했습니다.')
items['camp'].update(
    image='../product-feedback/camp-desktop.png',
    implementation='공식 활동 사진 세 장이 한 프레임을 공유하며 차례로 넓어집니다. 마지막 사진과 같은 프레임 안에서 랜딩이 왼쪽부터 나타납니다.',
    difference='클릭을 스크롤로 바꾼 적용안입니다. 사진을 늘이지 않고 보이는 영역만 바꿉니다. 이미지는 실제 캠프 자료를 적용한 검토 화면이며 레퍼런스 캡처가 아닙니다.')
items['jitda']['difference'] = '공식 마케팅 데모의 한 장면이며 실시간 생성이나 학생 작품이 아닙니다. 하나의 이미지 안에서 시야만 바꾸며, 랜딩이 나타날 때 데모가 옆으로 비켜납니다. 데스크톱과 모바일 적용 화면을 검토했습니다.'
data['method'] = '사용자 선호에 따라 플랫폼을 복원하고 나머지 장면을 조정했습니다. 새 Codrops 기준은 공식 원문과 데모 DOM으로 확인했습니다. 구현한 다섯 장면은 실제 로컬 브라우저의 데스크톱 및 390×844 모바일에서 검토했습니다. 레퍼런스 자체의 시각 검토와 구현 결과의 검토는 구분합니다.'
save('reference-directions.json', data)

page = root / 'reference-directions.html'
markup = page.read_text(encoding='utf-8')
esc = lambda text: html.escape(text, quote=True)
for item in data['items']:
    i = item['id']
    label = '적용 화면' if i in ('platform', 'textbook', 'camp') else '원본 레퍼런스'
    block = f'''<article id="{i}"><div class="visual"><a href="{esc(item['url'])}" target="_blank" rel="noopener"><img src="references/product-direction/{esc(item['image'])}" alt="{esc(label)}" loading="lazy"><span>{label} ↗</span></a></div><div class="detail"><p class="product">{esc(item['product'])}</p><h2>{esc(item['gesture'])}</h2><a class="source" href="{esc(item['url'])}" target="_blank" rel="noopener">{esc(item['reference'])} ↗</a><p>{esc(item['observed'])}</p><p class="application">{esc(item['implementation'])}</p><a class="preview" href="product-motion-study.html?product={i}">적용 장면 재생 <b>↗</b></a><details><summary>적용 범위</summary><p>{esc(item['difference'])}</p></details></div></article>'''
    markup = re.sub(fr'<article id="{i}">.*?</article>', lambda _: block, markup, flags=re.S)
markup = markup.replace('2026.10.18 · 새 교과서·캠프 기준은 공식 원문과 데모 DOM으로 확인했습니다. 이번 변경의 최종 시각 검토는 브라우저 캡처 장애로 대기 중입니다.', '2026.10.19 · 새 교과서·캠프 기준은 공식 원문과 데모 DOM으로 확인했습니다. 적용 결과는 데스크톱과 모바일에서 검토했습니다.')
page.write_text(markup, encoding='utf-8')

sources = read('assets/worlds/product-scene-sources.json')
sources['textbookMotion'] = 'Actual CMASS cover opens approximately 110 degrees around its spine to show actual page 33. Reduced projected depth keeps the page dominant. Unprinted inside cover, no invented content. Book moves aside as the opaque landing wipes in. Adapted from Codrops 3DBookShowcase, whose original opening is 160 degrees.'
sources['campMotion']['motion'] = 'Three authentic classroom photographs expand within one accordion frame without stretching. The final photograph and landing share bounds; an opaque horizontal wipe replaces the photo without transparent double exposure. Structural reference: Codrops CSS3ImageAccordion.'
sources['jitda']['motion'] = 'One continuous official demo image: reveal the right half on desktop, pan from request to result within a rounded portrait window on mobile. The demo moves aside as the opaque landing wipes in. Static marketing demo, not live generation or student work.'
save('assets/worlds/product-scene-sources.json', sources)

state = read('development-state.json')
state['updated'] = '2026-10-19'
state['status'] = 'product-feedback-browser-reviewed'
state['budget']['weeklyUsedAfterPass'] = 20
state['latestBackup'] = 'revisions/before-product-feedback'
state['currentPass'] = 'Restored the user-preferred platform tool flight and its landing/caption timing. Refined the 24-cover contents deck with thinner sheets, shallower peel and gradual fade; final bridge retained. Textbook opens the actual cover approximately 110 degrees to actual page 33; reduced depth and recentered page. Camp uses three authentic photographs in one cropped accordion frame. Jitda uses one official demo image, revealing request/result on desktop and panning across it on mobile. Removed transparent ghosting at the feature-to-landing transition: book/Jitda move aside, camp shares landing bounds, and all three reveal an opaque landing with a horizontal wipe. App v52, landing v25, volume v24, product-scene-motion v8, reference-actions v4, study v9. Actual desktop/mobile visual review and landing expansion/close completed. No commit, push, PR or deployment. Automation 3d remains PAUSED.'
state['pending'] = [
    'User art-direction review of the textbook, camp and Jitda adaptations; browser verification does not imply user design approval.',
    'High-resolution authentic content thumbnails remain deferred by user.',
    'Reduced-motion and WebGL fallback branches were preserved and source-reviewed, not browser-emulated in this pass.'
]
verified = '2026-10-19 final review: all five scenes visually checked on desktop and 390x844 mobile. Original logo intro visible. Textbook depth/header intrusion fixed; camp/Jitda composition checked. Mid-transition ghosting identified and corrected. Actual Jitda landing opens and closes on desktop/mobile; mobile focus returns to its link. All five iframe load counts remain one, horizontal overflow false, WebGL ready, stage scrollTop zero, local error logs empty. Six-viewport product-scene checks, shared content-stream checks, feature-order checks and runtime syntax checks pass. Proofs and runtime-check.json: references/product-feedback/. Screenshot capture failure from the earlier draft is resolved.'
if verified not in state['verified']:
    state['verified'].append(verified)
note = '2026-10-19 final browser review supersedes the earlier pending-capture note and historical book/robot/split-demo descriptions. Current runtime uses the restored platform, thinner contents deck, real book opening, photographic accordion and continuous official Jitda demo. Preview server restarted locally at 127.0.0.1:4187. Weekly usage 20 percent; automation remains PAUSED.'
if note not in state['reviewNotes']:
    state['reviewNotes'].append(note)
save('development-state.json', state)
print('Final review records updated.')
