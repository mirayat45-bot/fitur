const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
const shell = $('.app-shell');
const canvas = $('#pageCanvas');
const blockList = $('#blockList');
let wizardStep = 1;
let chosenTemplate = 'business';
let selectedSnippet = null;
let chosenPurpose = 'Landing Produk';

const snippets = [
  {id:'gradient', cat:'cta', title:'Hero Gradient CTA', desc:'CTA besar dengan gradient dan tombol WA.', html:`<section class="block snippet-block" data-block="Gradient CTA"><div class="snippet-cta"><span class="eyebrow">Promo Spesial</span><h2>Siap bikin halaman yang jualan?</h2><p>Tambahkan CTA yang jelas agar pengunjung langsung klik.</p><a class="cta-main" href="#">Chat via WhatsApp</a></div></section>`},
  {id:'testimoni', cat:'proof', title:'Testimoni Pelanggan', desc:'3 kartu review singkat.', html:`<section class="features block" data-block="Testimoni"><div class="section-head"><span class="eyebrow">Testimoni</span><h2>Dipercaya customer yang butuh hasil cepat.</h2></div><div class="feature-grid"><article><span>★</span><h3>Rapi banget</h3><p>Website langsung enak dilihat dan gampang diedit.</p></article><article><span>★</span><h3>Fast respon</h3><p>Landing page jadi lebih cepat dari perkiraan.</p></article><article><span>★</span><h3>Mobile aman</h3><p>Dibuka di HP tetap mulus dan ringan.</p></article></div></section>`},
  {id:'pricing', cat:'pricing', title:'Paket Harga', desc:'Tabel harga simpel untuk jualan jasa.', html:`<section class="pricing block" data-block="Harga"><div class="price-card"><span class="badge">Starter</span><h2>Website Basic</h2><p>Landing page cepat untuk promosi.</p><div class="price">Rp199K</div><button class="cta-main">Pilih Paket</button></div><div class="price-list"><div>✓ 1 halaman</div><div>✓ Tombol WhatsApp</div><div>✓ Responsive HP</div><div>✓ SEO dasar</div></div></section>`},
  {id:'contact', cat:'contact', title:'Contact Card', desc:'Alamat, jam buka, dan tombol maps.', html:`<section class="features block" data-block="Kontak"><div class="section-head"><span class="eyebrow">Kontak</span><h2>Hubungi kami untuk mulai project.</h2></div><div class="feature-grid"><article><span>📍</span><h3>Alamat</h3><p>Kutoarjo, Purworejo, Jawa Tengah.</p></article><article><span>☎</span><h3>WhatsApp</h3><p>Fast response setiap hari kerja.</p></article><article><span>🗺</span><h3>Maps</h3><p>Buka lokasi langsung dari Google Maps.</p></article></div></section>`},
  {id:'faq', cat:'proof', title:'FAQ Accordion', desc:'Pertanyaan umum sebelum order.', html:`<section class="features block" data-block="FAQ"><div class="section-head"><span class="eyebrow">FAQ</span><h2>Pertanyaan yang sering ditanyakan.</h2></div><div class="price-list"><div><b>Apakah bisa custom?</b><br><span> Bisa, warna, teks, dan section bisa diedit.</span></div><div><b>Berapa lama pengerjaan?</b><br><span> Tergantung paket, mulai dari 1 hari.</span></div><div><b>Bisa pakai domain sendiri?</b><br><span> Bisa, nanti tinggal diarahkan ke hosting.</span></div></div></section>`}
];

function openModal(id){ $('#'+id).classList.add('show'); }
function closeModal(id){ $('#'+id).classList.remove('show'); }
function updateBlocks(){
  blockList.innerHTML = '';
  $$('.block', canvas).forEach((block, i)=>{
    const row = document.createElement('div');
    row.className = 'block-row';
    row.innerHTML = `<div><b>${block.dataset.block || 'Blok'}</b><span>Section ${i+1}</span></div><button title="Hapus">Hapus</button>`;
    row.addEventListener('click', e=>{
      if(e.target.tagName === 'BUTTON'){
        if($$('.block', canvas).length > 1){ block.remove(); updateBlocks(); updateExport(); }
        return;
      }
      block.scrollIntoView({behavior:'smooth', block:'center'});
      block.animate([{outline:'3px solid var(--accent)'},{outline:'0 solid transparent'}],{duration:900});
    });
    blockList.append(row);
  });
  updateExport();
}
function updateExport(){
  const html = `<!DOCTYPE html>\n<html lang="id">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>${$('#seoTitle').value}</title>\n<meta name="description" content="${$('#seoDesc').value}">\n<meta name="keywords" content="${$('#seoKeywords').value}">\n<style>/* Gunakan style.css dari prototype atau copy CSS section page-canvas */</style>\n</head>\n<body>\n${canvas.innerHTML}\n</body>\n</html>`;
  $('#htmlExport').value = html;
}
function setPanel(name){
  $$('.nav-item').forEach(b=>b.classList.toggle('active', b.dataset.panel===name));
  $$('.panel-section').forEach(p=>p.classList.toggle('active', p.dataset.content===name));
  if(['html','css','js'].includes(name)) $(`.panel-section[data-content="${name}"]`).classList.add('active');
}
function setAccent(color){
  document.documentElement.style.setProperty('--accent', color);
  $$('.swatches button,.color-choice button').forEach(b=>b.classList.toggle('active', b.dataset.accent===color));
}
function applyBrand(){
  const name = $('#brandName').value.trim() || 'Sky Builder';
  const tagline = $('#brandTagline').value.trim() || 'Website cepat untuk bisnis modern';
  $('#projectTitle').textContent = name;
  $('.hero h1').textContent = `${name}: ${tagline}`;
  $('.hero p').textContent = `Buat halaman ${chosenPurpose.toLowerCase()} yang modern, responsive, dan siap publish tanpa ribet.`;
  $('#slugPreview').textContent = name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'landing-page';
}
function setWizardStep(step){
  wizardStep = Math.max(1, Math.min(4, step));
  $$('.wizard-step').forEach(s=>s.classList.toggle('active', Number(s.dataset.step)===wizardStep));
  $$('.step-dots span').forEach((d,i)=>d.classList.toggle('on', i < wizardStep));
  $('#wizardBack').style.visibility = wizardStep === 1 ? 'hidden' : 'visible';
  $('#wizardNext').textContent = wizardStep === 4 ? 'Buat Halaman' : 'Lanjut';
}
function addSnippet(snippet){
  if(!snippet) return;
  canvas.insertAdjacentHTML('beforeend', snippet.html);
  canvas.append($('#addBlockBtn'));
  closeModal('snippetModal');
  updateBlocks();
}
function renderSnippets(filter='all', search=''){
  const list = $('#snippetList');
  list.innerHTML='';
  snippets.filter(s=>(filter==='all'||s.cat===filter) && (s.title+s.desc).toLowerCase().includes(search.toLowerCase())).forEach(s=>{
    const item=document.createElement('button');
    item.className='snippet-item';
    item.dataset.id=s.id;
    item.innerHTML=`<b>${s.title}</b><small>${s.desc}</small>`;
    item.onclick=()=>{
      selectedSnippet=s;
      $$('.snippet-item').forEach(x=>x.classList.toggle('selected', x.dataset.id===s.id));
      $('#snippetPreview').innerHTML=`<div class="snippet-preview-card"><b>${s.title}</b><p>${s.desc}</p><div style="height:90px;border-radius:10px;background:linear-gradient(135deg,var(--accent),transparent);opacity:.4;margin-top:14px"></div></div>`;
    };
    list.append(item);
  });
}
function chooseTemplate(template){
  chosenTemplate = template;
  if(template === 'linkbio'){
    canvas.innerHTML = `<section class="hero block" data-block="Link Bio"><div class="hero-copy"><span class="eyebrow">Link in Bio</span><h1>Semua link penting dalam satu halaman.</h1><p>Tambahkan katalog, WhatsApp, portfolio, dan sosial media dalam bentuk kartu modern.</p><div class="hero-buttons"><a class="cta-main">Buka Katalog</a><a class="cta-secondary">Instagram</a></div></div><div class="hero-visual"><div class="mock-browser"><div class="dots"><i></i><i></i><i></i></div><div class="price-list" style="margin-top:22px"><div>Produk Digital</div><div>Jasa Website</div><div>Template Canva</div></div></div></div></section><button class="add-block" id="addBlockBtn">+ Tambah Blok</button>`;
  } else if(template === 'event'){
    canvas.innerHTML = `<section class="hero block" data-block="Event"><div class="hero-copy"><span class="eyebrow">Event Page</span><h1>Acara spesial, halaman undangan rapi.</h1><p>Lengkap dengan countdown, lokasi, jadwal acara, RSVP, dan tombol kalender.</p><div class="hero-buttons"><a class="cta-main">Daftar Sekarang</a><a class="cta-secondary">Lihat Jadwal</a></div></div><div class="hero-visual"><div class="mock-browser"><div class="dots"><i></i><i></i><i></i></div><div class="mock-grid"><span></span><span></span><span></span><span></span></div></div></div></section><button class="add-block" id="addBlockBtn">+ Tambah Blok</button>`;
  } else if(template === 'blank'){
    canvas.innerHTML = `<section class="features block" data-block="Blank Section"><div class="section-head"><span class="eyebrow">Mulai dari kosong</span><h2>Tambahkan blok sesuai kebutuhan.</h2><p>Klik tombol tambah blok untuk menyisipkan hero, CTA, FAQ, harga, dan kontak.</p></div></section><button class="add-block" id="addBlockBtn">+ Tambah Blok</button>`;
  }
  const newAdd = $('#addBlockBtn');
  if(newAdd) newAdd.onclick=()=>openModal('snippetModal');
  applyBrand();
  updateBlocks();
}
function downloadHtml(){
  updateExport();
  const blob = new Blob([$('#htmlExport').value], {type:'text/html'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'sky-builder-export.html'; a.click();
  URL.revokeObjectURL(url);
}

$$('[data-close]').forEach(btn=>btn.onclick=()=>closeModal(btn.dataset.close));
$('#toggleSidebar').onclick=()=>$('#sidebar').classList.toggle('open');
$('#openWizard').onclick=()=>openModal('wizardModal');
$('#openTemplates').onclick=()=>openModal('templateModal');
$('#openSnippets').onclick=()=>openModal('snippetModal');
$('#addBlockBtn').onclick=()=>openModal('snippetModal');
$('#addBlockRight').onclick=()=>openModal('snippetModal');
$('#btnImportPreset').onclick=()=>{ setPanel('seo'); $('#seoTitle').focus(); };
$('#btnPublish').onclick=()=>{ applyBrand(); openModal('publishModal'); };
$('#btnSave').onclick=()=>{ localStorage.setItem('sky-builder-page', canvas.innerHTML); $('#savedState').textContent='Tersimpan lokal'; };
$('#btnPreview').onclick=()=>{ document.body.classList.toggle('preview-mode'); $('#btnPreview').textContent=document.body.classList.contains('preview-mode')?'Keluar Preview':'Preview'; };
$('#btnDashboard').onclick=()=>$('#dashboardDrawer').classList.add('show');
$('.close-drawer').onclick=()=>$('#dashboardDrawer').classList.remove('show');
$('#downloadHtml').onclick=downloadHtml;
$('#downloadFromPublish').onclick=downloadHtml;

$$('.nav-item').forEach(btn=>btn.onclick=()=>setPanel(btn.dataset.panel));
$$('.tool').forEach(btn=>btn.onclick=()=>{ $$('.tool').forEach(t=>t.classList.remove('active')); btn.classList.add('active'); canvas.style.width=btn.dataset.width; });
$$('.segmented button').forEach(btn=>btn.onclick=()=>{ $$('.segmented button').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); shell.dataset.theme=btn.dataset.mode; });
$$('[data-accent]').forEach(btn=>btn.onclick=()=>setAccent(btn.dataset.accent));
$('#fontSelect').onchange=e=>{ document.documentElement.style.setProperty('--font', e.target.value); };
$('#applySeo').onclick=()=>{ document.title=$('#seoTitle').value; updateExport(); alert('SEO dasar sudah diterapkan di export.'); };
$('#applyCustomCss').onclick=()=>{$('#runtimeCss').textContent=$('#customCss').value;};
$('#runCustomJs').onclick=()=>{ try{ new Function($('#customJs').value)(); alert('Custom JS berhasil dijalankan.'); }catch(e){ alert('Error JS: '+e.message); } };

$$('[data-purpose]').forEach(btn=>btn.onclick=()=>{ chosenPurpose=btn.dataset.purpose; $$('[data-purpose]').forEach(b=>b.classList.remove('selected')); btn.classList.add('selected'); });
$$('.template-cards [data-template], .template-list [data-template], .template-mini-grid [data-template]').forEach(btn=>btn.onclick=()=>{ chosenTemplate=btn.dataset.template; $$('[data-template]').forEach(b=>b.classList.toggle('selected', b.dataset.template===chosenTemplate)); $('.template-preview').innerHTML=`<div class="snippet-preview-card"><b>${btn.textContent.trim()}</b><p>Preview template ${chosenTemplate}</p><div style="height:180px;border-radius:10px;background:linear-gradient(135deg,var(--accent),transparent);opacity:.35"></div></div>`; });
$('#useTemplate').onclick=()=>{ chooseTemplate(chosenTemplate); closeModal('templateModal'); };
$('#wizardBack').onclick=()=>setWizardStep(wizardStep-1);
$('#wizardNext').onclick=()=>{
  if(wizardStep<4){ setWizardStep(wizardStep+1); return; }
  applyBrand();
  chooseTemplate(chosenTemplate);
  $$('.check-grid input:checked').forEach(input=>{
    const found = snippets.find(s=>s.id===input.value);
    if(found) addSnippet(found);
  });
  closeModal('wizardModal');
};

$$('#snippetModal .chip').forEach(chip=>chip.onclick=()=>{ $$('#snippetModal .chip').forEach(c=>c.classList.remove('active')); chip.classList.add('active'); renderSnippets(chip.dataset.filter, $('#snippetSearch').value); });
$('#snippetSearch').oninput=e=>renderSnippets($('#snippetModal .chip.active').dataset.filter, e.target.value);
$('#insertSnippet').onclick=()=>addSnippet(selectedSnippet || snippets[0]);

if(localStorage.getItem('sky-builder-page')){
  // deliberately keep wizard visible on first open; saved page can be restored after closing setup
}
setWizardStep(1);
renderSnippets();
updateBlocks();
