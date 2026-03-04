// ═══ THEME PERSISTENCE ═══
(function(){
  try {
    var t = localStorage.getItem('pk-theme');
    if (t === 'light') {
      document.documentElement.setAttribute('data-theme','light');
      document.body && document.body.classList.add('light');
    }
  } catch(e) {}
})();

// ═══ SHOPIFY PROD SYNC ═══
document.addEventListener('DOMContentLoaded', function() {
  if (window.PEAKASY) {
    if (typeof PROD !== 'undefined') {
      PROD.id = window.PEAKASY.productId;
      PROD.price = window.PEAKASY.price / 100;
      PROD.name = window.PEAKASY.title;
    }
  }
  // Restore theme on load
  try {
    if (localStorage.getItem('pk-theme') === 'light') {
      document.body.classList.add('light');
      document.documentElement.setAttribute('data-theme','light');
      var btn = document.getElementById('thb') || document.getElementById('thb') || document.getElementById('thbtn');
      if (btn) btn.textContent = '🌙';
      if (typeof isLight !== 'undefined') isLight = true;
    }
  } catch(e) {}
  if (typeof renderCans === 'function') renderCans();
  if (typeof updateOs === 'function') updateOs();

  // Init cart badge from Shopify
  if (window.PEAKASY && window.PEAKASY.cartCount > 0) {
    var cb = document.getElementById('cb');
    if (cb) { cb.textContent = window.PEAKASY.cartCount; cb.className = 'bdg on'; }
  }
  // Always refresh badge on load from live cart
  pkRefreshCartBadge();

  // ── Intercept Shopify product form → Ajax (no redirect) ──
  var pkForm = document.getElementById('pk-atc-form');
  if (pkForm) {
    pkForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var variantId = parseInt((document.getElementById('pk-variant-id') || {}).value || '0');
      var qty       = parseInt((document.getElementById('pk-qty') || {}).value || '1') || (osQty || 1);
      var btn       = document.getElementById('pk-atc-btn');
      var btnTxt    = document.getElementById('os-cta-t');
      pkAddToCart(variantId, qty, btn, btnTxt);
    });
  }
});



// ═══ ASSETS ═══
const P1 = (window.PEAKASY && window.PEAKASY.productImg) || "";
const P2 = "D";

// ═══ STATE ═══
const PROD = {id:1, name:"Mushroom Fuse Instant Coffee", price:34.90, img:P1, sub:"Medium Roast · 1.9oz · 30 Servings"};
let cart = [], wishlist = [], osQty = 1;

// ═══ CURSOR ═══
const cur = document.getElementById('cur');
const curR = document.getElementById('cur-r');
let mx=0, my=0, rx=0, ry=0;
document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; cur.style.left=mx+'px'; cur.style.top=my+'px'; });
(function tick(){ rx+=(mx-rx)*.1; ry+=(my-ry)*.1; curR.style.left=rx+'px'; curR.style.top=ry+'px'; requestAnimationFrame(tick); })();
document.addEventListener('mousedown', () => { cur.style.width='5px'; cur.style.height='5px'; });
document.addEventListener('mouseup', () => { cur.style.width='7px'; cur.style.height='7px'; });
document.querySelectorAll('button, a, [onclick]').forEach(el => {
  el.addEventListener('mouseenter', () => curR.classList.add('h'));
  el.addEventListener('mouseleave', () => curR.classList.remove('h'));
});

// ═══ THEME ═══
var isLight = false;
function toggleTheme() {
  isLight = !isLight;
  document.body.classList.toggle('light', isLight);
  document.documentElement.setAttribute('data-theme', isLight ? 'light' : 'dark');
  var btn = document.getElementById('thb') || document.getElementById('thbtn');
  if (btn) btn.textContent = isLight ? '🌙' : '☀️';
  try { localStorage.setItem('pk-theme', isLight ? 'light' : 'dark'); } catch(e) {}
}
// Greeting by time of day (dark mode always default)
(function(){
  var h = new Date().getHours();
  var greet = h >= 6 && h < 11 ? '🌅 Good morning — your ritual awaits.' :
              h >= 11 && h < 17 ? '⚡ Peak hours ahead — fuel your focus.' :
              h >= 17 && h < 21 ? '🌙 Evening ritual — calm energy.' :
              '🌙 Still up? Tomorrow starts with Peakasy.';
  var el = document.getElementById('h-eye');
  if (el) el.textContent = greet;
})();
// ═══ NAV ═══
function go(page) {
  var map = {home:'/',about:'/pages/about',cart:'/cart',
    shipping:'/pages/shipping',refund:'/pages/refund-policy',
    terms:'/policies/terms-of-service',privacy:'/policies/privacy-policy'};
  if (page === 'order') { goOrder(); return; }
  if (map[page]) window.location.href = map[page];
}
function goOrder() {
  var el = document.getElementById('order-sec');
  if (el) { el.scrollIntoView({behavior:'smooth'}); return; }
  window.location.href = '/#order-sec';
}
function toggleNav() {
  document.getElementById('nmob').classList.toggle('open');
}
window.addEventListener('scroll', function() {
  document.getElementById('mnav').style.borderBottomColor = window.scrollY > 40 ? 'var(--bor)' : 'transparent';
}, {passive: true});

// ═══ ORDER SECTION ═══
var REVS = [
  {name:"Sarah K.", s:"★★★★★", t:'"Game changer for my mornings!"'},
  {name:"Marcus T.", s:"★★★★★", t:'"Tastes like real coffee, not earthy."'},
  {name:"Elena M.", s:"★★★★★", t:'"Creative clarity is unreal."'},
  {name:"James R.", s:"★★★★★", t:'"No more afternoon crash!"'},
  {name:"Priya S.", s:"★★★★★", t:'"Best thing I gave myself."'},
  {name:"Luca B.", s:"★★★★★", t:'"Smooth, rich and functional."'},
];
var MINI = [
  "Sharpest I've felt in years. — Alex P.",
  "Replaced my regular coffee. — Sam K.",
  "Calm energy all day. — Dana R.",
];

function renderCans() {
  var stage = document.getElementById('cans-stage');
  if (!stage) return;
  stage.innerHTML = '';

  // Use transparent product image (uploaded asset), fallback to P1
  var canImg = (window.PEAKASY && window.PEAKASY.productTransparent) || P1;

  // Layout: 1 tin = center only
  //         2 tins = back-left + front-center
  //         3 tins = back-left + front-center + back-right
  var layouts = {
    1: [{z:2, x:0,   y:0,   scale:1,    opacity:1}],
    2: [{z:1, x:-55, y:-18, scale:0.82, opacity:0.88},
        {z:2, x:18,  y:0,   scale:1,    opacity:1}],
    3: [{z:1, x:-62, y:-20, scale:0.80, opacity:0.85},
        {z:3, x:0,   y:0,   scale:1,    opacity:1},
        {z:1, x:62,  y:-20, scale:0.80, opacity:0.85}]
  };
  var n = Math.min(osQty, 3);
  var positions = layouts[n] || layouts[1];

  positions.forEach(function(pos, i) {
    var d = document.createElement('div');
    d.className = 'ocan';
    d.style.cssText = [
      'position:absolute',
      'bottom:0',
      'left:50%',
      'transform:translateX(calc(-50% + ' + pos.x + 'px)) translateY(' + pos.y + 'px) scale(' + pos.scale + ')',
      'transform-origin:bottom center',
      'z-index:' + pos.z,
      'opacity:' + pos.opacity,
      'transition:all .4s cubic-bezier(.34,1.56,.64,1)',
      'animation:canPop .5s cubic-bezier(.34,1.56,.64,1) ' + (i * 0.08) + 's both'
    ].join(';');
    d.innerHTML = '<img src="' + canImg + '" alt="Peakasy" style="height:180px;width:auto;display:block;filter:drop-shadow(0 16px 32px rgba(0,0,0,.5));">';
    stage.appendChild(d);
  });

  var lbl = document.getElementById('cans-lbl');
  if (lbl) lbl.textContent = osQty + ' × Mushroom Fuse Coffee';
  var mr = document.getElementById('mini-revs');
  if (mr) {
    var show = osQty <= 1 ? 1 : osQty <= 2 ? 2 : 3;
    mr.innerHTML = MINI.slice(0, show).map(function(r, i) {
      return '<div class="omr" style="animation-delay:' + (i * 0.1) + 's"><span class="omr-s">★★★★★</span><span class="omr-t">' + r + '</span></div>';
    }).join('');
  }
}

function renderOsBar() {
  var el = document.getElementById('os-revs');
  if (!el) return;
  el.innerHTML = REVS.map(function(r) {
    return '<div class="orc"><div class="orc-t"><span class="orc-n">' + r.name + '</span><span class="orc-s">' + r.s + '</span></div><div class="orc-tx">' + r.t + '</div></div>';
  }).join('');
}

function updateOs() {
  var isSubscribe = window._pkPurchaseType === 'subscribe';
  var basePrice = (window.PEAKASY && window.PEAKASY.price) ? window.PEAKASY.price / 100 : PROD.price;
  var unitPrice = isSubscribe ? basePrice * 0.90 : basePrice;
  var total = osQty * unitPrice;
  var ship = total >= 40 ? 0 : 4.99;
  var se = document.getElementById('os-sub'); if (se) se.textContent = '$' + total.toFixed(2);
  var she = document.getElementById('os-ship');
  if (she) { she.textContent = ship === 0 ? 'Free' : '$' + ship.toFixed(2); she.style.color = ship === 0 ? '#5a9a5a' : 'var(--text)'; }
  var te = document.getElementById('os-tot'); if (te) te.textContent = '$' + (total + ship).toFixed(2);
  var ce = document.getElementById('os-cta-t');
  if (ce) {
    var qLabel = osQty + ' Tin' + (osQty > 1 ? 's' : '');
    ce.textContent = isSubscribe
      ? 'Subscribe \u00b7 ' + qLabel + ' \u00b7 $' + total.toFixed(2) + '/mo'
      : 'Add ' + qLabel + ' to Cart';
  }
}

function osPick(el, q) {
  document.querySelectorAll('.osp').forEach(function(p) { p.classList.remove('sel'); p.querySelector('.osp-chk').textContent = ''; });
  el.classList.add('sel');
  el.querySelector('.osp-chk').textContent = '✓';
  osQty = q;
  // Sync Shopify form quantity input
  var qtyInput = document.getElementById('pk-qty');
  if (qtyInput) qtyInput.value = q;
  renderCans();
  updateOs();
}

/* ═══════════════════════════════
   CORE CART FUNCTION — used by all Add to Cart buttons
═══════════════════════════════ */
function pkAddToCart(variantId, qty, btn, btnTxt) {
  if (!variantId) {
    toast('Настройте продукт в Theme Settings', '⚙️');
    return;
  }
  if (btn) { btn.disabled = true; btn.classList.add('loading'); }
  if (btnTxt) btnTxt.textContent = 'Добавляем...';

  // Build request body
  var body = { id: variantId, quantity: qty };
  
  // Add Recharge subscription properties if subscribe mode is active
  // (fields get their name set by pkSetPurchaseType, empty name = inactive)
  var subFreq = document.getElementById('pk-sub-freq');
  var subUnit = document.getElementById('pk-sub-unit');
  if (subFreq && subFreq.name && subFreq.value) {
    body.properties = {};
    body.properties[subFreq.name.replace('properties[','').replace(']','')] = subFreq.value;
    if (subUnit && subUnit.name && subUnit.value) {
      body.properties[subUnit.name.replace('properties[','').replace(']','')] = subUnit.value;
    }
  }

  fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(body)
  })
  .then(function(r) {
    return r.json().then(function(data) {
      return { ok: r.ok, status: r.status, data: data };
    });
  })
  .then(function(res) {
    var data = res.data;
    if (btn) { btn.disabled = false; btn.classList.remove('loading'); }
    if (!res.ok || data.status >= 400) {
      // Shopify returned an error (422 = out of stock / invalid, 404 = not found)
      toast(data.description || data.message || 'Ошибка — попробуй ещё раз', '⚠️');
      if (btnTxt) btnTxt.textContent = 'Add to Cart';
      return;
    }
    // ✅ Success — show toast
    var isSubscribe = window._pkPurchaseType === 'subscribe';
    toast(isSubscribe ? 'Подписка оформлена! ☕' : 'Добавлено в корзину! ☕', '✓');
    // Update cart badge counter
    pkRefreshCartBadge();
    // Reset button text with confirmation then restore
    if (btnTxt) {
      var qLabel = qty + ' Tin' + (qty > 1 ? 's' : '');
      btnTxt.textContent = '✓ Добавлено!';
      setTimeout(function() {
        if (btnTxt) {
          if (isSubscribe) {
            btnTxt.textContent = 'Subscribe · ' + qLabel;
          } else {
            btnTxt.textContent = 'Add ' + qLabel + ' to Cart';
          }
        }
      }, 2500);
    }
  })
  .catch(function(err) {
    console.error('[Peakasy] Cart error:', err);
    if (btn) { btn.disabled = false; btn.classList.remove('loading'); }
    if (btnTxt) btnTxt.textContent = 'Добавить в корзину';
    toast('Что-то пошло не так. Попробуй ещё раз.', '⚠️');
  });
}

function pkRefreshCartBadge() {
  fetch('/cart.js')
    .then(function(r) { return r.json(); })
    .then(function(c) {
      var cb = document.getElementById('cb');
      if (cb) {
        cb.textContent = c.item_count;
        cb.className = 'bdg' + (c.item_count > 0 ? ' on' : '');
      }
    })
    .catch(function() {});
}

// Legacy wrapper — keeps compatibility with onclick="addToCart()" buttons
function addToCart() {
  // Always prefer DOM value (set by Shopify Liquid from real variant ID)
  var domVariant = parseInt((document.getElementById('pk-variant-id') || {}).value || '0');
  var variantId = domVariant || (window.PEAKASY && window.PEAKASY.variantId) || 0;
  var qty = osQty || 1;
  var btn = document.getElementById('pk-atc-btn') || document.querySelector('.os-cta');
  var btnTxt = document.getElementById('os-cta-t');
  pkAddToCart(variantId, qty, btn, btnTxt);
}

renderCans();
renderOsBar();
updateOs();

// ═══ RITUAL BUILDER ═══
var rStep = 0;
var rAns = {goal: null, time: null, base: null};
var rKeys = ['goal', 'time', 'base'];

var RITUALS = {
  focus_morning_black: {
    tag: 'Deep Focus · Morning',
    title: 'The Clarity Ritual',
    desc: 'Pure and undiluted for maximum cognitive impact on your sharpest morning.',
    recipe: ['Add 1 heaped tsp to your mug', 'Pour 180ml water at 170°F', 'Stir 15 seconds until dissolved', 'Sip slowly — let clarity arrive'],
    bens: ['🧠 Peak NGF stimulation', '⚡ Sharp clean wakefulness', '🎯 Laser focus for deep work']
  },
  focus_morning_oat: {
    tag: 'Creative Flow · Morning',
    title: 'The Creative Latte',
    desc: 'Oat milk softens the bold coffee into a creamy canvas for creative work.',
    recipe: ['Brew 1 tsp in 100ml hot water', 'Steam 80ml oat milk separately', 'Combine and stir gently', 'Add a pinch of cinnamon'],
    bens: ['🧠 Cognitive clarity', '🎨 Creative flow state', '🌾 Gut-friendly and dairy-free']
  },
  focus_morning_almond: {
    tag: 'Lean Clarity · Morning',
    title: 'The Light Focus',
    desc: 'Almond milk pairs with mushroom earthiness for clean morning clarity.',
    recipe: ['Dissolve 1 tsp in 120ml hot water', 'Add 80ml warmed almond milk', 'Stir well and enjoy warm', 'Best without sweetener for focus'],
    bens: ['🧠 Sustained mental clarity', '🥛 Low-calorie fuel', '⚡ Jitter-free energy']
  },
  energy_midday_black: {
    tag: 'Peak Energy · Mid-Day',
    title: 'The Power Shot',
    desc: 'A concentrated mid-day hit for unstoppable momentum and stamina.',
    recipe: ['Use 1.5 tsp for extra strength', 'Dissolve in only 100ml hot water', 'Drink in 2-3 sips for fast absorption', 'Best between 11am and 2pm'],
    bens: ['⚡ Rapid energy uplift', '🏃 Physical stamina boost', '🔥 Zero crash guarantee']
  },
  energy_midday_oat: {
    tag: 'Sustained Energy · Mid-Day',
    title: 'The Afternoon Warrior',
    desc: 'Oat milk slows caffeine release for a longer, steadier energy arc.',
    recipe: ['Dissolve 1 tsp in 80ml hot water', 'Add 100ml cold oat milk over ice', 'Optional: one medjool date', 'Best served as an iced latte'],
    bens: ['⚡ 4-6hr energy sustain', '🌾 Balanced blood sugar', '💪 Physical and mental endurance']
  },
  energy_midday_almond: {
    tag: 'Clean Energy · Mid-Day',
    title: 'The Lean Machine',
    desc: 'The lightest, cleanest fuel for sustained afternoon performance.',
    recipe: ['1 tsp in 120ml water', 'Top with 60ml almond milk', 'Enjoy warm or over ice', 'Avoid after 3pm for sleep quality'],
    bens: ['⚡ Clean light energy', '🥛 Low calorie, high impact', '🎯 Afternoon endurance']
  },
  calm_evening_black: {
    tag: 'Deep Calm · Evening',
    title: 'The Grounding Ritual',
    desc: 'Even black, this blend becomes a meditative wind-down in a cup.',
    recipe: ['Use only 0.5 tsp for evening use', 'Brew in 200ml water at 160°F', 'Add a drop of vanilla', 'Hold the mug and breathe'],
    bens: ['🌿 Natural cortisol reduction', '😌 Calm without drowsiness', '🌙 Prepares mind for rest']
  },
  calm_evening_oat: {
    tag: 'Evening Calm · Wind-Down',
    title: 'The Moon Latte',
    desc: 'A warm dreamy oat latte that signals to your nervous system: time to rest.',
    recipe: ['Half tsp dissolved in 80ml warm water', 'Heat 120ml oat milk until steaming', 'Combine, add cardamom', 'Drink 1hr before wind-down'],
    bens: ['🌙 Gentle nervous system calm', '🌾 Warm comforting ritual', '😴 Supports sleep onset']
  },
  calm_evening_almond: {
    tag: 'Soft Calm · Evening',
    title: 'The Gentle Dusk',
    desc: 'Light, nutty and soothing — honouring the end of your day.',
    recipe: ['0.5 tsp dissolved in 100ml warm water', 'Top with warm almond milk', 'Add honey if desired', 'Best enjoyed in silence'],
    bens: ['🌿 Adaptogens for balance', '🥛 Light and non-bloating', '✨ Perfect end-of-day ritual']
  }
};

function rPick(el) {
  var s = parseInt(el.getAttribute('data-s'));
  var v = el.getAttribute('data-v');
  document.querySelectorAll('.ropt[data-s="' + s + '"]').forEach(function(o) { o.classList.remove('pick'); });
  el.classList.add('pick');
  rAns[rKeys[s]] = v;
  var nb = document.getElementById('rn' + s);
  if (nb) nb.disabled = false;
}

function rNext() {
  if (!rAns[rKeys[rStep]]) return;
  document.getElementById('rpan' + rStep).classList.remove('on');
  document.getElementById('rtab' + rStep).classList.remove('on');
  document.getElementById('rtab' + rStep).classList.add('done');
  rStep++;
  document.getElementById('rpan' + rStep).classList.add('on');
  document.getElementById('rtab' + rStep).classList.add('on');
}

function rBack() {
  document.getElementById('rpan' + rStep).classList.remove('on');
  document.getElementById('rtab' + rStep).classList.remove('on');
  rStep--;
  document.getElementById('rpan' + rStep).classList.add('on');
  document.getElementById('rtab' + rStep).classList.remove('done');
  document.getElementById('rtab' + rStep).classList.add('on');
}

function rBuild() {
  if (!rAns.goal || !rAns.time || !rAns.base) return;
  var key = rAns.goal + '_' + rAns.time + '_' + rAns.base;
  var ritual = RITUALS[key] || RITUALS['focus_morning_black'];
  document.querySelectorAll('.rpan').forEach(function(p) { p.classList.remove('on'); });
  document.querySelectorAll('.rtab').forEach(function(t) { t.classList.remove('on'); t.classList.add('done'); });
  document.getElementById('rr-tag').textContent = ritual.tag;
  document.getElementById('rr-title').textContent = ritual.title;
  document.getElementById('rr-desc').textContent = ritual.desc;
  document.getElementById('rr-steps').innerHTML = ritual.recipe.map(function(s, i) {
    return '<div class="rr-step"><span class="rr-sn">' + (i+1) + '.</span><span>' + s + '</span></div>';
  }).join('');
  document.getElementById('rr-bens').innerHTML = ritual.bens.map(function(b) {
    return '<div class="rr-ben"><span>' + b.slice(0,2) + '</span>' + b.slice(2) + '</div>';
  }).join('');
  var imgEl = document.getElementById('rr-img');
  if (imgEl) imgEl.src = P1;
  var res = document.getElementById('rit-res');
  res.classList.add('on');
  res.scrollIntoView({behavior:'smooth', block:'center'});
}

function rReset() {
  rStep = 0;
  rAns = {goal: null, time: null, base: null};
  document.querySelectorAll('.ropt').forEach(function(o) { o.classList.remove('pick'); });
  document.querySelectorAll('[id^="rn"]').forEach(function(b) { b.disabled = true; });
  document.getElementById('rit-res').classList.remove('on');
  document.querySelectorAll('.rtab').forEach(function(t, i) {
    t.classList.remove('on', 'done');
    if (i === 0) t.classList.add('on');
  });
  document.querySelectorAll('.rpan').forEach(function(p, i) {
    p.classList.remove('on');
    if (i === 0) p.classList.add('on');
  });
}

// ═══ PARALLAX SCROLL ═══
(function(){
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) { if (e.isIntersecting) e.target.classList.add('vis'); });
  }, {threshold: 0.18, rootMargin: '0px 0px -50px 0px'});
  document.querySelectorAll('.pic').forEach(function(c) { obs.observe(c); });
})();

// ═══ CART ═══
function cartQty(id, d) {
  var item = cart.find(function(c) { return c.id === id; });
  if (!item) return;
  item.qty = Math.max(1, item.qty + d);
  renderCart(); updateBadges();
}
function cartRm(id) {
  cart = cart.filter(function(c) { return c.id !== id; });
  renderCart(); updateBadges();
}
function applyPromo() { toast('Promo applied!', '🎉'); }
function doCheckout() { toast('Redirecting to checkout...', '🔒'); }
function renderCart() {
  var el = document.getElementById('cart-content');
  if (!el) return;
  if (!cart.length) {
    el.innerHTML = '<div class="cempty"><div class="ce-ico">&#x1F6D2;</div><div class="ce-t">Your cart is empty</div><p class="ce-s">Discover our Mushroom Fuse Coffee.</p><button class="btn-g" onclick="goOrder()">Shop Now &#x2192;</button></div>';
    return;
  }
  var sub = cart.reduce(function(s,c){return s+c.price*c.qty;},0);
  var ship = sub >= 40 ? 0 : 4.99;
  var rows = '';
  cart.forEach(function(item){
    rows += '<div class="ci">';
    rows += '<div class="ci-img"><img src="' + item.img + '" alt=""></div>';
    rows += '<div class="ci-inf">';
    rows += '<div class="ci-nm">' + item.name + '</div>';
    rows += '<div class="ci-sub">' + item.sub + '</div>';
    rows += '<div class="ci-qty">';
    rows += '<button class="cqb" onclick="cartQty(' + item.id + ',-1)">&#x2212;</button>';
    rows += '<span class="cqn">' + item.qty + '</span>';
    rows += '<button class="cqb" onclick="cartQty(' + item.id + ',1)">+</button>';
    rows += '</div></div>';
    rows += '<div class="ci-r">';
    rows += '<div class="ci-pr">$' + (item.price*item.qty).toFixed(2) + '</div>';
    rows += '<button class="ci-rm" onclick="cartRm(' + item.id + ')">Remove</button>';
    rows += '</div></div>';
  });
  var shCol = ship===0 ? '#5a9a5a' : 'var(--text)';
  var shTxt = ship===0 ? 'Free' : '$'+ship.toFixed(2);
  var html = '<div class="cart-lay"><div>' + rows + '</div>';
  html += '<div class="cs">';
  html += '<div class="cs-t">Order Summary</div>';
  html += '<div class="cs-row"><span>Subtotal</span><span>$' + sub.toFixed(2) + '</span></div>';
  html += '<div class="cs-row"><span>Shipping</span><span style="color:' + shCol + '">' + shTxt + '</span></div>';
  html += '<div style="margin:11px 0">';
  html += '<div style="font-size:.65rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:7px">Promo Code</div>';
  html += '<div class="promo-r"><input class="promo-in" id="pc-in" placeholder="PEAKASY10"><button class="promo-btn" onclick="applyPromo()">Apply</button></div>';
  html += '</div>';
  html += '<div class="cs-row cs-tot"><span>Total</span><span class="cs-totv">$' + (sub+ship).toFixed(2) + '</span></div>';
  html += '<button class="co-btn" onclick="doCheckout()">Proceed to Checkout &#x2192;</button>';
  html += '<button class="btn-o" style="width:100%;margin-top:8px;border-radius:12px;padding:11px;" onclick="goOrder()">Continue Shopping</button>';
  html += '</div></div>';
  el.innerHTML = html;
}
// ═══ WISHLIST ═══
function renderWishlist() {
  var el = document.getElementById('wl-content');
  if (!el) return;
  if (!wishlist.length) {
    var html = '<div class="wl-empty">';
    html += '<div style="font-size:3rem;opacity:.18;margin-bottom:12px">&#x2661;</div>';
    html += '<div style="font-family:Cormorant Garamond,serif;font-size:1.5rem;font-weight:700;color:var(--text);margin-bottom:8px">Your wishlist is empty</div>';
    html += '<p style="color:var(--text2);font-size:.84rem;margin-bottom:20px">Save your favourites.</p>';
    html += '<button class="btn-g" onclick="goOrder()">Explore &#x2192;</button>';
    html += '</div>';
    el.innerHTML = html;
    return;
  }
  var cards = '';
  wishlist.forEach(function(p){
    cards += '<div class="wlc" onclick="goOrder()">';
    cards += '<div class="wlc-img"><img src="' + p.img + '" alt=""></div>';
    cards += '<div class="wlc-b">';
    cards += '<div class="wlc-n">' + p.name + '</div>';
    cards += '<div class="wlc-sub">' + p.sub + '</div>';
    cards += '<div class="wlc-ft">';
    cards += '<span class="wlc-p">$' + p.price.toFixed(2) + '</span>';
    cards += '<button class="btn-g" style="padding:5px 14px;font-size:.71rem" onclick="event.stopPropagation();goOrder()">Buy</button>';
    cards += '</div></div></div>';
  });
  el.innerHTML = '<div class="wl-grid">' + cards + '</div>';
}
// ═══ BADGES ═══
function updateBadges() {
  fetch('/cart.js').then(function(r){return r.json();}).then(function(c){
    var cb=document.getElementById('cb'); if(cb){cb.textContent=c.item_count;cb.className='bdg'+(c.item_count?' on':'');}
  }).catch(function(){});
}

// ═══ FAQ ═══
function faq(el) {
  var fi = el.parentElement;
  var was = fi.classList.contains('op');
  document.querySelectorAll('.fi').forEach(function(f){f.classList.remove('op');});
  if (!was) fi.classList.add('op');
}

// ═══ TOAST ═══
var _tt;
function toast(msg, icon) {
  var t = document.getElementById('toast');
  document.getElementById('t-ico').textContent = icon || '';
  document.getElementById('t-msg').textContent = msg;
  t.classList.add('on');
  clearTimeout(_tt);
  _tt = setTimeout(function(){ t.classList.remove('on'); }, 2800);
}

// ═══ SOCIAL TICKER ═══
(function(){
  var ticker = document.getElementById('ticker');
  var names = ['Emma','Liam','Sofia','James','Aria','Noah','Isabella','Oliver','Mia','Lucas'];
  var cities = ['London','New York','Lisbon','Berlin','Paris','Sydney','Toronto','Amsterdam'];
  var actions = [
    {t:'just ordered', d:'<b>2 Tins</b>', e:'☕'},
    {t:'is loving their', d:'<b>Mushroom Fuse</b>', e:'🍄'},
    {t:'just re-ordered', d:'<b>3 Tins</b>', e:'⭐'},
    {t:'left a 5-star review', d:'', e:'✨'},
  ];
  var avs = ['👩','👨','🧑','👩‍💼','👨‍💼','👩‍🦱'];
  var mins = ['just now','1 min ago','2 min ago','3 min ago','5 min ago'];

  function show() {
    var n = names[Math.floor(Math.random()*names.length)];
    var c = cities[Math.floor(Math.random()*cities.length)];
    var a = actions[Math.floor(Math.random()*actions.length)];
    var av = avs[Math.floor(Math.random()*avs.length)];
    var m = mins[Math.floor(Math.random()*mins.length)];
    var card = document.createElement('div');
    card.className = 'tk-card';
    card.innerHTML = '<div class="tk-av">' + av + '</div><div><div class="tk-name">' + n + ' from ' + c + '</div><div class="tk-act">' + a.t + ' ' + a.d + ' ' + a.e + '</div><div class="tk-t">' + m + '</div></div>';
    ticker.innerHTML = '';
    ticker.appendChild(card);
    setTimeout(function(){
      card.classList.add('out');
      setTimeout(function(){ if(ticker.contains(card)) ticker.removeChild(card); }, 400);
    }, 4500);
  }
  setTimeout(show, 3000);
  setInterval(show, 7500);
})();

// ═══ MAGNETIC TILT GALLERY ═══
(function(){
  var gcur = document.getElementById('gcur');
  var cards = document.querySelectorAll('.gc');
  cards.forEach(function(card){
    var bg  = card.querySelector('.gc-bg');
    var mid = card.querySelector('.gc-mid');
    var fg  = card.querySelector('.gc-fg');
    var sh  = card.querySelector('.gc-shine');
    card.addEventListener('mouseenter', function(){
      if(gcur) gcur.classList.add('on');
    });
    card.addEventListener('mouseleave', function(){
      if(gcur) gcur.classList.remove('on');
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
      if(bg)  bg.style.transform  = 'translate(0,0)';
      if(mid) mid.style.transform = 'translateZ(0) translate(0,0)';
      if(fg)  fg.style.transform  = 'translateZ(0) translate(0,0)';
    });
    card.addEventListener('mousemove', function(e){
      var r  = card.getBoundingClientRect();
      var x  = (e.clientX - r.left) / r.width;
      var y  = (e.clientY - r.top)  / r.height;
      var cx = x - 0.5;
      var cy = y - 0.5;
      card.style.transform = 'perspective(900px) rotateX('+(-cy*14)+'deg) rotateY('+(cx*18)+'deg) scale3d(1.03,1.03,1.03)';
      if(bg)  bg.style.transform  = 'translate('+(cx*-16)+'px,'+(cy*-16)+'px)';
      if(mid) mid.style.transform = 'translateZ(28px) translate('+(cx*11)+'px,'+(cy*11)+'px)';
      if(fg)  fg.style.transform  = 'translateZ(52px) translate('+(cx*22)+'px,'+(cy*22)+'px)';
      if(sh){ sh.style.setProperty('--mx',(x*100)+'%'); sh.style.setProperty('--my',(y*100)+'%'); }
      if(gcur){ gcur.style.left = e.clientX+'px'; gcur.style.top = e.clientY+'px'; }
    });
  });
})();


// ═══ WATERFALL REVIEWS ═══
(function(){
  // Placeholder photo colours — simulate customer photos with canvas data URIs
  function makePhotoUrl(hue, txt) {
    var c = document.createElement('canvas');
    c.width = 400; c.height = 220;
    var ctx = c.getContext('2d');
    // gradient bg
    var g = ctx.createLinearGradient(0,0,400,220);
    g.addColorStop(0, 'hsl('+hue+',28%,16%)');
    g.addColorStop(1, 'hsl('+(hue+30)+',22%,22%)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,400,220);
    // subtle grid pattern
    ctx.strokeStyle = 'rgba(200,169,110,.07)';
    ctx.lineWidth = 1;
    for(var x=0;x<400;x+=40){ ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,220);ctx.stroke(); }
    for(var y=0;y<220;y+=40){ ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(400,y);ctx.stroke(); }
    // product emoji / icon
    ctx.font = '64px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = .55;
    ctx.fillText(txt, 200, 100);
    ctx.globalAlpha = 1;
    // caption
    ctx.fillStyle = 'rgba(200,169,110,.4)';
    ctx.font = '600 11px DM Sans,sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText('CUSTOMER PHOTO', 200, 196);
    return c.toDataURL('image/jpeg', .7);
  }

  // Pre-generate photo urls
  window.PHOTOS = [
    {url: makePhotoUrl(30,  '☕'), lbl:'Morning ritual'},
    {url: makePhotoUrl(120, '🍄'), lbl:'Unboxing'},
    {url: makePhotoUrl(200, '🧠'), lbl:'Work session'},
    {url: makePhotoUrl(45,  '🌿'), lbl:'Ingredient close-up'},
    {url: makePhotoUrl(280, '✦'),  lbl:'Packaging detail'},
    {url: makePhotoUrl(160, '🌅'), lbl:'Morning view'},
    {url: makePhotoUrl(15,  '⚡'), lbl:'Pre-workout'},
    {url: makePhotoUrl(240, '🌙'), lbl:'Evening ritual'},
  ];

  // Global photo opener for review cards
  window.revPhotoOpen = function(el) {
    var lb = document.getElementById('wlb');
    var lbImg = document.getElementById('wlb-img');
    var info = document.getElementById('wlb-info');
    if (!lb || !lbImg) return;
    var src = el.getAttribute('data-src') || '';
    if (!src) {
      var ci = el.querySelector('img');
      src = ci ? (ci.src || ci.getAttribute('src') || '') : '';
    }
    if (!src) return;
    var cap = el.getAttribute('data-cap') || '';
    lbImg.src = src;
    if (info) info.textContent = cap;
    lb.style.cssText = 'display:flex;';
    void lb.offsetWidth;
    lb.classList.add('on');
    document.body.style.overflow = 'hidden';
  }

  var REVS = [
    {nm:'Sarah K.',  loc:'New York, US',  av:'👩', st:'★★★★★', txt:'3 months in and my focus is genuinely sharper. The 3pm crash is completely gone.',    tag:'Focus',   ago:'2d ago',  feat:true,  photo:0},
    {nm:'Marcus T.', loc:'London, UK',    av:'👨', st:'★★★★★', txt:'Tastes like actual premium coffee. My wife started stealing mine so I order double.', tag:'Taste',   ago:'3d ago',  feat:false, photo:1},
    {nm:'Elena M.',  loc:'Berlin, DE',    av:'🧑', st:'★★★★★', txt:'The calm creative clarity is real. As a designer my output has notably improved.',    tag:'Clarity', ago:'5d ago',  feat:true,  photo:2},
    {nm:'James R.',  loc:'Sydney, AU',    av:'👨', st:'★★★★★', txt:'Replaced the 3pm espresso. No crash, way more balanced and alert all afternoon.',     tag:'Energy',  ago:'1w ago',  feat:false, photo:3},
    {nm:'Priya S.',  loc:'Toronto, CA',   av:'👩', st:'★★★★★', txt:'Bought as a gift. Now we both order it every month. Beautiful packaging.',             tag:'Gift',    ago:'1w ago',  feat:false, photo:4},
    {nm:'Luca B.',   loc:'Milan, IT',     av:'🧑', st:'★★★★★', txt:'Tried 6 mushroom coffees. This is the only one where I felt a genuine difference.',    tag:'Quality', ago:'2w ago',  feat:true,  photo:5},
    {nm:'Yuki T.',   loc:'Tokyo, JP',     av:'👩', st:'★★★★★', txt:'Alert without anxiety. Ships fast internationally. Absolutely worth it.',              tag:'Focus',   ago:'2w ago',  feat:false, photo:6},
    {nm:'Omar A.',   loc:'Dubai, UAE',    av:'👨', st:'★★★★★', txt:'6 weeks in, my productivity has genuinely improved. This is not placebo.',             tag:'Ritual',  ago:'3w ago',  feat:false, photo:7},
    {nm:'Chloe D.',  loc:'Paris, FR',     av:'👩', st:'★★★★★', txt:'Better skin, better sleep, calmer all day. Replaced my daily latte completely.',       tag:'Wellness',ago:'3w ago',  feat:true,  photo:0},
    {nm:'Noel P.',   loc:'Lisbon, PT',    av:'🧑', st:'★★★★★', txt:'Stocked up on the 3-tin deal. My mornings have completely transformed.',               tag:'Value',   ago:'1mo ago', feat:false, photo:1},
    {nm:'Aria W.',   loc:'Amsterdam, NL', av:'👩', st:'★★★★★', txt:'No bitterness, no aftertaste. Rich coffee with a subtle earthy depth I love.',         tag:'Taste',   ago:'1mo ago', feat:false, photo:2},
    {nm:'Dev K.',    loc:'Mumbai, IN',    av:'👨', st:'★★★★★', txt:'Lion Mane is the real deal. Noticed cognitive shift within the first two weeks.',       tag:'Science', ago:'1mo ago', feat:true,  photo:3},
    {nm:'Anna L.',   loc:'Stockholm, SE', av:'👩', st:'★★★★★', txt:'Ordered for my startup team. The entire office has switched from regular coffee.',     tag:'Team',    ago:'5d ago',  feat:false, photo:4},
    {nm:'Kai M.',    loc:'Seoul, KR',     av:'🧑', st:'★★★★★', txt:'The ritual aspect is what sold me. This is genuinely premium in every way.',           tag:'Ritual',  ago:'4d ago',  feat:false, photo:5},
    {nm:'Fatima H.', loc:'Casablanca, MA',av:'👩', st:'★★★★★', txt:'Smooth taste and I feel the difference daily. Already on my third order.',             tag:'Focus',   ago:'6d ago',  feat:false, photo:6},
  ];

  var cols = [
    document.getElementById('wcol0'),
    document.getElementById('wcol1'),
    document.getElementById('wcol2'),
  ];
  if (!cols[0]) return;

  var wfPaused = false;
  var wfTimers = [];
  var wfIdx = 0;

  function shuffle(a){ var b=a.slice(); for(var i=b.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=b[i];b[i]=b[j];b[j]=t;} return b; }
  var pool = shuffle(REVS);

  // Lightbox
  window.wlbOpen = function(src, caption) {
    var lb = document.getElementById('wlb');
    var img = document.getElementById('wlb-img');
    var info = document.getElementById('wlb-info');
    if (!lb || !img) return;
    img.src = src;
    if (info) info.textContent = caption || '';
    lb.style.display = 'flex';
    lb.classList.add('on');
    document.body.style.overflow = 'hidden';
  };
  window.wlbClose = function() {
    var lb = document.getElementById('wlb');
    if (!lb) return;
    lb.classList.remove('on');
    lb.style.cssText = 'display:none;';
    document.body.style.overflow = '';
  }
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') wlbClose(); });

  function makeCard(r, delay) {
    var p = PHOTOS[r.photo % PHOTOS.length];
    var d = document.createElement('div');
    d.className = 'wrc' + (r.feat ? ' feat' : '');
    d.style.animationDelay = (delay||0) + 'ms';

    var pi = r.photo % PHOTOS.length;
    var photoHtml = '<div class="wrc-photo" data-pi="'+pi+'" data-src="'+p.url+'" data-cap="'+r.nm+' from '+r.loc+'" onclick="event.stopPropagation();revPhotoOpen(this)"><img src="'+p.url+'" alt="'+r.nm+'"><div class="wrc-photo-lbl">'+p.lbl+'</div></div>';

    d.innerHTML = photoHtml +
      '<div class="wrc-body">' +
        '<div class="wrc-top">' +
          '<div class="wrc-av">'+r.av+'</div>' +
          '<div><div class="wrc-nm">'+r.nm+'</div><div class="wrc-loc">'+r.loc+'</div></div>' +
          '<div class="wrc-st">'+r.st+'</div>' +
        '</div>' +
        '<div class="wrc-vrf">&#x2713; Verified Purchase</div>' +
        '<div class="wrc-txt">"'+r.txt+'"</div>' +
        '<div class="wrc-ft"><span class="wrc-tag">'+r.tag+'</span><span class="wrc-ago">'+r.ago+'</span></div>' +
      '</div>';
    return d;
  }

  function addToCol(ci) {
    if (wfPaused) return;
    var col = cols[ci];
    var r = pool[wfIdx % pool.length];
    wfIdx++;
    var card = makeCard(r, 0);
    col.insertBefore(card, col.firstChild);
    // Remove excess cards
    setTimeout(function(){
      var all = col.querySelectorAll('.wrc');
      if (all.length > 4) {
        var old = all[all.length-1];
        old.style.transition = 'opacity .38s ease, transform .38s ease, max-height .45s ease';
        old.style.opacity = '0';
        old.style.maxHeight = old.offsetHeight + 'px';
        requestAnimationFrame(function(){ old.style.maxHeight = '0'; old.style.marginBottom = '0'; });
        setTimeout(function(){ if(col.contains(old)) col.removeChild(old); }, 460);
      }
    }, 600);
  }

  // Initial fill — staggered drops
  var initPool = shuffle(REVS);
  var ii = 0;
  [2, 2, 2].forEach(function(count, ci) {
    for (var k = 0; k < count; k++) {
      (function(r, delay){
        setTimeout(function(){
          var card = makeCard(r, 0);
          cols[ci].appendChild(card);
        }, delay);
      })(initPool[ii++ % initPool.length], k * 220 + ci * 110);
    }
  });

  // Rolling intervals — different speeds per column
  function startWf() {
    wfTimers.push(setInterval(function(){ addToCol(0); }, 4200));
    wfTimers.push(setInterval(function(){ addToCol(1); }, 5800));
    wfTimers.push(setInterval(function(){ addToCol(2); }, 3500));
  }
  startWf();

  window.wfToggle = function() {
    wfPaused = !wfPaused;
    var btn = document.getElementById('wfall-ctl');
    if (btn) btn.innerHTML = wfPaused ? '&#x25B6;' : '&#x23F8;';
    if (wfPaused) {
      wfTimers.forEach(function(t){ clearInterval(t); });
      wfTimers = [];
    } else { startWf(); }
  };

  // Pause on hover
  var stage = document.getElementById('wfall-stage');
  if (stage) {
    stage.addEventListener('mouseenter', function(){ wfPaused = true; });
    stage.addEventListener('mouseleave', function(){ wfPaused = false; });
  }
})();

// ═══ GALLERY LIGHTBOX ═══
// Build galImgs dynamically from the actual card images in the DOM
// so the lightbox always shows exactly what's on the card
var galImgs = [];

function galBuildImgs() {
  galImgs = [];
  var cards = document.querySelectorAll('.gc');
  cards.forEach(function(card) {
    // Priority: data-lb-src attr → gc-bg img → gc-mid img
    var src    = card.dataset.lbSrc || '';
    if (!src) {
      var bgImg  = card.querySelector('.gc-bg img');
      var midImg = card.querySelector('.gc-mid img');
      src = (bgImg && bgImg.src) || (midImg && midImg.src) || '';
    }
    var lbl   = '';
    var lblEl = card.querySelector('.gc-lbl-s');
    if (lblEl) lbl = lblEl.textContent;
    galImgs.push({ src: src, lbl: lbl });
  });
}

var galLbIdx = 0;
function galLbOpen(idx) {
  // Rebuild every time so it's always fresh
  galBuildImgs();
  galLbIdx = idx;
  var lb  = document.getElementById('gal-lb');
  var img = document.getElementById('gal-lb-img');
  var cap = document.getElementById('gal-lb-cap');
  if (!lb || !img) return;
  img.src = galImgs[idx] ? galImgs[idx].src : '';
  if (cap) cap.textContent = galImgs[idx] ? galImgs[idx].lbl : '';
  galLbDots();
  lb.style.display = 'flex';
  lb.style.animation = 'lbIn .28s ease both';
  document.body.style.overflow = 'hidden';
}
function galLbClose() {
  var lb = document.getElementById('gal-lb');
  if (lb) { lb.style.display = 'none'; }
  document.body.style.overflow = '';
}
function galLbNav(dir) {
  galBuildImgs();
  galLbIdx = (galLbIdx + dir + galImgs.length) % galImgs.length;
  var img = document.getElementById('gal-lb-img');
  var cap = document.getElementById('gal-lb-cap');
  if (img) { img.style.opacity = '0'; img.style.transform = 'scale(.96)'; img.style.transition = 'all .18s'; }
  setTimeout(function() {
    if (img && galImgs[galLbIdx]) { img.src = galImgs[galLbIdx].src; img.style.opacity = '1'; img.style.transform = 'scale(1)'; }
    if (cap && galImgs[galLbIdx]) cap.textContent = galImgs[galLbIdx].lbl;
    galLbDots();
  }, 180);
}
function galLbDots() {
  var dc = document.getElementById('gal-lb-dots');
  if (!dc) return;
  dc.innerHTML = '';
  galImgs.forEach(function(_, i) {
    var d = document.createElement('div');
    d.style.cssText = 'width:' + (i===galLbIdx?'18px':'6px') + ';height:6px;border-radius:3px;background:' + (i===galLbIdx?'var(--gold)':'rgba(255,255,255,.3)') + ';transition:all .25s;cursor:pointer;';
    d.onclick = function(e) { e.stopPropagation(); galLbOpen(i); };
    dc.appendChild(d);
  });
}
document.addEventListener('keydown', function(e) {
  var lb = document.getElementById('gal-lb');
  if (!lb || lb.style.display === 'none') return;
  if (e.key === 'Escape') galLbClose();
  if (e.key === 'ArrowRight') galLbNav(1);
  if (e.key === 'ArrowLeft') galLbNav(-1);
});

// ═══ HORIZONTAL SCROLL SECTION ═══
(function(){
  var track = document.getElementById('hscr-track');
  var dotsC = document.getElementById('hscr-dots');
  if (!track) return;

  // Load images from galImgs (already loaded) — reuse lifestyle photos
  var imgMap = [
    {id:'hsc-img0', gi:0},  // product
    {id:'hsc-img1', gi:1},  // morning table
    {id:'hsc-img2', gi:2},  // flatlay
    {id:'hsc-img3', gi:3},  // daily reset
    {id:'hsc-img4', gi:4},  // low energy
  ];
  imgMap.forEach(function(m){
    var el = document.getElementById(m.id);
    if (el && window.galImgs && galImgs[m.gi]) el.src = galImgs[m.gi].src;
  });

  // Build progress dots
  var CARD_COUNT = 6;
  if (dotsC) {
    for (var i=0;i<CARD_COUNT;i++){
      var d = document.createElement('div');
      d.className = 'hscr-dot' + (i===0?' on':'');
      d.setAttribute('data-i', i);
      d.onclick = (function(idx){ return function(){ hScrGoTo(idx); }; })(i);
      dotsC.appendChild(d);
    }
  }

  // Sync dots on scroll
  track.addEventListener('scroll', function(){
    var idx = Math.round(track.scrollLeft / 320);
    var dots = dotsC ? dotsC.querySelectorAll('.hscr-dot') : [];
    dots.forEach(function(d,i){ d.className = 'hscr-dot' + (i===idx?' on':''); });
  }, {passive:true});

  // Drag to scroll
  var isDragging = false, startX = 0, scrollLeft = 0;
  var wrap = document.getElementById('hscr-wrap');
  if (wrap) {
    wrap.addEventListener('mousedown', function(e){
      isDragging = true;
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });
    window.addEventListener('mousemove', function(e){
      if (!isDragging) return;
      e.preventDefault();
      var x = e.pageX - track.offsetLeft;
      track.scrollLeft = scrollLeft - (x - startX) * 1.4;
    });
    window.addEventListener('mouseup', function(){ isDragging = false; });
  }
})();

window.hScrNav = function(dir){
  var track = document.getElementById('hscr-track');
  if (track) track.scrollBy({left: dir * 330, behavior:'smooth'});
};
window.hScrGoTo = function(idx){
  var track = document.getElementById('hscr-track');
  if (track) track.scrollTo({left: idx * 320, behavior:'smooth'});
};

// ═══ EXIT INTENT POPUP ═══
(function(){
  var shown = false;
  var dismissed = false;

  function showPopup(){
    if (shown || dismissed) return;
    shown = true;
    var el = document.getElementById('exit-popup');
    if (el) el.classList.add('on');
    document.body.style.overflow = 'hidden';
    startEpTimer();
  }

  // Trigger: mouse leaves viewport upward
  document.addEventListener('mouseleave', function(e){
    if (e.clientY <= 0) showPopup();
  });

  // Fallback: trigger after 45s if still on page
  var fbTimer = setTimeout(function(){
    showPopup();
  }, 45000);

  // Timer countdown
  var epSecs = 14 * 60 + 59;
  var epInterval = null;
  function startEpTimer(){
    epInterval = setInterval(function(){
      epSecs--;
      if (epSecs <= 0){ clearInterval(epInterval); return; }
      var mm = Math.floor(epSecs / 60);
      var ss = epSecs % 60;
      var mmEl = document.getElementById('ep-mm');
      var ssEl = document.getElementById('ep-ss');
      if (mmEl) mmEl.textContent = mm < 10 ? '0'+mm : mm;
      if (ssEl) ssEl.textContent = ss < 10 ? '0'+ss : ss;
    }, 1000);
  }

  window.epClose = function(){
    dismissed = true;
    var el = document.getElementById('exit-popup');
    if (el){ el.style.opacity='0'; el.style.transition='opacity .3s'; setTimeout(function(){ el.classList.remove('on'); el.style.opacity=''; el.style.transition=''; }, 300); }
    document.body.style.overflow = '';
    clearTimeout(fbTimer);
    if (epInterval) clearInterval(epInterval);
  };

  window.epAccept = function(){
    epClose();
    goOrder();
  };

  window.epCopy = function(){
    try {
      navigator.clipboard.writeText('PEAK10').then(function(){
        var btn = document.getElementById('ep-copy-btn');
        if (btn){ btn.textContent='Copied!'; btn.style.color='var(--gold)'; btn.style.borderColor='var(--gold)'; setTimeout(function(){ btn.textContent='Copy'; btn.style.color=''; btn.style.borderColor=''; },2000); }
      });
    } catch(e){}
  };
})();

// ═══ SCROLL REVEAL ═══
(function(){
  if (!window.IntersectionObserver) return;
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, {threshold:0.1, rootMargin:'0px 0px -30px 0px'});

  function watchAll(sel, cls, stagger){
    document.querySelectorAll(sel).forEach(function(el, i){
      if (el.classList.contains('reveal') || el.classList.contains('reveal-card') || el.classList.contains('reveal-img')) return;
      el.classList.add(cls);
      if (stagger) el.classList.add('delay-' + Math.min((i % 6) + 1, 6));
      io.observe(el);
    });
  }

  watchAll('.tag', 'reveal', false);
  watchAll('.h2', 'reveal', true);
  watchAll('.pic', 'reveal-card', true);
  watchAll('.ps-img', 'reveal-img', false);
  watchAll('.ps-info > p, .ps-info > ul, .ps-info > .btn', 'reveal', true);
  watchAll('.s-item', 'reveal-card', true);
  watchAll('.sci-block, .sci-card', 'reveal-card', true);
  watchAll('.feat-item, .feat-card', 'reveal-card', true);
  watchAll('.os-card', 'reveal-card', true);
  watchAll('.wsst', 'reveal-card', true);
  watchAll('.faq-item', 'reveal-card', true);
  watchAll('.cta-ban h2, .cta-ban p', 'reveal', true);
  watchAll('.gal-hdr > *', 'reveal', true);
  watchAll('.sec-desc, .sec-sub', 'reveal', true);
})();

/* ═══════════════════════════════
   SUBSCRIPTION PURCHASE TOGGLE
═══════════════════════════════ */
(function() {
  // Base price per tin — from Shopify product, fallback to 34.90
  var PRICE_OT = (window.PEAKASY && window.PEAKASY.price) ? window.PEAKASY.price / 100 : 34.90;
  var SUB_DISCOUNT = 0.10; // 10% off

  var pkPurchaseType = 'onetime'; // 'onetime' | 'subscribe'
  window._pkPurchaseType = pkPurchaseType;

  window.pkSetPurchaseType = function(type) {
    pkPurchaseType = type;
    window._pkPurchaseType = type;
    var btnOt  = document.getElementById('sub-onetime');
    var btnSub = document.getElementById('sub-sub');
    var subInfo = document.getElementById('sub-info');
    var subSavRow = document.getElementById('sub-savings-row');
    var subFreq = document.getElementById('pk-sub-freq');
    var subUnit = document.getElementById('pk-sub-unit');

    if (type === 'subscribe') {
      if (btnOt)  btnOt.classList.remove('active');
      if (btnSub) btnSub.classList.add('active');
      if (subInfo) subInfo.style.display = 'flex';
      if (subSavRow) subSavRow.style.display = 'flex';
      // Enable Recharge hidden fields
      if (subFreq) { subFreq.name = subFreq.dataset.subName || 'properties[shipping_interval_frequency]'; subFreq.value = '1'; }
      if (subUnit) { subUnit.name = subUnit.dataset.subName || 'properties[shipping_interval_unit_type]'; subUnit.value = 'month'; }
    } else {
      if (btnOt)  btnOt.classList.add('active');
      if (btnSub) btnSub.classList.remove('active');
      if (subInfo) subInfo.style.display = 'none';
      if (subSavRow) subSavRow.style.display = 'none';
      // Disable Recharge hidden fields
      if (subFreq) { subFreq.name = ''; }
      if (subUnit) { subUnit.name = ''; }
    }
    // Re-run price update with current qty
    var qty = window._pkQty || 1;
    pkUpdatePrices(qty);
  };

  // Update prices when qty changes (hook into existing osPick)
  var origOsPick = window.osPick;
  window.osPick = function(el, q) {
    if (origOsPick) origOsPick(el, q);
    window._pkQty = q;
    pkUpdatePrices(q);
  };

  function pkUpdatePrices(q) {
    var isSubscribe = pkPurchaseType === 'subscribe';
    var unitPrice = isSubscribe ? PRICE_OT * (1 - SUB_DISCOUNT) : PRICE_OT;
    var subtotal = unitPrice * q;
    var savings  = isSubscribe ? (PRICE_OT * SUB_DISCOUNT * q) : 0;

    var fmtPrice = function(p) { return '$' + p.toFixed(2); };

    var elSub  = document.getElementById('os-sub');
    var elTot  = document.getElementById('os-tot');
    var elSav  = document.getElementById('sub-savings-amt');
    var elCta  = document.getElementById('os-cta-t');

    if (elSub)  elSub.textContent  = fmtPrice(subtotal);
    if (elTot)  elTot.textContent  = fmtPrice(subtotal);
    if (elSav)  elSav.textContent  = '−' + fmtPrice(savings);

    // Update price display on sub buttons
    var elPriceOt  = document.getElementById('sub-price-ot');
    var elPriceSub = document.getElementById('sub-price-sub');
    var unitSub = PRICE_OT * (1 - SUB_DISCOUNT);
    if (elPriceOt)  elPriceOt.textContent  = fmtPrice(PRICE_OT * q);
    if (elPriceSub) elPriceSub.innerHTML   = fmtPrice(unitSub * q) + '<span class="sub-per">/mo</span>';

    // Update CTA label
    var qLabel = q === 1 ? '1 Tin' : q + ' Tins';
    if (elCta) {
      elCta.textContent = isSubscribe
        ? 'Subscribe · ' + qLabel + ' · ' + fmtPrice(subtotal) + '/mo'
        : 'Add ' + qLabel + ' to Cart · ' + fmtPrice(subtotal);
    }
  }
})();
