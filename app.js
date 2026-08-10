async function loadGospel(){
  try{
 const date=new Date().toISOString().slice(0,10);
const response=await fetch(`https://api.aelf.org/v1/messes/${date}/france`);
if(!response.ok) return;

const data=await response.json();
const lectures=data.informations?.messes?.[0]?.lectures||[];
const gospel=lectures.find(x=>x.type==='evangile');

    if(gospel?.ref){
      state.gospel.date=date;
      state.gospel.reference=gospel.ref;
      state.gospel.title=gospel.titre||'Évangile du jour';
      state.gospel.text=gospel.contenu||'';
      save();
      render();
    }
  }catch(error){
    console.log('AELF indisponible',error);
  }
}
const KEY='ma-lectio-v17';
const defaultGospel={
  date:new Date().toISOString().slice(0,10),
  title:"Évangile du jour",
  reference:"Évangile du jour",
  text:"Le texte de l’Évangile du jour sera relié à la source choisie pour la version de production."
};
const state=JSON.parse(localStorage.getItem(KEY)||'null')||{
  screen:'home',step:0,gospel:defaultGospel,note:'',med:[] ,prayer:'',
  focus:'',dailyWord:'',resolution:'',entries:{},settings:{reminder:false,hour:20,minute:0}
};
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function dateFr(d){
  return new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'long',year:'numeric'}).format(new Date(d+'T12:00:00'))
}
function questions(){
  const t=state.gospel.text.toLowerCase();
  if(t.includes('peur')||t.includes('crainte')) return [
    "Que révèle cet Évangile sur la manière dont Jésus regarde nos peurs ?",
    "Quelle peur ou inquiétude portes-tu aujourd’hui ?",
    "Quel acte concret de confiance peux-tu poser aujourd’hui ?"
  ];
  return [
    "Quelle parole, quelle attitude ou quel geste de Jésus retient particulièrement ton attention ?",
    "Qu’est-ce que cette Parole vient rejoindre concrètement dans ta vie aujourd’hui ?",
    "À quelle réponse concrète le Seigneur t’invite-t-il aujourd’hui ?"
  ];
}
function guidedPrayer(){return "Seigneur Jésus, ouvre mon cœur à ta Parole. Montre-moi ce que tu veux transformer en moi aujourd’hui et donne-moi la grâce de te répondre avec confiance. Amen."}
function render(){
  const a=document.getElementById('app');
  let body='';
  if(state.screen==='home') body=home();
  else if(state.screen==='lectio') body=lectio();
  else if(state.screen==='med') body=med();
  else if(state.screen==='oratio') body=oratio();
  else if(state.screen==='contemplatio') body=contemplatio();
  else if(state.screen==='word') body=word();
  else if(state.screen==='resolution') body=resolution();
  else if(state.screen==='done') body=done();
  else if(state.screen==='journal') body=journal();
  else if(state.screen==='settings') body=settings();
  a.innerHTML=`<header><div class="brand">Ma Lectio Divina</div></header><main>${body}</main>${nav()}`;
  bind();
}
function nav(){
  return `<nav class="nav">
    <button class="${state.screen==='home'?'active':''}" data-go="home">⌂<br><span class="small">Aujourd’hui</span></button>
    <button class="${state.screen==='journal'?'active':''}" data-go="journal">▣<br><span class="small">Carnet</span></button>
    <button class="${state.screen==='settings'?'active':''}" data-go="settings">⚙<br><span class="small">Réglages</span></button>
  </nav>`;
}
function home(){
 return `<section class="center">
  <div class="iconbox"><img src="logo_mark.svg"></div>
  <h1>Un temps pour demeurer avec Dieu.</h1>
  <p class="quote">« Parle, Seigneur, ton serviteur écoute. »</p>
  <div class="card">
   <div class="eyebrow">L’ÉVANGILE DU JOUR</div><p class="small">${dateFr(state.gospel.date)}</p>
   <div class="ref">${esc(state.gospel.reference)}</div>
   <p>${esc(state.gospel.title)}</p>
   <div class="notice quote">${esc(state.gospel.text.split('\\n')[0])}</div><br>
   <button class="primary" data-action="start">COMMENCER MA LECTIO</button>
  </div>
  <div class="grid">
   <button class="day" data-go="journal"><b>📖 Mon Carnet</b><br><span class="small">${Object.keys(state.entries).length} Lectio enregistrée(s)</span></button>
   <button class="day" data-go="settings"><b>🔔 Mon rappel</b><br><span class="small">${state.settings.reminder?'Activé':'Désactivé'}</span></button>
  </div>
 </section>`;
}
function head(step,title,sub){return `<div class="step"><div class="eyebrow">ÉTAPE ${step} / 6</div><h1>${title}</h1><div class="sub">${sub}</div><div class="progress"><i style="width:${step/6*100}%"></i></div></div>`}
function lectio(){return head(1,'Lectio','Je lis lentement et j’accueille la Parole.')+
 `<div class="card"><div class="ref">${esc(state.gospel.reference)}</div><p class="quote">${esc(state.gospel.text)}</p></div>
 <div class="card"><h3>Ce qui retient mon attention</h3><textarea id="note" placeholder="Une parole, un geste, une émotion…">${esc(state.note)}</textarea></div>
 <button class="primary" data-action="to-med">CONTINUER →</button>`}
function med(){
 const q=questions();
 return head(2,'Meditatio','Je laisse la Parole rejoindre ma vie.')+
 `<div class="card">${q.map((x,i)=>`<div><b>${i+1}. ${esc(x)}</b><textarea class="med" data-i="${i}" placeholder="J’écris ici…">${esc(state.med[i]||'')}</textarea></div>`).join('')}</div>
 <button class="primary" data-action="to-oratio">CONTINUER →</button>`;
}
function oratio(){
 return head(3,'Oratio','Je réponds au Seigneur dans la prière.')+
 `<div class="card"><h3>Ma prière</h3><p>Parle simplement au Seigneur.</p><textarea id="prayer" placeholder="Seigneur Jésus, aujourd’hui…">${esc(state.prayer)}</textarea></div>
 <div class="card"><div class="eyebrow">UNE COURTE PRIÈRE</div><p class="quote">${esc(guidedPrayer())}</p></div>
 <div class="card"><div class="eyebrow">UNE PAROLE DE L’ÉGLISE</div><p class="quote">« Le Christ est proche des cœurs simples. »</p><p>— Saint Jean-Paul II</p><p class="small">Prototype : le catalogue vérifié complet sera relié dans la version de production.</p></div>
 <button class="primary" data-action="to-cont">CONTINUER →</button>`;
}
function contemplatio(){
 return head(4,'Contemplatio','Je demeure simplement avec le Seigneur.')+
 `<div class="card center"><div class="eyebrow">CONTEMPLER</div><h2>${esc(state.gospel.text.split('\\n')[0])}</h2>
 <p class="quote">Relis cette parole lentement. Regarde la scène de l’Évangile. Puis demeure en silence.</p>
 <button class="secondary" data-action="timer">Commencer 2 minutes</button>
 <p id="timer" class="small"></p></div>
 <button class="primary" data-action="to-word">CONTINUER →</button>`;
}
function word(){
 state.dailyWord=state.dailyWord||state.gospel.text.split('\\n')[0];
 return head(5,'Parole du jour','Je garde une parole avec moi.')+
 `<div class="card center"><div class="eyebrow">MA PAROLE</div><p class="quote">${esc(state.dailyWord)}</p>
 <button class="secondary" data-action="to-res">Choisir ma résolution</button></div>`;
}
function resolution(){
 return head(6,'Ma résolution','Je choisis un petit pas concret.')+
 `<div class="card"><p>Comment vais-je vivre cette Parole aujourd’hui ?</p><textarea id="resolution" placeholder="Aujourd’hui, je vais…">${esc(state.resolution)}</textarea></div>
 <button class="primary" data-action="finish">TERMINER MA LECTIO</button>`;
}
function done(){
 return `<section class="center"><div class="iconbox"><img src="logo_mark.svg"></div>
 <h1>Ta Lectio est terminée.</h1><p class="quote">Garde maintenant un peu de silence et laisse la Parole t’accompagner dans ta journée.</p>
 <p class="quote">« Demeurez en moi, comme moi en vous. »</p>
 <button class="primary" data-go="journal">OUVRIR MON CARNET</button><br><br><button class="link" data-go="home">REVENIR À L’ACCUEIL</button></section>`;
}
function journal(){
 const keys=Object.keys(state.entries).sort().reverse();
 return `<h1>Mon chemin de prière</h1><p>Relis ton cheminement, jour après jour.</p>
 <div class="card"><div class="eyebrow">LECTIO ENREGISTRÉES</div><h2>${keys.length}</h2><p class="small">Tes données restent dans ce navigateur grâce au stockage local.</p></div>
 ${keys.length?keys.map(k=>{const e=state.entries[k];return `<div class="card"><b>${dateFr(k)}</b><h3>${esc(e.reference)}</h3><p>${esc(e.dailyWord||'Lectio terminée')}</p><button class="secondary" data-entry="${k}">RELIRE</button></div>`}).join(''):'<div class="notice">Ton carnet est encore vide. Commence une Lectio pour y inscrire ta première journée.</div>'}`;
}
function settings(){
 return `<h1>Réglages</h1><p>Personnalise ton rythme de prière sans transformer la Lectio en obligation.</p>
 <div class="card"><label><input type="checkbox" id="reminder" ${state.settings.reminder?'checked':''}> Rappel quotidien</label>
 <p class="small">Sur iPhone, les notifications web dépendent du navigateur et du mode d’installation PWA. Cette version garde surtout le réglage en préparation.</p>
 <label>Heure <input id="hour" type="time" value="${String(state.settings.hour).padStart(2,'0')}:${String(state.settings.minute).padStart(2,'0')}"></label></div>
 <div class="notice">🌿 Le rappel est une invitation, pas une obligation.</div>`;
}
function bind(){
 document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{state.screen=b.dataset.go;save();render()});
 document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>action(b.dataset.action));
 document.querySelectorAll('[data-entry]').forEach(b=>b.onclick=()=>showEntry(b.dataset.entry));
}
function action(x){
 if(x==='start'){state.step=1;state.screen='lectio'}
 if(x==='to-med'){state.note=document.getElementById('note').value;state.screen='med'}
 if(x==='to-oratio'){state.med=[...document.querySelectorAll('.med')].map(x=>x.value);state.screen='oratio'}
 if(x==='to-cont'){state.prayer=document.getElementById('prayer').value;state.screen='contemplatio'}
 if(x==='to-word'){state.screen='word'}
 if(x==='to-res'){state.screen='resolution'}
 if(x==='finish'){
   state.resolution=document.getElementById('resolution').value;
   const key=state.gospel.date;
   state.entries[key]={date:key,reference:state.gospel.reference,note:state.note,med:state.med,prayer:state.prayer,dailyWord:state.dailyWord,resolution:state.resolution};
   state.screen='done';
 }
 if(x==='timer'){
   let n=120; const el=document.getElementById('timer'); el.textContent='02:00';
   const t=setInterval(()=>{n--;el.textContent=`${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;if(n<=0){clearInterval(t);el.textContent='Temps terminé. Demeure encore un instant en silence.'}},1000);
 }
 save();render();
}
function showEntry(k){
 const e=state.entries[k];
 alert(`${dateFr(k)}\\n\\n${e.reference}\\n\\nLectio : ${e.note||'—'}\\n\\nMeditatio : ${(e.med||[]).join('\\n\\n')||'—'}\\n\\nOratio : ${e.prayer||'—'}\\n\\nParole : ${e.dailyWord||'—'}\\n\\nRésolution : ${e.resolution||'—'}`);
}
document.addEventListener('change',e=>{
 if(e.target.id==='reminder'){state.settings.reminder=e.target.checked;save()}
 if(e.target.id==='hour'){const [h,m]=e.target.value.split(':').map(Number);state.settings.hour=h;state.settings.minute=m;save()}
});
render();
loadGospel();
