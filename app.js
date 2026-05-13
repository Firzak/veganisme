// ═══════════════════════════════════════════════
// VÉGANISME & SCIENCE — app.js
// ═══════════════════════════════════════════════

// ── NAVIGATION ────────────────────────────────
const PANELS = {
  nutrition:    'content',
  sante:        'content',
  environnement:'content',
  ethique:      'content',
  social:       'content',
  diet:         'diet-panel',
  impact:       'impact-panel',
  quiz:         'quiz-panel',
  questions:    'questions-panel',
};

let currentFilter = 'nutrition';

function nav(btn) {
  const filter = btn.dataset.filter;
  if (!filter) return;
  applyFilter(filter);
  // Close sidebar on mobile
  closeSidebar();
}

function applyFilter(filter) {
  currentFilter = filter;

  // Update nav active states
  document.querySelectorAll('.nav-btn, .nav-tool').forEach(b => b.classList.remove('active'));
  const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  // Hide all panels
  const allPanels = ['content', 'diet-panel', 'impact-panel', 'quiz-panel', 'questions-panel'];
  allPanels.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });

  // Show target panel
  const panelId = PANELS[filter] || 'content';
  const panel = document.getElementById(panelId);
  if (panel) panel.classList.add('active');

  // Filter cards if content panel
  if (panelId === 'content') {
    document.querySelectorAll('#content .card').forEach(card => {
      const show = card.dataset.category === filter;
      card.style.display = show ? 'block' : 'none';
      if (show && !card.classList.contains('visible')) {
        setTimeout(() => card.classList.add('visible'), 50);
      }
    });
    document.querySelectorAll('.section-label').forEach(label => {
      label.style.display = label.dataset.section === filter ? 'flex' : 'none';
    });
  }

  // Init quiz on first open
  if (filter === 'quiz') {
    const container = document.getElementById('quizContainer');
    if (container && !container.children.length) initQuiz();
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── SIDEBAR MOBILE ────────────────────────────
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('open');
}

// ── CARD TOGGLE ───────────────────────────────
function toggleCard(header) {
  header.closest('.card').classList.toggle('open');
}

// Intersection observer for card reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 50);
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.04 });
document.querySelectorAll('#content .card').forEach(card => observer.observe(card));

// ── RANDOM TOPIC ──────────────────────────────
function goRandom() {
  const categories = ['nutrition', 'sante', 'environnement', 'ethique', 'social'];
  const filter = categories[Math.floor(Math.random() * categories.length)];
  applyFilter(filter);

  setTimeout(() => {
    const cards = Array.from(document.querySelectorAll(`#content .card[data-category="${filter}"]`))
      .filter(c => c.style.display !== 'none');
    if (!cards.length) return;
    const card = cards[Math.floor(Math.random() * cards.length)];
    card.classList.add('open', 'visible');
    setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }, 80);

  closeSidebar();
}

// ── DIET STATE ────────────────────────────────
let currentSex = 'homme';
let currentObj = 'equilibre';

function selectSex(s) {
  currentSex = s;
  document.querySelectorAll('#btnH, #btnF').forEach(b => b.classList.remove('active'));
  document.getElementById(s === 'homme' ? 'btnH' : 'btnF').classList.add('active');
}

function selectObj(o) {
  currentObj = o;
  document.querySelectorAll('#objE, #objP, #objM').forEach(b => b.classList.remove('active'));
  const map = { equilibre: 'objE', perte: 'objP', muscle: 'objM' };
  document.getElementById(map[o]).classList.add('active');
}

// ── CALCULATION ENGINE ────────────────────────
function calcTDEE(sexe, age, taille, poids, pal) {
  let bmr;
  if (sexe === 'homme') bmr = 10 * poids + 6.25 * taille - 5 * age + 5;
  else bmr = 10 * poids + 6.25 * taille - 5 * age - 161;
  return Math.round(bmr * pal);
}
function calcTargetKcal(tdee, obj) {
  if (obj === 'perte') return Math.round(tdee * 0.82);
  if (obj === 'muscle') return Math.round(tdee * 1.12);
  return tdee;
}
function calcProtein(poids, obj) {
  const mult = obj === 'muscle' ? 2.0 : obj === 'perte' ? 1.8 : 1.6;
  return Math.round(poids * mult);
}
function scale(baseQty, factor) {
  return baseQty.replace(/(\d+(?:[.,]\d+)?)/g, (m) => {
    const v = parseFloat(m.replace(',', '.')) * factor;
    return v < 10 ? v.toFixed(1).replace('.0', '') : Math.round(v).toString();
  });
}

function buildMeals(kcalTarget, protTarget, poids, sexe, obj) {
  const refKcal = 2500, refProt = 120;
  const kF = kcalTarget / refKcal, pF = protTarget / refProt;
  const f = (kF + pF) / 2;

  const meals = [
    {
      time: 'Petit-déjeuner', emoji: '🌅',
      items: [
        { name: "Flocons d'avoine",       qty: scale('80g', f),    kcal: Math.round(296*kF), prot: Math.round(10*pF), note: 'Fibres, bêta-glucane, fer, zinc' },
        { name: 'Lait de soja fortifié',  qty: scale('300ml', f),  kcal: Math.round(120*kF), prot: Math.round(10*pF), note: 'Protéines complètes · Ca · B12 · D' },
        { name: 'Graines de lin moulues', qty: scale('15g', f),    kcal: Math.round(67*kF),  prot: Math.round(2*pF),  note: 'ALA oméga-3 — moudre avant utilisation' },
        { name: "Beurre d'amande",        qty: scale('15g', f),    kcal: Math.round(90*kF),  prot: Math.round(3*pF),  note: 'Zinc, vit E, graisses saines' },
        { name: 'Banane',                 qty: '1',                kcal: Math.round(90*kF),  prot: 1,                 note: 'Potassium, magnésium, glucides rapides' },
        { name: 'Graines de courge',      qty: scale('20g', f),    kcal: Math.round(110*kF), prot: Math.round(5*pF),  note: 'Zinc +++, magnésium, fer' },
      ],
      tip: "Moudre le lin libère les oméga-3. Les graines de courge = meilleure source végétale de zinc. Ne pas boire de thé ou café dans les 30 min (bloque le fer)."
    },
    {
      time: 'Déjeuner', emoji: '☀️',
      items: [
        { name: 'Lentilles vertes cuites',       qty: scale('200g', f),   kcal: Math.round(184*kF), prot: Math.round(14*pF), note: 'Fer, folates, zinc, protéines' },
        { name: 'Riz complet cuit',              qty: scale('180g', f),   kcal: Math.round(234*kF), prot: Math.round(5*pF),  note: 'Acides aminés complémentaires, fibres' },
        { name: 'Tofu ferme',                    qty: scale('100g', f),   kcal: Math.round(120*kF), prot: Math.round(10*pF), note: 'Protéines complètes, calcium' },
        { name: 'Épinards + brocoli sautés',     qty: scale('300g', f),   kcal: Math.round(80*kF),  prot: Math.round(6*pF),  note: 'K1, calcium, vitamine C, folates' },
        { name: "Huile d'olive",                 qty: scale('1 c.s.', f), kcal: Math.round(120*kF), prot: 0,                 note: 'Absorption vitamines liposolubles A/D/E/K' },
        { name: 'Jus de citron + curcuma + poivre', qty: 'à goût',        kcal: 5,                  prot: 0,                 note: 'Vitamine C → absorption du fer ×3' },
      ],
      tip: "Lentilles + riz = acides aminés complets. Le citron triple l'absorption du fer non-héminique. Tremper les lentilles la veille réduit les anti-nutriments."
    },
    {
      time: 'Collation', emoji: '🌿',
      items: [
        { name: 'Pois chiches rôtis',      qty: scale('80g', f),  kcal: Math.round(128*kF), prot: Math.round(7*pF), note: 'Zinc, fer, fibres' },
        { name: 'Noix du Brésil',          qty: '2 noix',         kcal: 65,                 prot: 1,                note: '⚠️ Exactement 2 = 100% sélénium/jour' },
        { name: 'Noix de cajou ou amandes',qty: scale('25g', f),  kcal: Math.round(140*kF), prot: Math.round(4*pF), note: 'Zinc, magnésium, vitamine E' },
        { name: 'Orange ou pomme',         qty: '1',              kcal: 70,                 prot: 0,                note: 'Vitamine C, fibres, antioxydants' },
      ],
      tip: "Les noix du Brésil sont à dose fixe : exactement 2/jour. Au-delà de 4, risque de toxicité au sélénium."
    },
    {
      time: 'Dîner', emoji: '🌙',
      items: [
        { name: 'Tempeh (ou tofu ferme)',   qty: scale('150g', f),      kcal: Math.round(185*kF), prot: Math.round(17*pF), note: 'Protéines complètes, K2 MK-7, probiotiques' },
        { name: 'Patate douce',             qty: scale('200g', f),      kcal: Math.round(172*kF), prot: Math.round(3*pF),  note: 'Bêta-carotène (pro-vit A), potassium, fibres' },
        { name: 'Chou kale ou bok choy',    qty: scale('200g', f),      kcal: Math.round(70*kF),  prot: Math.round(5*pF),  note: 'Calcium très biodisponible, K1, vit C' },
        { name: 'Tahini (sésame)',          qty: scale('20g', f),       kcal: Math.round(116*kF), prot: Math.round(3*pF),  note: 'Calcium, zinc, cuivre' },
        { name: 'Quinoa (si + de glucides)',qty: scale('80g cuit', f),  kcal: Math.round(96*kF),  prot: Math.round(3*pF),  note: 'Protéine complète, optionnel' },
      ],
      tip: "Préférer le tempeh fermenté : sa K2 naturelle (MK-7) dirige le calcium vers les os. Cuisiner en grande quantité et congeler."
    },
  ];

  if (obj === 'muscle' || kcalTarget > 2800) {
    meals.push({
      time: 'Encas soir', emoji: '🌛',
      items: [
        { name: 'Pain complet',   qty: scale('2 tranches', f), kcal: Math.round(140*kF), prot: Math.round(6*pF), note: 'Fibres, fer, zinc' },
        { name: 'Houmous maison', qty: scale('60g', f),        kcal: Math.round(130*kF), prot: Math.round(5*pF), note: 'Légumineuses + tahini = calcium + zinc' },
      ],
      tip: "Cet encas est particulièrement utile après le sport pour la récupération musculaire."
    });
  }
  return meals;
}

// ── RENDER DIET ───────────────────────────────
function generateDiet() {
  const age    = parseInt(document.getElementById('inputAge').value);
  const taille = parseInt(document.getElementById('inputTaille').value);
  const poids  = parseInt(document.getElementById('inputPoids').value);
  const pal    = parseFloat(document.getElementById('inputActivite').value);
  const err    = document.getElementById('formError');

  if (!age    || age < 15    || age > 90)    { err.textContent = 'Âge invalide (15–90 ans).';      err.style.display = 'block'; return; }
  if (!taille || taille < 140 || taille > 220){ err.textContent = 'Taille invalide (140–220 cm).'; err.style.display = 'block'; return; }
  if (!poids  || poids < 30  || poids > 200) { err.textContent = 'Poids invalide (30–200 kg).';    err.style.display = 'block'; return; }
  err.style.display = 'none';

  const kcal  = calcTargetKcal(calcTDEE(currentSex, age, taille, poids, pal), currentObj);
  const prot  = calcProtein(poids, currentObj);
  const meals = buildMeals(kcal, prot, poids, currentSex, currentObj);
  const objLabel = { equilibre: 'Maintien', perte: 'Perte de poids', muscle: 'Prise de masse' }[currentObj];
  const objColor = { equilibre: 'var(--green)', perte: 'var(--accent)', muscle: 'var(--amber)' }[currentObj];

  document.getElementById('dietForm').style.display = 'none';
  const result = document.getElementById('dietResult');

  // Macros summary
  let html = `
  <div style="text-align:center; margin-bottom:1.5rem;">
    <p style="font-family:'Lora',serif; font-size:1.3rem; font-weight:700; color:var(--text); margin-bottom:0.3rem;">Votre plan alimentaire</p>
    <p style="color:var(--text-muted); font-size:0.82rem;">${currentSex === 'homme' ? '♂' : '♀'} ${age} ans · ${taille} cm · ${poids} kg · ${objLabel}</p>
  </div>
  <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:0.6rem; margin-bottom:1.5rem;">
    ${[
      { label: 'Calories cible', val: kcal + ' kcal', color: 'var(--amber)' },
      { label: 'Protéines cible', val: prot + 'g/jour', color: 'var(--green)' },
      { label: 'Objectif', val: objLabel, color: objColor },
    ].map(s => `
    <div style="background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:0.85rem; text-align:center;">
      <div style="font-size:1.05rem; font-weight:700; color:${s.color}; margin-bottom:0.2rem;">${s.val}</div>
      <div style="font-size:0.65rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em;">${s.label}</div>
    </div>`).join('')}
  </div>`;

  // Meals
  meals.forEach(meal => {
    const mKcal = meal.items.reduce((a, i) => a + i.kcal, 0);
    const mProt = meal.items.reduce((a, i) => a + i.prot, 0);
    html += `
    <div class="meal-card">
      <div class="meal-header" onclick="this.nextElementSibling.classList.toggle('open')">
        <span class="meal-emoji">${meal.emoji}</span>
        <div class="meal-info">
          <div class="meal-name">${meal.time}</div>
          <div class="meal-bar">
            <div class="bar-wrap">
              <div class="bar-label">${mKcal} kcal</div>
              <div class="bar-track"><div class="bar-fill kcal" style="width:${Math.min(100, mKcal/40)}%"></div></div>
            </div>
            <div class="bar-wrap">
              <div class="bar-label">${mProt}g protéines</div>
              <div class="bar-track"><div class="bar-fill prot" style="width:${Math.min(100, mProt/0.4)}%"></div></div>
            </div>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="color:var(--text-subtle); flex-shrink:0; transition:transform .3s;">
          <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="meal-body">
        ${meal.items.map(it => `
        <div class="meal-item">
          <div>
            <div class="item-name">${it.name}</div>
            <div class="item-note">${it.note}</div>
          </div>
          <div>
            <div class="item-qty">${it.qty}</div>
            <div class="item-cals">${it.kcal} kcal · ${it.prot}g</div>
          </div>
        </div>`).join('')}
        <div class="meal-tip">💡 ${meal.tip}</div>
      </div>
    </div>`;
  });

  // Supplements
  const suppNote = currentSex === 'femme'
    ? 'Femmes en âge de procréer : vérifier aussi l\'apport en fer et iode avec un médecin.'
    : 'Bilan sanguin annuel recommandé : B12 (holotranscobalamine), 25-OH-D3, ferritine, zinc.';

  html += `
  <div style="background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:1.25rem; margin-top:1.25rem; margin-bottom:1rem;">
    <div class="studies-title" style="margin-bottom:0.85rem;">💊 Suppléments obligatoires</div>
    ${[
      { name: 'Vitamine B12',          dose: '250 µg/jour',        note: 'Cyanocobalamine ou méthylcobalamine — seul supplément strictement obligatoire' },
      { name: 'Vitamine D3 + K2 MK-7', dose: '2000 UI D3 + 100 µg K2', note: 'Prendre ensemble — D3 végane (lichen). K2 dirige le calcium vers les os' },
      { name: 'Oméga-3 DHA/EPA (algues)', dose: '500 mg DHA+EPA/jour', note: 'La conversion ALA→DHA est trop faible (<5%). Chercher "algae omega-3 vegan"' },
      { name: 'Iode',                  dose: '150 µg/jour',        note: 'Via sel iodé (½ c.c./jour) — solution la plus simple' },
    ].map(s => `
    <div class="supp-row">
      <div class="supp-name">${s.name}</div>
      <div class="supp-dose">${s.dose}</div>
      <div class="supp-note">${s.note}</div>
    </div>`).join('')}
    <div class="info-box blue" style="margin-top:0.85rem; margin-bottom:0;">🩺 ${suppNote}</div>
  </div>`;

  // Shopping list
  const allItems = {};
  meals.forEach(meal => meal.items.forEach(it => {
    if (it.qty !== 'à goût' && !allItems[it.name]) allItems[it.name] = { name: it.name, qty: it.qty };
  }));
  const fixed = [
    { name: 'Vitamine B12 (supplément)', qty: '250 µg/jour' },
    { name: 'Vitamine D3 + K2 (supplément)', qty: '2000 UI + 100 µg/j' },
    { name: 'Oméga-3 algues DHA/EPA (supplément)', qty: '500 mg/jour' },
    { name: 'Sel iodé', qty: '½ c.c./jour' },
  ];

  html += `
  <div style="background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:1.25rem; margin-bottom:1rem;">
    <div class="studies-title" style="margin-bottom:0.5rem;">🛒 Liste de courses</div>
    <p style="font-size:0.78rem; color:var(--text-muted); margin-bottom:0.85rem;">Cochez ce que vous avez déjà, puis générez la liste texte à copier-coller.</p>
    <div id="shoppingList"></div>
    <div style="margin-top:0.85rem; display:flex; flex-direction:column; gap:0.5rem;">
      <button onclick="generateShoppingText()" style="padding:0.65rem; background:var(--green); color:#080e08; border:none; border-radius:8px; font-size:0.85rem; font-weight:700; font-family:'DM Sans',sans-serif; cursor:pointer;">Générer ma liste →</button>
      <div id="shoppingTextBox" style="display:none;">
        <div style="font-size:0.65rem; text-transform:uppercase; letter-spacing:0.15em; color:var(--text-subtle); margin-bottom:0.4rem; margin-top:0.6rem;">📋 Copiez-collez où vous voulez</div>
        <textarea id="shoppingTextArea" readonly onclick="this.select()" style="width:100%; min-height:160px; background:var(--surface2); border:1px solid var(--border); border-radius:8px; color:var(--text); font-size:0.8rem; font-family:'DM Mono',monospace; padding:0.65rem; resize:vertical; outline:none; line-height:1.7; cursor:text;"></textarea>
        <button onclick="copyList(event)" style="margin-top:0.4rem; width:100%; padding:0.55rem; background:var(--surface2); border:1px solid var(--border); border-radius:8px; color:var(--text-muted); font-size:0.8rem; font-family:'DM Sans',sans-serif; cursor:pointer;">📋 Copier la liste</button>
      </div>
    </div>
  </div>

  <div style="text-align:center; margin-bottom:0.5rem;">
    <button onclick="resetDiet()" style="background:transparent; border:1px solid var(--border); color:var(--text-muted); padding:0.55rem 1.25rem; border-radius:8px; cursor:pointer; font-size:0.82rem; font-family:'DM Sans',sans-serif;">← Modifier mon profil</button>
  </div>`;

  result.innerHTML = html;
  result.style.display = 'block';

  // Populate shopping list
  const sl = document.getElementById('shoppingList');
  if (!sl) return;

  const renderShopGroup = (title, items) => {
    const div = document.createElement('div');
    div.style.marginBottom = '0.75rem';
    div.innerHTML = `<div class="shop-group-label">${title}</div>`;
    items.forEach(item => {
      const label = document.createElement('label');
      label.className = 'shop-item';
      label.innerHTML = `
        <input type="checkbox" data-item="${item.name}" style="accent-color:var(--green); width:15px; height:15px; flex-shrink:0; cursor:pointer;">
        <span class="shop-item-name">${item.name}</span>
        <span class="shop-item-qty">${item.qty}</span>`;
      div.appendChild(label);
    });
    return div;
  };
  sl.appendChild(renderShopGroup('🥦 Aliments', Object.values(allItems)));
  sl.appendChild(renderShopGroup('💊 Compléments', fixed));
}

function generateShoppingText() {
  const checked = new Set();
  document.querySelectorAll('#shoppingList input[type=checkbox]:checked').forEach(cb => checked.add(cb.dataset.item));
  const lines = [];
  document.querySelectorAll('#shoppingList > div').forEach(group => {
    const title = group.querySelector('.shop-group-label')?.textContent || '';
    const items = [];
    group.querySelectorAll('.shop-item').forEach(lbl => {
      const cb = lbl.querySelector('input');
      if (cb && !checked.has(cb.dataset.item)) {
        const name = lbl.querySelector('.shop-item-name')?.textContent || '';
        const qty  = lbl.querySelector('.shop-item-qty')?.textContent || '';
        items.push(`- ${name}  (${qty})`);
      }
    });
    if (items.length) { lines.push(title.toUpperCase()); lines.push(...items); lines.push(''); }
  });

  if (!lines.length) { alert('Tous les ingrédients sont cochés !'); return; }
  const content = `LISTE DE COURSES VEGAN\n${'─'.repeat(35)}\n\n${lines.join('\n')}\n${'─'.repeat(35)}\nGénérée par Véganisme & Science`;
  document.getElementById('shoppingTextArea').value = content;
  document.getElementById('shoppingTextBox').style.display = 'block';
  document.getElementById('shoppingTextArea').select();
}

function copyList(e) {
  const ta = document.getElementById('shoppingTextArea');
  ta.select();
  try {
    navigator.clipboard.writeText(ta.value).then(() => {
      e.target.textContent = '✅ Copié !';
      setTimeout(() => e.target.textContent = '📋 Copier la liste', 2000);
    });
  } catch { document.execCommand('copy'); }
}

function resetDiet() {
  document.getElementById('dietResult').style.display = 'none';
  document.getElementById('dietResult').innerHTML = '';
  document.getElementById('dietForm').style.display = 'block';
}

// ── IMPACT CALCULATOR ─────────────────────────
const IMPACT = {
  omni:  { co2: 2500, eau: 740000, terre: 2700, animaux: 100 },
  vegan: { co2: 900,  eau: 270000, terre: 680,  animaux: 6  },
};

function calcImpact() {
  const years  = parseInt(document.getElementById('impactYears').value)  || 0;
  const months = parseInt(document.getElementById('impactMonths').value) || 0;
  const err    = document.getElementById('impactError');

  if (years === 0 && months === 0) {
    err.textContent = 'Entrez au moins 1 mois.';
    err.style.display = 'block';
    return;
  }
  err.style.display = 'none';

  const frac  = (years * 12 + months) / 12;
  const durLabel = years > 0
    ? `${years} an${years > 1 ? 's' : ''}${months > 0 ? ` et ${months} mois` : ''}`
    : `${months} mois`;

  const saved = {
    co2:     Math.round((IMPACT.omni.co2     - IMPACT.vegan.co2)     * frac),
    eau:     Math.round((IMPACT.omni.eau     - IMPACT.vegan.eau)     * frac),
    terre:   Math.round((IMPACT.omni.terre   - IMPACT.vegan.terre)   * frac),
    animaux: Math.round((IMPACT.omni.animaux - IMPACT.vegan.animaux) * frac),
  };

  const fmt = n => n.toLocaleString('fr-FR');
  const stats = [
    { emoji: '🌡️', label: 'CO₂ économisé',    val: `${fmt(saved.co2)} kg`,    sub: `≈ ${Math.round(saved.co2 / 120)} vols Paris–New York`,   color: 'var(--green)' },
    { emoji: '💧', label: 'Eau économisée',    val: `${fmt(saved.eau)} L`,     sub: `≈ ${Math.round(saved.eau / 50)} bains remplis`,          color: 'var(--accent)' },
    { emoji: '🌍', label: 'Terres préservées', val: `${fmt(saved.terre)} m²`,  sub: `≈ ${(saved.terre / 10000).toFixed(2)} hectares`,         color: 'var(--amber)' },
    { emoji: '🐮', label: 'Animaux non tués',  val: `~${fmt(saved.animaux)}`,  sub: 'estimation conservative (vertébrés)',                    color: '#e55' },
  ];

  document.getElementById('impactForm').style.display = 'none';
  const res = document.getElementById('impactResult');
  res.innerHTML = `
  <div style="text-align:center; margin-bottom:1.25rem;">
    <p style="font-family:'Lora',serif; font-size:1.2rem; font-weight:700; color:var(--green);">En ${durLabel} de véganisme, vous avez évité :</p>
  </div>
  <div class="stats-grid">
    ${stats.map(s => `
    <div class="stat-card">
      <div class="stat-emoji">${s.emoji}</div>
      <div class="stat-val" style="color:${s.color};">${s.val}</div>
      <div class="stat-label">${s.label}</div>
      <div class="stat-sub">${s.sub}</div>
    </div>`).join('')}
  </div>
  <div class="info-box blue">📚 <strong>Sources :</strong> ADEME (2022) · Poore & Nemecek, <em>Science</em> 360:987 (2018) · FAO, Livestock and Environment (2023) · Water Footprint Network, Mekonnen & Hoekstra (2012). Estimations conservatives basées sur la littérature scientifique.</div>
  <div style="text-align:center;">
    <button class="btn-secondary" onclick="document.getElementById('impactResult').style.display='none';document.getElementById('impactForm').style.display='flex';">← Recalculer</button>
  </div>`;
  res.style.display = 'block';
}

// ── QUIZ ──────────────────────────────────────
const QUESTIONS = [
  { q: "Quelle vitamine est OBLIGATOIREMENT à supplémenter dans un régime vegan ?", opts: ["Vitamine D", "Vitamine B12", "Vitamine C"], a: 1 },
  { q: "Quelle part des terres agricoles mondiales est utilisée par l'élevage ?", opts: ["40%", "60%", "80%"], a: 2 },
  { q: "Selon Poore & Nemecek (Science, 2018), un monde vegan réduirait les terres agricoles de :", opts: ["~30%", "~50%", "~75%"], a: 2 },
  { q: "Quelle proportion du soja mondial sert à nourrir les animaux d'élevage ?", opts: ["Environ 20%", "Environ 45%", "Environ 70–75%"], a: 2 },
  { q: "La vitamine B12 est produite par :", opts: ["Les animaux eux-mêmes", "Des bactéries du sol", "Le soleil"], a: 1 },
  { q: "Quel acide gras oméga-3 est crucial pour le cerveau et insuffisant dans les végétaux ?", opts: ["ALA", "DHA/EPA", "Acide linoléique"], a: 1 },
  { q: "Quelle est la meilleure source végane de sélénium ?", opts: ["Les épinards", "2 noix du Brésil par jour", "Le tofu"], a: 1 },
  { q: "Le fumier animal est-il indispensable à l'agriculture végétale ?", opts: ["Oui, sans alternative viable", "Non, les légumineuses et le compost peuvent le remplacer", "Seulement pour les céréales"], a: 1 },
  { q: "Quel est l'impact de la réintroduction des loups sur les cervidés à Yellowstone ?", opts: ["Aucun effet notable", "Augmentation des cervidés", "Régulation naturelle efficace sans chasse"], a: 2 },
  { q: "Les abeilles domestiques sont-elles les meilleures pollinisatrices pour toutes les cultures ?", opts: ["Oui, elles pollinisent mieux que toutes les autres espèces", "Non, les pollinisateurs sauvages sont souvent plus efficaces", "Seulement pour les fruits"], a: 1 },
  { q: "Quelle est la principale cause de déforestation amazonienne ?", opts: ["L'exploitation forestière", "L'élevage et les cultures fourragères", "L'urbanisation"], a: 1 },
  { q: "Un vegan doit-il refuser un médicament vital testé sur des animaux ?", opts: ["Oui, par cohérence éthique", "Non, la définition inclut 'autant que possible et praticable'", "Seulement les médicaments contenant des produits animaux"], a: 1 },
  { q: "Les régimes végétaux sont associés à une réduction du risque de :", opts: ["Carences uniquement", "Maladies cardiovasculaires, diabète T2 et certains cancers", "Aucune maladie chronique"], a: 1 },
  { q: "Les polymorphismes FADS1/FADS2 affectent chez les végans :", opts: ["L'absorption du calcium", "La conversion des oméga-3 végétaux (ALA) en DHA/EPA", "La synthèse de la vitamine D"], a: 1 },
  { q: "Si les plantes souffraient, manger vegan tuerait :", opts: ["Plus de plantes qu'un régime omnivore", "Autant de plantes", "Moins de plantes, car on évite l'intermédiaire animal inefficace"], a: 2 },
  { q: "Selon Dinu et al. (2017), un régime vegan est associé à une réduction du risque de cancer total de :", opts: ["5%", "15%", "35%"], a: 1 },
  { q: "Selon Garibaldi et al. (Science, 2013), les pollinisateurs sauvages vs abeilles domestiques :", opts: ["Pollinisent moins efficacement les cultures", "Contribuent davantage à la fructification des cultures", "Ont le même impact"], a: 1 },
  { q: "L'argument 'on a toujours mangé de la viande' est un exemple de :", opts: ["Raisonnement scientifique valide", "Sophisme naturaliste", "Appel à la tradition (argumentum ad antiquitatem)"], a: 2 },
  { q: "Les végans sportifs peuvent-ils avoir des gains musculaires comparables aux omnivores ?", opts: ["Non, les protéines animales sont irremplaçables", "Oui, si l'apport protéique est adéquat (≥1,6g/kg/jour)", "Seulement pour les sports d'endurance"], a: 1 },
  { q: "Quelle organisation mondiale de diététiciens affirme qu'un régime vegan est adapté à tous les stades de la vie ?", opts: ["L'OMS", "L'Academy of Nutrition and Dietetics (AND)", "La Société française de nutrition"], a: 1 },
];

let quizAnswers = {};

function initQuiz() {
  quizAnswers = {};
  const container = document.getElementById('quizContainer');
  container.innerHTML = '';
  document.getElementById('quizResult').style.display = 'none';
  document.getElementById('diplomeSection').style.display = 'none';
  document.getElementById('quizNav').style.display = 'none';

  QUESTIONS.forEach((q, qi) => {
    const card = document.createElement('div');
    card.className = 'quiz-q';
    card.innerHTML = `
      <div class="quiz-q-num">Question ${qi + 1} / ${QUESTIONS.length}</div>
      <div class="quiz-q-text">${q.q}</div>
      ${q.opts.map((opt, oi) => `
      <label class="quiz-opt">
        <input type="radio" name="q${qi}" value="${oi}" onchange="quizAnswers[${qi}]=${oi}; checkAllAnswered();">
        ${opt}
      </label>`).join('')}`;
    container.appendChild(card);
  });

  document.getElementById('quizNav').style.display = 'block';
  document.getElementById('quizSubmitBtn').disabled = true;
  document.getElementById('quizSubmitBtn').style.opacity = '0.4';
}

function checkAllAnswered() {
  if (Object.keys(quizAnswers).length === QUESTIONS.length) {
    document.getElementById('quizSubmitBtn').disabled = false;
    document.getElementById('quizSubmitBtn').style.opacity = '1';
  }
}

function submitQuiz() {
  let score = 0;
  const wrongs = [];
  QUESTIONS.forEach((q, qi) => {
    if (quizAnswers[qi] === q.a) { score++; }
    else { wrongs.push(qi); }
  });
  const passed = score >= 15;

  document.getElementById('quizContainer').style.display = 'none';
  document.getElementById('quizNav').style.display = 'none';
  const res = document.getElementById('quizResult');
  res.style.display = 'block';

  if (passed) {
    res.innerHTML = `
    <div style="text-align:center; background:var(--green-subtle); border:1px solid rgba(94,201,90,0.25); border-radius:14px; padding:2rem; margin-bottom:1.5rem;">
      <div style="font-size:3rem; margin-bottom:0.5rem;">🎉</div>
      <p style="font-family:'Lora',serif; font-size:1.4rem; font-weight:700; color:var(--green); margin-bottom:0.4rem;">Félicitations !</p>
      <p style="color:var(--text-muted); font-size:0.92rem; margin-bottom:0.4rem;">Vous avez obtenu <strong style="color:var(--green);">${score} / ${QUESTIONS.length}</strong> — vous êtes un expert du véganisme.</p>
      <p style="color:var(--text-muted); font-size:0.82rem;">Entrez votre prénom pour recevoir votre diplôme officiel 👇</p>
    </div>`;
    document.getElementById('diplomeSection').style.display = 'block';
  } else {
    let corrigeHtml = '';
    if (wrongs.length > 0) {
      corrigeHtml = '<div class="quiz-corrige"><div class="quiz-corrige-title">📝 Corrigé</div>';
      wrongs.forEach(qi => {
        const q = QUESTIONS[qi];
        const userAns = quizAnswers[qi];
        const userLabel = q.opts[userAns] || 'Pas de réponse';
        const correctLabel = q.opts[q.a];
        corrigeHtml += `
        <div class="quiz-corrige-item">
          <div class="quiz-corrige-q">${q.q}</div>
          <div><span class="quiz-corrige-answer wrong">✗ ${userLabel}</span><span class="quiz-corrige-answer correct">✓ ${correctLabel}</span></div>
        </div>`;
      });
      corrigeHtml += '</div>';
    }

    res.innerHTML = `
    <div style="text-align:center; background:var(--red-dim); border:1px solid rgba(238,85,85,0.25); border-radius:14px; padding:2rem;">
      <div style="font-size:3rem; margin-bottom:0.5rem;">📚</div>
      <p style="font-family:'Lora',serif; font-size:1.4rem; font-weight:700; color:var(--red); margin-bottom:0.4rem;">Pas encore expert…</p>
      <p style="color:var(--text-muted); font-size:0.92rem; margin-bottom:0.85rem;">Vous avez obtenu <strong style="color:var(--red);">${score} / ${QUESTIONS.length}</strong> — il vous faut 15/20 pour le diplôme.</p>
      <p style="color:var(--text-muted); font-size:0.82rem; margin-bottom:1.25rem;">Continuez à explorer les fiches du site pour progresser !</p>
      <button onclick="document.getElementById('quizContainer').style.display='flex'; initQuiz();" style="padding:0.7rem 1.75rem; background:var(--amber); color:#080e08; border:none; border-radius:8px; font-size:0.9rem; font-weight:700; font-family:'DM Sans',sans-serif; cursor:pointer;">🔄 Recommencer</button>
    </div>
    ${corrigeHtml}`;
  }
}

// ── DIPLOME CANVAS ────────────────────────────
function generateDiplome() {
  const prenom = document.getElementById('diplomePrenom').value.trim();
  if (!prenom) { alert('Entrez votre prénom !'); return; }

  const canvas = document.getElementById('diplomeCanvas');
  const ctx = canvas.getContext('2d');
  const W = 900, H = 636;
  canvas.width = W; canvas.height = H;

  ctx.fillStyle = '#fdf8ed';
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 8;
  ctx.strokeRect(14, 14, W - 28, H - 28);
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, W - 48, H - 48);

  [[30, 30], [W - 30, 30], [30, H - 30], [W - 30, H - 30]].forEach(([cx, cy]) => {
    ctx.fillStyle = '#c9a227';
    ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fill();
  });

  ctx.font = 'bold 26px serif'; ctx.fillStyle = '#2d5a1b'; ctx.textAlign = 'center';
  ctx.fillText('🌿 INSTITUT NATIONAL DU HOUMOUS 🌿', W / 2, 78);
  ctx.font = '13px serif'; ctx.fillStyle = '#7a6230';
  ctx.fillText('Fondé en 2024 · Siège social : quelque part entre un champ de pois chiches et une bibliothèque', W / 2, 102);

  ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(60, 118); ctx.lineTo(W - 60, 118); ctx.stroke();

  ctx.font = 'italic bold 50px Georgia, serif'; ctx.fillStyle = '#1a3a0e';
  ctx.fillText("Diplôme d'Expert en Véganisme", W / 2, 182);
  ctx.font = '17px Georgia, serif'; ctx.fillStyle = '#5a4a1a';
  ctx.fillText('Ce document atteste solennellement que', W / 2, 226);

  ctx.font = 'bold italic 56px Georgia, serif'; ctx.fillStyle = '#2d5a1b';
  ctx.fillText(prenom, W / 2, 296);
  const pw = ctx.measureText(prenom).width;
  ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(W / 2 - pw / 2, 308); ctx.lineTo(W / 2 + pw / 2, 308); ctx.stroke();

  ctx.font = '16px Georgia, serif'; ctx.fillStyle = '#3a2a0a';
  ctx.fillText('a démontré une connaissance approfondie du véganisme,', W / 2, 344);
  ctx.fillText('de ses fondements scientifiques, éthiques et environnementaux.', W / 2, 368);
  ctx.font = '12px sans-serif'; ctx.fillStyle = '#7a6230';
  ctx.fillText("★ Aucun animal n'a été blessé lors de la délivrance de ce diplôme ★", W / 2, 394);

  ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(60, 412); ctx.lineTo(W - 60, 412); ctx.stroke();

  const dateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  ctx.font = '13px Georgia, serif'; ctx.fillStyle = '#7a6230'; ctx.textAlign = 'left';
  ctx.fillText(`Délivré le ${dateStr}`, 80, 444);

  ctx.textAlign = 'right';
  ctx.font = 'italic bold 19px Georgia, serif'; ctx.fillStyle = '#1a3a0e';
  ctx.fillText('Bastien le Vegan King', W - 80, 449);
  ctx.font = '11px Georgia, serif'; ctx.fillStyle = '#7a6230';
  ctx.fillText("Directeur Suprême de l'Institut National du Houmous", W - 80, 465);
  ctx.fillText('& Ambassadeur Extraordinaire du Pois Chiche', W - 80, 480);

  ctx.strokeStyle = '#1a3a0e'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W - 260, 442);
  ctx.bezierCurveTo(W - 230, 430, W - 200, 455, W - 170, 440);
  ctx.bezierCurveTo(W - 140, 425, W - 120, 450, W - 100, 440);
  ctx.stroke();

  ctx.beginPath(); ctx.arc(W / 2, 526, 50, 0, Math.PI * 2);
  ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 3; ctx.stroke();
  ctx.font = 'bold 26px serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#2d5a1b';
  ctx.fillText('🌱', W / 2, 536);
  ctx.font = '10px sans-serif'; ctx.fillStyle = '#7a6230';
  ctx.fillText('CERTIFIÉ EXPERT', W / 2, 554);
  ctx.fillText('VEGAN KING APPROVED', W / 2, 566);

  // Show as image
  const img = document.getElementById('diplomeImg');
  img.src = canvas.toDataURL('image/png');
  img.style.display = 'block';
  document.getElementById('diplomeHint').style.display = 'block';
}

// ── INIT ──────────────────────────────────────
applyFilter('nutrition');
