// Add a landing here with its thumbnail, introduction and destination.
const landings = [
  {name:'코들 수업 플랫폼',tag:'PLATFORM',group:'class',description:'수업 준비부터 코딩 실습, 피드백과 평가까지.',image:'assets/generated/codle-platform-v12/frame-laptop.webp',kind:'platform',links:[['플랫폼 알아보기','https://ai.codle.io/kr']]},
  {name:'코들 오리지널 콘텐츠',tag:'CONTENTS',group:'class',description:'AI 리터러시부터 융합 프로젝트까지, 수업의 영감.',image:'assets/cards/content-wall-18-original.webp',links:[['콘텐츠 둘러보기','https://ai.codle.io/kr/contents']]},
  {name:'코들 × 교과서',tag:'TEXTBOOK',group:'class',description:'책 속의 개념을 직접 해보는 디지털 실습으로.',image:'assets/generated/codle-textbook-logos-v1/publisher-logos.webp',links:[['씨마스 콘텐츠','https://cmass-contents.codle.io/cmass-ai-basics/web-exhibition'],['금성 · YBM 자료','https://exhibition.codle.io/']]},
  {name:'코들 AI 집중캠프',tag:'AI CAMP',group:'experience',description:'학교로 찾아가는 AI 교육. 함께 배우고 실습하는 하루.',image:'assets/cards/camp-classroom-v6.webp',links:[['캠프 알아보기','https://contents.codle.io/aicamp-landing']]},
  {name:'짓다 AI 해커톤',tag:'HACKATHON',group:'experience',description:'팀의 아이디어를 AI와 함께 작동하는 웹앱으로.',image:'assets/cards/hackathon-presentation.webp',links:[['해커톤 알아보기','https://landing.jitda.io/']]}
];
const catalog = document.getElementById('catalog');
function render(filter='all') {
  catalog.replaceChildren();
  const selected = landings.filter(item=>filter==='all'||item.group===filter);
  selected.forEach(item=>{
    const card=document.createElement('article'); card.className='landing-card';
    const visual=document.createElement('a'); visual.className='card-visual '+(item.kind||''); visual.href=item.links[0][1]; visual.target='_blank'; visual.rel='noopener noreferrer'; visual.setAttribute('aria-label',item.name+' 소개 보기 (새 탭)');
    const img=document.createElement('img'); img.src=item.image; img.alt=item.name+' 대표 이미지'; img.loading='lazy'; visual.append(img);
    if(item.kind==='platform'){const screen=document.createElement('img');screen.src='assets/generated/codle-platform-v10/screen-python.webp';screen.alt='';screen.className='card-screen';visual.append(screen);}
    const number=document.createElement('span');number.className='card-number';number.textContent=String(landings.indexOf(item)+1).padStart(2,'0');visual.append(number);
    const content=document.createElement('div');content.className='card-content';
    const tag=document.createElement('p');tag.className='card-tag';tag.textContent=item.tag;
    const name=document.createElement('h3');name.textContent=item.name;
    const desc=document.createElement('p');desc.className='card-description';desc.textContent=item.description;
    const links=document.createElement('div');links.className='card-links';
    item.links.forEach(([label,url])=>{const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.append(document.createTextNode(label+' '));const arrow=document.createElement('span');arrow.textContent='↗';a.append(arrow);links.append(a);});
    content.append(tag,name,desc,links);card.append(visual,content);catalog.append(card);
  });
  document.getElementById('result-count').textContent=selected.length+'개의 교육 서비스';
}
document.querySelector('[data-filter="all"] span').textContent=String(landings.length).padStart(2,'0');
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render(button.dataset.filter);}));
render();
