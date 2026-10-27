(() => {
 const cards=[...document.querySelectorAll('[data-card]')];
 const categories=['platform','content','textbook','textbook','program','program'];
 const filters=[...document.querySelectorAll('[data-filter]')];
 const search=document.querySelector('#service-search');
 let selected='all';
 function update(){
  const query=search.value.trim().toLocaleLowerCase();let count=0;
  cards.forEach((card,i)=>{const matches=(selected==='all'||categories[i]===selected)&&card.textContent.toLocaleLowerCase().includes(query);card.hidden=!matches;if(matches)count++});
  document.querySelector('.hub-empty').hidden=count!==0;
  document.querySelector('#explore-title small').textContent=count;
 }
 filters.forEach(button=>button.addEventListener('click',()=>{selected=button.dataset.filter;filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));update()}));
 search.addEventListener('input',update);
})();
