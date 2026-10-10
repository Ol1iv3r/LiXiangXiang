import {createDocumentReader} from './document-reader.js';
export function openBooklet(number,trigger){
 const titles=['Watching while Eating','feel it'];
 if(!titles[number-1])return;
 const dialog=document.createElement('dialog');dialog.className='film-watch-dialog is-document-window';dialog.setAttribute('aria-label',titles[number-1]);
 dialog.innerHTML=`<div class="film-watch-window"><header class="film-watch-header"><div class="film-watch-tools"><button type="button" data-watch-close aria-label="Close booklet" autofocus><span aria-hidden="true">×</span></button></div><h2>${titles[number-1]}</h2><span></span></header><div class="film-watch-screen"></div></div>`;
 document.body.append(dialog);
 const reader=createDocumentReader(dialog.querySelector('.film-watch-screen'));
 dialog.querySelector('[data-watch-close]').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
 dialog.addEventListener('close',()=>{reader.destroy();dialog.remove();if(trigger?.isConnected)trigger.focus({preventScroll:true});},{once:true});
 dialog.showModal();reader.open({src:`/LiXiangXiang/assets/intro/booklets/booklet-${number}.pdf`});
}
