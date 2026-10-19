"""Current spatial journey record; older feedback finalizers are historical."""
from pathlib import Path
import json, re, html
root=Path(__file__).resolve().parents[1]
def read(name): return json.loads((root/name).read_text(encoding='utf-8'))
def save(name,data): (root/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

record={
 'updated':'2026-10-19','status':'spatial-journey-ongoing','automationStatus':'ACTIVE',
 'userDirection':'Unseen/Lusion material and depth; keep 3D platform tools but remove vertical docking. Pass through a diagonal content stack, then fan it open. Textbook means printed books becoming digital learning, not a CMASS-only product. Camp uses an exploratory 3D metaphor. Jitda uses its real UI and official pickaxe-working character.',
 'budget':{'weeklyUsedAtStart':20,'latestUsedPercent':20,'stopNewWorkAtUsedPercent':58,'maximumUsedPercent':60,'userRemainingFloorPercent':40},
 'versions':{'app':56,'toys':24,'catalog':4,'landing-surface':29,'volume-worlds':28,'spatial-actions':4,'spatial-scene-motion':4,'spatial-choreography':4,'study':13},
 'implemented':[
  'Intro: one purposeful oblique reveal, reduced idle turn, broad physical reflections on the black face; original logos preserved.',
  'Platform: six official beveled tokens retain depth around the real lesson UI, never dock in a vertical list. The destination passes close to the camera and sweeps aside as the content stack arrives.',
  'Contents: original 24 authentic covers form a diagonal vanishing-point deck, pass the foreground, then pull back before opening into overlapping curved fans. The title waits until the fans settle; it no longer overlaps giant passing covers. No generated replacement thumbnails.',
  'Textbook: neutral portrait hardcover opens on its spine. A single real printed page bends and becomes the actual river-crossing activity from the official digital textbook. Original background/farmer/sheep/wolf/cabbage/boat graphics replace generic explanatory widgets. Sheep boards, travels with farmer and unloads on the opposite bank.',
  'Camp: glossy blue/black globe using Natural Earth land, official tool tokens and one continuous 3D flight route. No classroom photograph or robot.',
  'Jitda: public official side-character contours rebuilt as rounded volumes, with an inset golden stripe, black face and articulated pickaxe. Two strikes contact the work surface; particles occur after contact. Actual official public demo UI reveals the result. Mobile pans its large portrait window.',
  'Platform/book/Jitda landing reveal starts at the actual 3D screen transform and interpolates to the final readable frame. Camp uses a circular reveal. Five preloaded iframes stay mounted.'
 ],
 'verified':[
  'Unseen World entered without audio and dragged; Lusion homepage materials visually reviewed in the actual browser.',
  'Actual desktop and 390x844 mobile reviews exposed and corrected menu overlap, small Jitda UI, incorrect book construction, clipped digital panel, and transparent texture depth occlusion.',
  'check-spatial-journey.mjs: 320x570,390x844,768x600,965x884,1440x600,1920x1080; all 24 covers have a readable pass, finite camera-safe poses, stronger foreground depth, readable final destinations, no vertical token docking.',
  'Worker tip contacts the platform at both dust triggers. Puzzle farmer stays with the boat and sheep rides with it; passenger movement is continuous.',
  'Actual main page Jitda expansion/close works; all five iframe load counts stay one, no horizontal overflow. Cached local scene load measured 639ms; not a cold-network benchmark.',
  'Actual mobile main page: fully expanded 390x844 dialog at x0/y0 with transform none; actual external heading visible. Close restores focus, five iframe counts stay one, no horizontal overflow, stage.scrollTop zero.',
  'Current authentic textbook activity visually checked on desktop and mobile after fixing alpha-depth rectangles. At 960x600, textbook and Jitda clear navigation, title and controls. New opening and central hero visually checked in the main page.',
  'Contents unfold midpoint reviewed and corrected: quick pullback precedes spread, delayed copy prevents large cover/title collision. Static screenshot proofs include this midpoint.',
  'Proof directory references/spatial-development/. Desktop platform, deck, pass, fan, authentic book activity, camp, rounded worker, mobile scenes, short viewport, opening, hero and actual expanded landing captured. Reduced-motion/fallback code was preserved and source-reviewed, not browser-emulated this pass.'
 ],
 'pending':[
  'Continue full forward/reverse passes of the actual main page across all five products, judging camera pace and feature-to-landing rhythm rather than only independent study frames. Correct concrete observed issues.',
  'Review the entire mobile opening-to-five-products journey; individual mobile scenes and actual Jitda expansion/close have passed.',
  'Review content deck-to-fan rhythm in motion after the last pullback/copy correction; the new midpoint and final layout are visually checked.',
  'High-resolution original content thumbnails are deferred by the user; do not fabricate or upscale replacements.',
  'Continue only while concrete quality issues remain. Do not use tokens merely to reach the allowance.'
 ],
 'constraints':['sources read-only','No commit/push/PR/deploy','Preserve logos and five destinations','Preserve iframe preload/open/close and mobile/reduced-motion fallback','No subagents'],
 'historicalScripts':['scripts/update-product-feedback.py','scripts/finalize-product-feedback.py'],
 'currentMotionChecks':'check-spatial-journey.mjs and scripts/check-feature-sequence.mjs. Old product-scene-motion/check-product-scenes describe the previous pass, not the active spatial renderer.'
}
save('spatial-development.json',record)
state=read('development-state.json');state['status']=record['status'];state['budget'].update(weeklyUsedAtStart=20,weeklyUsedAfterPass=20,stopNewWorkAtUsedPercent=58,userMaximumUsedPercent=60)
state['currentPass']='Latest user direction and current implementation/verification are in spatial-development.json. New spatial renderer supersedes the restored vertical platform, old content drop, CMASS-cover showcase, camp photo accordion and Jitda-only flat image. Read the current record before continuing. New allowance is remaining 80 to 40 percent. Historical feedback finalizers must not overwrite this record.'
state['pending']=record['pending'];state['latestBackup']='revisions/before-spatial-journey';save('development-state.json',state)

sources=read('assets/worlds/product-scene-sources.json')
sources['retrieved']='2026-10-19'
sources['platform']='Official tool marks and actual content-ai.png lesson UI; spatial orbit, no vertical list.'
sources['textbookMotion']='Neutral modeled book, one authentic page 33 bends into its real river-crossing activity. Original official game graphics animate an illustrative valid first move. Publisher branding is not the feature focus. Not a live embedded game; the actual landing remains accessible.'
sources['campMotion']={'type':'Modeled exploration metaphor, no photo assets used in the active factory.','motion':'Glossy globe with Natural Earth land, official learning tools and continuous closed flight path.','landSource':'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson'}
sources['jitda']['motion']='Official character rebuilt as rounded volumes with two bounded mining strikes alongside its actual public marketing-demo UI; portrait pan on mobile. Not live generation or student work.'
sources['jitda']['characterSource']='jitda-worker.sources.json';sources['jitda']['landingPoster']='../actual-jitda-current.png — actual official school homepage captured 2026-10-19.'
save('assets/worlds/product-scene-sources.json',sources)
activity={'source':'https://cmass-contents.codle.io/cmass-ai-basics/web-exhibition','actualActivity':'https://cmass-contents.codle.io/test/test-sa/activity/river-crossing?phase=game','use':'One authentic example of print becoming digital learning. Not a claim that CMASS is the only textbook partner.','assets':[]}
for name,remote in [('river-board','p33_1.png'),('farmer','p33_1_1.png'),('cabbage','p33_1_2.png'),('wolf','p33_1_3.png'),('sheep','p33_1_4.png'),('boat','p33_1_5.png')]:activity['assets'].append({'file':f'textbook-{name}.png','url':'https://cmass-contents.codle.io/cmass/cmass-sa/'+remote})
save('assets/worlds/textbook-interaction.sources.json',activity)

board=read('reference-directions.json');items={x['id']:x for x in board['items']}
directions={
 'platform':('Unseen World','https://unseen.co/world/','platform-desktop','도구가 머무는 하나의 공간','검정 공간의 이미지가 앞뒤로 겹치고, 드래그하면 시점에 따라 배치가 달라집니다.','공식 도구 아이콘이 실제 수업 화면의 앞뒤에 머물고, 화면을 스쳐 콘텐츠 공간으로 이어집니다.','세로 목록을 없앴습니다. 자유 탐색 대신 제품 순서에 맞춘 스크롤 경로를 적용했습니다.'),
 'contents':('사용자 스케치 × Unseen World','https://unseen.co/world/','contents-fan-desktop','겹친 뭉치에서, 넓게 펼쳐지는 배움','사용자 스케치는 큰 카드들이 대각선으로 겹친 뭉치입니다. Unseen에서는 이미지가 서로 다른 깊이에 놓입니다.','실제 표지 24개가 대각선 뭉치로 시작해 크게 스쳐 지나가고, 두 겹의 굽은 부채꼴로 펼쳐집니다.','원본 썸네일 해상도는 그대로입니다. 커진 근경에서 흐려지는 원본은 사용자가 추후 교체할 예정입니다.'),
 'textbook':('Codrops Book Showcase × 실제 디지털 교과서','https://cmass-contents.codle.io/cmass-ai-basics/web-exhibition','textbook-digital-desktop','종이의 같은 문제가, 직접 해보는 활동으로','공식 전시 페이지는 실제 교과서 33쪽과 강 건너기 체험을 연결해 보여줍니다.','중립적인 서책에서 실제 페이지가 들리고, 같은 활동의 원본 그림으로 만든 디지털 퍼즐이 움직입니다.','하나의 실제 콘텐츠 사례입니다. 출판사 표지는 도입의 주인공으로 사용하지 않습니다. 시연 모션이며 실제 랜딩은 별도로 열립니다.'),
 'camp':('Lusion · 재질과 입체 공간','https://lusion.co/','camp-desktop','배움의 세계를 따라가는 탐험','첫 화면에서 넓은 반사가 파랑·검정 입체 오브젝트의 형태를 드러냅니다.','파랑·검정 지구와 수업 도구, 끊기지 않는 비행 경로로 탐험과 연결을 표현합니다.','참고 사이트의 모델을 복제한 것이 아니라, 캠프용으로 구성한 입체 메타포입니다. 실제 활동 사진은 사용하지 않습니다.'),
 'jitda':('짓다 공식 캐릭터와 UI','https://jitda.io/participant/sign-in','jitda-desktop','직접 짓는 캐릭터, 열리는 결과물','공식 앱의 공개 자료에는 측면 캐릭터와 곡괭이질 동작이 들어 있습니다.','공식 형태를 곡면 볼륨으로 만들고, 두 번의 작업 동작과 실제 데모 UI의 결과를 연결했습니다.','캐릭터 원형과 UI는 공식 자료입니다. 입체 재질·동작은 이 프로토타입에서 제작했습니다. 실시간 생성이나 학생 작품은 아닙니다.')
}
for i,values in directions.items():
    reference,url,image,gesture,observed,implementation,difference=values
    items[i].update(reference=reference,url=url,image='../spatial-development/'+image+'.png',gesture=gesture,observed=observed,implementation=implementation,difference=difference)
board['method']='Unseen의 무음 진입·드래그와 Lusion 첫 화면을 실제 브라우저에서 검토했습니다. 공식 교과서와 짓다의 공개 자료를 찾아 실제 제품 장면으로 적용했습니다. 아래 이미지는 이 프로토타입의 적용 화면입니다.'
save('reference-directions.json',board)
page=root/'reference-directions.html';markup=page.read_text(encoding='utf-8');esc=lambda s:html.escape(s,quote=True)
for item in board['items']:
    i=item['id'];block=f'''<article id="{i}"><div class="visual"><a href="{esc(item['url'])}" target="_blank" rel="noopener"><img src="references/product-direction/{esc(item['image'])}" alt="적용 화면" loading="lazy"><span>적용 화면 ↗</span></a></div><div class="detail"><p class="product">{esc(item['product'])}</p><h2>{esc(item['gesture'])}</h2><a class="source" href="{esc(item['url'])}" target="_blank" rel="noopener">{esc(item['reference'])} ↗</a><p>{esc(item['observed'])}</p><p class="application">{esc(item['implementation'])}</p><a class="preview" href="product-motion-study.html?product={i}">적용 장면 재생 <b>↗</b></a><details><summary>적용 범위</summary><p>{esc(item['difference'])}</p></details></div></article>'''
    markup=re.sub(fr'<article id="{i}">.*?</article>',lambda _:block,markup,flags=re.S)
markup=markup.replace('플랫폼은 이전 버전으로 복원하고, 나머지 제품은 실제 자료를 중심으로 다듬는 중입니다. 적용 장면과 기준 동작을 각각 확인할 수 있어요.','재질과 앞뒤 깊이를 중심으로 다섯 제품의 움직임을 다시 구성하고 있습니다. 실제 자료와 적용 장면을 함께 확인할 수 있어요.')
page.write_text(markup,encoding='utf-8')
print('Spatial development checkpoint and source records saved.')
