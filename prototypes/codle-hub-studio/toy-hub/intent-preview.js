(() => {
const buttons=document.querySelectorAll('.intent-choices button');
buttons.forEach(button=>{
 button.setAttribute('aria-pressed','false');
 button.addEventListener('click',()=>{
  buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  document.querySelectorAll('.service-card.intent-selected').forEach(card=>card.classList.remove('intent-selected'));
  document.querySelector('.service-card.'+button.dataset.card)?.classList.add('intent-selected');
  const select=document.querySelector('#inquiry-interest');
  if(select){select.value=button.dataset.service;select.dispatchEvent(new Event('change',{bubbles:true}));}
 });
});
})();
