// ═══ THEME PERSISTENCE ═══
;(function () {
	try {
		var t = localStorage.getItem('pk-theme')
		if (t === 'light') {
			document.documentElement.setAttribute('data-theme', 'light')
			document.body && document.body.classList.add('light')
		}
	} catch (e) {}
})()

// ═══ SHOPIFY PROD SYNC ═══
document.addEventListener('DOMContentLoaded', function () {
	if (window.PEAKASY) {
		if (typeof PROD !== 'undefined') {
			PROD.id = window.PEAKASY.productId
			PROD.price = window.PEAKASY.price / 100
			PROD.name = window.PEAKASY.title
		}
	}
	// Restore theme on load
	try {
		if (localStorage.getItem('pk-theme') === 'light') {
			document.body.classList.add('light')
			document.documentElement.setAttribute('data-theme', 'light')
			var btn =
				document.getElementById('thb') ||
				document.getElementById('thb') ||
				document.getElementById('thbtn')
			if (btn) btn.textContent = '🌙'
			if (typeof isLight !== 'undefined') isLight = true
		}
	} catch (e) {}
	if (typeof renderCans === 'function') renderCans()
	if (typeof updateOs === 'function') updateOs()

	// Init cart badge from Shopify
	if (window.PEAKASY && window.PEAKASY.cartCount > 0) {
		var cb = document.getElementById('cb')
		if (cb) {
			cb.textContent = window.PEAKASY.cartCount
			cb.className = 'bdg on'
		}
	}
	// Always refresh badge on load from live cart
	pkRefreshCartBadge()

	// ── Intercept Shopify product form → Ajax (no redirect) ──
	var pkForm = document.getElementById('pk-atc-form')
	if (pkForm) {
		pkForm.addEventListener('submit', function (e) {
			e.preventDefault()
			var variantId = parseInt(
				(document.getElementById('pk-variant-id') || {}).value || '0',
			)
			var qty =
				parseInt(
					(document.getElementById('pk-qty') || {}).value || '1',
				) ||
				osQty ||
				1
			var btn = document.getElementById('pk-atc-btn')
			var btnTxt = document.getElementById('os-cta-t')
			pkAddToCart(variantId, qty, btn, btnTxt)
		})
	}
})

// ═══ ASSETS ═══
const P1 = (window.PEAKASY && window.PEAKASY.productImg) || ''
const P2 = 'D'

// ═══ STATE ═══
const PROD = {
	id: 1,
	name: 'Mushroom Fuse Instant Coffee',
	price: 34.9,
	img: P1,
	sub: 'Medium Roast · 1.9oz · 30 Servings',
}
let cart = [],
	wishlist = [],
	osQty = 1

// ═══ CURSOR ═══
const cur = document.getElementById('cur')
const curR = document.getElementById('cur-r')
let mx = 0,
	my = 0,
	rx = 0,
	ry = 0
document.addEventListener('mousemove', e => {
	mx = e.clientX
	my = e.clientY
	cur.style.left = mx + 'px'
	cur.style.top = my + 'px'
})
;(function tick() {
	rx += (mx - rx) * 0.1
	ry += (my - ry) * 0.1
	curR.style.left = rx + 'px'
	curR.style.top = ry + 'px'
	requestAnimationFrame(tick)
})()
document.addEventListener('mousedown', () => {
	cur.style.width = '5px'
	cur.style.height = '5px'
})
document.addEventListener('mouseup', () => {
	cur.style.width = '7px'
	cur.style.height = '7px'
})
document.querySelectorAll('button, a, [onclick]').forEach(el => {
	el.addEventListener('mouseenter', () => curR.classList.add('h'))
	el.addEventListener('mouseleave', () => curR.classList.remove('h'))
})

// ═══ THEME ═══
var isLight = false
function toggleTheme() {
	isLight = !isLight
	document.body.classList.toggle('light', isLight)
	document.documentElement.setAttribute(
		'data-theme',
		isLight ? 'light' : 'dark',
	)
	var btn = document.getElementById('thb') || document.getElementById('thbtn')
	if (btn) btn.textContent = isLight ? '🌙' : '☀️'
	try {
		localStorage.setItem('pk-theme', isLight ? 'light' : 'dark')
	} catch (e) {}
}
// ═══ NAV ═══
function go(page) {
	var map = {
		home: '/',
		about: '/pages/about',
		cart: '/cart',
		shipping: '/pages/shipping',
		refund: '/pages/refund-policy',
		terms: '/policies/terms-of-service',
		privacy: '/policies/privacy-policy',
	}
	if (page === 'order') {
		goOrder()
		return
	}
	if (map[page]) window.location.href = map[page]
}
function goOrder() {
	var el = document.getElementById('order-sec')
	if (el) {
		el.scrollIntoView({ behavior: 'smooth' })
		return
	}
	window.location.href = '/#order-sec'
}
function toggleNav() {
	document.getElementById('nmob').classList.toggle('open')
}
window.addEventListener(
	'scroll',
	function () {
		document.getElementById('mnav').style.borderBottomColor =
			window.scrollY > 40 ? 'var(--bor)' : 'transparent'
	},
	{ passive: true },
)

// ═══ ORDER SECTION ═══
var REVS = [
	{ name: 'Sarah K.', s: '★★★★★', t: '"Game changer for my mornings!"' },
	{
		name: 'Marcus T.',
		s: '★★★★★',
		t: '"Tastes like real coffee, not earthy."',
	},
	{ name: 'Elena M.', s: '★★★★★', t: '"Creative clarity is unreal."' },
	{ name: 'James R.', s: '★★★★★', t: '"No more afternoon crash!"' },
	{ name: 'Priya S.', s: '★★★★★', t: '"Best thing I gave myself."' },
	{ name: 'Luca B.', s: '★★★★', t: '"Smooth, rich and functional."' },
]
// Supply info shown under cans based on selected quantity
var SUPPLY_INFO = {
	1: [
		{ ico: '☕', txt: '30 servings' },
		{ ico: '📅', txt: '14-days supply' },
	],
	2: [
		{ ico: '☕', txt: '60 servings' },
		{ ico: '📅', txt: '28-days supply' },
		{ ico: '⭐', txt: 'Most popular' },
		{ ico: '🚚', txt: 'Free shipping' },
	],
	3: [
		{ ico: '☕', txt: '90 servings' },
		{ ico: '📅', txt: '42-days supply' },
		{ ico: '⭐', txt: 'Best value' },
		{ ico: '🚚', txt: 'Free shipping' },
	],
}

// Can layouts: all centered (left:50%), differentiated by rotate/scale/z
// rotate: negative = lean left, positive = lean right
var CAN_LAYOUTS = {
	1: [{ left: '50%', y: 0, scale: 1, rotate: 0, opacity: 1, z: 2 }],
	2: [
		{ left: '50%', y: 0, scale: 0.88, rotate: -15, opacity: 0.9, z: 1 },
		{ left: '50%', y: 0, scale: 1, rotate: 0, opacity: 1, z: 2 },
	],
	3: [
		{ left: '50%', y: 0, scale: 0.85, rotate: -15, opacity: 0.88, z: 1 },
		{ left: '50%', y: 0, scale: 1, rotate: 0, opacity: 1, z: 3 },
		{ left: '50%', y: -16, scale: 0.85, rotate: 15, opacity: 0.88, z: 1 },
	],
}

function _canTf(y, scale, rotate) {
	return (
		'translateX(-50%) translateY(' +
		y +
		'px) rotate(' +
		(rotate || 0) +
		'deg) scale(' +
		scale +
		')'
	)
}
function _applyCanPos(el, pos) {
	el.style.left = pos.left
	el.style.zIndex = pos.z
	el.style.opacity = pos.opacity
	el.style.transform = _canTf(pos.y, pos.scale, pos.rotate)
}
function _makeCan(src) {
	var d = document.createElement('div')
	d.className = 'ocan'
	// Start hidden at center-bottom, scale 0 — CSS transition will animate to target
	d.style.cssText =
		'position:absolute;bottom:0;left:50%;z-index:0;opacity:0;transform:' +
		_canTf(20, 0, 0) +
		';transform-origin:bottom center;'
	d.innerHTML =
		'<img src="' +
		src +
		'" alt="Peakasy" style="height:180px;width:auto;display:block;">'
	return d
}

function renderCans() {
	var stage = document.getElementById('cans-stage')
	if (!stage) return
	var canImg = (window.PEAKASY && window.PEAKASY.productTransparent) || P1
	var n = Math.min(osQty, 3)
	var positions = CAN_LAYOUTS[n]
	// Exclude cans already animating out
	var activeCans = Array.prototype.slice.call(
		stage.querySelectorAll('.ocan:not(.ocan--out)'),
	)
	var existing = activeCans.length

	if (existing === 0) {
		// First render: spawn all from center, stagger into positions
		positions.forEach(function (pos, i) {
			var d = _makeCan(canImg)
			stage.appendChild(d)
			;(function (el, p, delay) {
				setTimeout(function () {
					_applyCanPos(el, p)
				}, 16 + delay)
			})(d, pos, i * 60)
		})
	} else if (n > existing) {
		// Adding cans: reposition existing, fly in new ones
		activeCans.forEach(function (can, i) {
			_applyCanPos(can, positions[i])
		})
		for (var i = existing; i < n; i++) {
			var d = _makeCan(canImg)
			stage.appendChild(d)
			;(function (el, pos, delay) {
				setTimeout(function () {
					_applyCanPos(el, pos)
				}, 16 + delay)
			})(d, positions[i], i * 60)
		}
	} else if (n < existing) {
		// Removing cans: exit animation on surplus, reposition remaining
		for (var i = n; i < existing; i++) {
			;(function (el) {
				el.classList.add('ocan--out')
				el.style.transition = 'transform .24s ease, opacity .2s ease'
				el.style.transform = _canTf(20, 0, 0)
				el.style.opacity = '0'
				setTimeout(function () {
					if (el.parentNode) el.parentNode.removeChild(el)
				}, 260)
			})(activeCans[i])
		}
		activeCans.forEach(function (can, i) {
			if (i < n) _applyCanPos(can, positions[i])
		})
	} else {
		// Same count, reposition (e.g. layout shift 1→same qty but different layout)
		activeCans.forEach(function (can, i) {
			_applyCanPos(can, positions[i])
		})
	}

	var lbl = document.getElementById('cans-lbl')
	if (lbl) lbl.textContent = osQty + ' \u00d7 Mushroom Fuse Coffee'
	var mr = document.getElementById('mini-revs')
	if (mr) {
		var info = SUPPLY_INFO[Math.min(osQty, 3)] || SUPPLY_INFO[1]
		mr.innerHTML = info
			.map(function (item, i) {
				return (
					'<div class="omr" style="animation-delay:' +
					i * 0.08 +
					's"><span class="omr-ico">' +
					item.ico +
					'</span><span class="omr-t">' +
					item.txt +
					'</span></div>'
				)
			})
			.join('')
	}
}

function renderOsBar() {
	var el = document.getElementById('os-revs')
	if (!el) return
	el.innerHTML = REVS.map(function (r) {
		return (
			'<div class="orc"><div class="orc-t"><span class="orc-n">' +
			r.name +
			'</span><span class="orc-s">' +
			r.s +
			'</span></div><div class="orc-tx">' +
			r.t +
			'</div></div>'
		)
	}).join('')
}

function updateOs() {
	var isSubscribe = window._pkPurchaseType === 'subscribe'
	var basePrice =
		window.PEAKASY && window.PEAKASY.price
			? window.PEAKASY.price / 100
			: PROD.price
	var unitPrice = isSubscribe ? basePrice * 0.9 : basePrice
	var total = osQty * unitPrice
	var ship = total >= 40 ? 0 : 4.99
	var se = document.getElementById('os-sub')
	if (se) se.textContent = '$' + total.toFixed(2)
	var she = document.getElementById('os-ship')
	if (she) {
		she.textContent = ship === 0 ? 'Free' : '$' + ship.toFixed(2)
		she.style.color = ship === 0 ? '#5a9a5a' : 'var(--text)'
	}
	var te = document.getElementById('os-tot')
	if (te) te.textContent = '$' + (total + ship).toFixed(2)
	var ce = document.getElementById('os-cta-t')
	if (ce) {
		var qLabel = osQty + ' Tin' + (osQty > 1 ? 's' : '')
		ce.textContent = isSubscribe
			? 'Subscribe \u00b7 ' +
				qLabel +
				' \u00b7 $' +
				total.toFixed(2) +
				'/mo'
			: 'Add ' + qLabel + ' to Cart'
	}
}

function osPick(el, q) {
	document.querySelectorAll('.osp').forEach(function (p) {
		p.classList.remove('sel')
		p.querySelector('.osp-chk').textContent = ''
	})
	el.classList.add('sel')
	el.querySelector('.osp-chk').textContent = '✓'
	osQty = q
	// Sync Shopify form quantity input
	var qtyInput = document.getElementById('pk-qty')
	if (qtyInput) qtyInput.value = q
	renderCans()
	updateOs()
}

/* ═══════════════════════════════
   BUY NOW — add to cart then redirect to /checkout
═══════════════════════════════ */
function pkBuyNow() {
	var variantId =
		window.PEAKASY && window.PEAKASY.variantId
			? window.PEAKASY.variantId
			: null
	var varInput = document.getElementById('pk-variant-id')
	if (varInput && varInput.value) variantId = parseInt(varInput.value, 10)
	if (!variantId) {
		toast('Product not configured', '⚙️')
		return
	}

	var qty =
		parseInt((document.getElementById('pk-qty') || {}).value || '1') ||
		osQty ||
		1

	var btn = document.getElementById('pk-buy-btn')
	var btnTxt = document.getElementById('os-buy-t')
	if (btn) { btn.disabled = true; btn.classList.add('loading') }
	if (btnTxt) btnTxt.textContent = 'Processing...'

	var body = { id: variantId, quantity: qty }
	if (window._pkPurchaseType === 'subscribe') {
		var planInput = document.getElementById('pk-selling-plan')
		if (planInput && planInput.value) {
			body.selling_plan = parseInt(planInput.value, 10)
		}
	}

	fetch('/cart/add.js', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
		body: JSON.stringify(body),
	})
		.then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d } }) })
		.then(function (res) {
			if (!res.ok || (res.data.status && res.data.status >= 400)) {
				if (btn) { btn.disabled = false; btn.classList.remove('loading') }
				if (btnTxt) btnTxt.textContent = 'Buy Now'
				toast(res.data.description || 'Something went wrong. Please try again.', '⚠️')
				return
			}
			window.location.href = '/checkout'
		})
		.catch(function () {
			if (btn) { btn.disabled = false; btn.classList.remove('loading') }
			if (btnTxt) btnTxt.textContent = 'Buy Now'
			toast('Something went wrong. Please try again.', '⚠️')
		})
}

/* ═══════════════════════════════
   CORE CART FUNCTION — used by all Add to Cart buttons
═══════════════════════════════ */
function pkAddToCart(variantId, qty, btn, btnTxt) {
	if (!variantId) {
		toast('Настройте продукт в Theme Settings', '⚙️')
		return
	}
	if (btn) {
		btn.disabled = true
		btn.classList.add('loading')
	}
	if (btnTxt) btnTxt.textContent = 'Adding...'

	// Build request body
	var body = { id: variantId, quantity: qty }

	// Add selling_plan if subscribe mode is active (Shopify Subscriptions)
	if (window._pkPurchaseType === 'subscribe') {
		var planInput = document.getElementById('pk-selling-plan')
		if (planInput && planInput.value) {
			body.selling_plan = parseInt(planInput.value, 10)
		}
	}

	fetch('/cart/add.js', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		body: JSON.stringify(body),
	})
		.then(function (r) {
			return r.json().then(function (data) {
				return { ok: r.ok, status: r.status, data: data }
			})
		})
		.then(function (res) {
			var data = res.data
			if (btn) {
				btn.disabled = false
				btn.classList.remove('loading')
			}
			if (!res.ok || data.status >= 400) {
				// Shopify returned an error (422 = out of stock / invalid, 404 = not found)
				toast(
					data.description ||
						data.message ||
						'Ошибка — попробуй ещё раз',
					'⚠️',
				)
				if (btnTxt) btnTxt.textContent = 'Add to Cart'
				return
			}
			// ✅ Success — show toast
			var isSubscribe = window._pkPurchaseType === 'subscribe'
			toast(
				isSubscribe
					? 'Subscription confirmed! ☕'
					: 'Added to cart! ☕',
				'✓',
			)
			// Update cart badge counter
			pkRefreshCartBadge()
			// Reset button text with confirmation then restore
			if (btnTxt) {
				var qLabel = qty + ' Tin' + (qty > 1 ? 's' : '')
				btnTxt.textContent = '✓ Added!'
				setTimeout(function () {
					if (btnTxt) {
						if (isSubscribe) {
							btnTxt.textContent = 'Subscribe · ' + qLabel
						} else {
							btnTxt.textContent = 'Add ' + qLabel + ' to Cart'
						}
					}
				}, 2500)
			}
		})
		.catch(function (err) {
			console.error('[Peakasy] Cart error:', err)
			if (btn) {
				btn.disabled = false
				btn.classList.remove('loading')
			}
			if (btnTxt) btnTxt.textContent = 'Add to Cart'
			toast('Something went wrong. Please try again.', '⚠️')
		})
}

function pkRefreshCartBadge() {
	fetch('/cart.js')
		.then(function (r) {
			return r.json()
		})
		.then(function (c) {
			var cb = document.getElementById('cb')
			if (cb) {
				cb.textContent = c.item_count
				cb.className = 'bdg' + (c.item_count > 0 ? ' on' : '')
			}
		})
		.catch(function () {})
}

// Legacy wrapper — keeps compatibility with onclick="addToCart()" buttons
function addToCart() {
	// Always prefer DOM value (set by Shopify Liquid from real variant ID)
	var domVariant = parseInt(
		(document.getElementById('pk-variant-id') || {}).value || '0',
	)
	var variantId =
		domVariant || (window.PEAKASY && window.PEAKASY.variantId) || 0
	var qty = osQty || 1
	var btn =
		document.getElementById('pk-atc-btn') ||
		document.querySelector('.os-cta')
	var btnTxt = document.getElementById('os-cta-t')
	pkAddToCart(variantId, qty, btn, btnTxt)
}

renderCans()
renderOsBar()
updateOs()

// ═══ SCROLL REVEAL (below) ═══
// rStep/rAns removed with ritual builder

// ═══ CART ═══
function cartQty(id, d) {
	var item = cart.find(function (c) {
		return c.id === id
	})
	if (!item) return
	item.qty = Math.max(1, item.qty + d)
	renderCart()
	updateBadges()
}
function cartRm(id) {
	cart = cart.filter(function (c) {
		return c.id !== id
	})
	renderCart()
	updateBadges()
}
function applyPromo() {
	toast('Promo applied!', '🎉')
}
function doCheckout() {
	toast('Redirecting to checkout...', '🔒')
}
function renderCart() {
	var el = document.getElementById('cart-content')
	if (!el) return
	if (!cart.length) {
		el.innerHTML =
			'<div class="cempty"><div class="ce-ico">&#x1F6D2;</div><div class="ce-t">Your cart is empty</div><p class="ce-s">Discover our Mushroom Fuse Coffee.</p><button class="btn-g" onclick="goOrder()">Shop Now &#x2192;</button></div>'
		return
	}
	var sub = cart.reduce(function (s, c) {
		return s + c.price * c.qty
	}, 0)
	var ship = sub >= 40 ? 0 : 4.99
	var rows = ''
	cart.forEach(function (item) {
		rows += '<div class="ci">'
		rows += '<div class="ci-img"><img src="' + item.img + '" alt=""></div>'
		rows += '<div class="ci-inf">'
		rows += '<div class="ci-nm">' + item.name + '</div>'
		rows += '<div class="ci-sub">' + item.sub + '</div>'
		rows += '<div class="ci-qty">'
		rows +=
			'<button class="cqb" onclick="cartQty(' +
			item.id +
			',-1)">&#x2212;</button>'
		rows += '<span class="cqn">' + item.qty + '</span>'
		rows +=
			'<button class="cqb" onclick="cartQty(' +
			item.id +
			',1)">+</button>'
		rows += '</div></div>'
		rows += '<div class="ci-r">'
		rows +=
			'<div class="ci-pr">$' +
			(item.price * item.qty).toFixed(2) +
			'</div>'
		rows +=
			'<button class="ci-rm" onclick="cartRm(' +
			item.id +
			')">Remove</button>'
		rows += '</div></div>'
	})
	var shCol = ship === 0 ? '#5a9a5a' : 'var(--text)'
	var shTxt = ship === 0 ? 'Free' : '$' + ship.toFixed(2)
	var html = '<div class="cart-lay"><div>' + rows + '</div>'
	html += '<div class="cs">'
	html += '<div class="cs-t">Order Summary</div>'
	html +=
		'<div class="cs-row"><span>Subtotal</span><span>$' +
		sub.toFixed(2) +
		'</span></div>'
	html +=
		'<div class="cs-row"><span>Shipping</span><span style="color:' +
		shCol +
		'">' +
		shTxt +
		'</span></div>'
	html += '<div style="margin:11px 0">'
	html +=
		'<div style="font-size:.65rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:7px">Promo Code</div>'
	html +=
		'<div class="promo-r"><input class="promo-in" id="pc-in" placeholder="PEAKASY10"><button class="promo-btn" onclick="applyPromo()">Apply</button></div>'
	html += '</div>'
	html +=
		'<div class="cs-row cs-tot"><span>Total</span><span class="cs-totv">$' +
		(sub + ship).toFixed(2) +
		'</span></div>'
	html +=
		'<button class="co-btn" onclick="doCheckout()">Proceed to Checkout &#x2192;</button>'
	html +=
		'<button class="btn-o" style="width:100%;margin-top:8px;border-radius:12px;padding:11px;" onclick="goOrder()">Continue Shopping</button>'
	html += '</div></div>'
	el.innerHTML = html
}
// ═══ WISHLIST ═══
function renderWishlist() {
	var el = document.getElementById('wl-content')
	if (!el) return
	if (!wishlist.length) {
		var html = '<div class="wl-empty">'
		html +=
			'<div style="font-size:3rem;opacity:.18;margin-bottom:12px">&#x2661;</div>'
		html +=
			'<div style="font-family:Cormorant Garamond,serif;font-size:1.5rem;font-weight:700;color:var(--text);margin-bottom:8px">Your wishlist is empty</div>'
		html +=
			'<p style="color:var(--text2);font-size:.84rem;margin-bottom:20px">Save your favourites.</p>'
		html +=
			'<button class="btn-g" onclick="goOrder()">Explore &#x2192;</button>'
		html += '</div>'
		el.innerHTML = html
		return
	}
	var cards = ''
	wishlist.forEach(function (p) {
		cards += '<div class="wlc" onclick="goOrder()">'
		cards += '<div class="wlc-img"><img src="' + p.img + '" alt=""></div>'
		cards += '<div class="wlc-b">'
		cards += '<div class="wlc-n">' + p.name + '</div>'
		cards += '<div class="wlc-sub">' + p.sub + '</div>'
		cards += '<div class="wlc-ft">'
		cards += '<span class="wlc-p">$' + p.price.toFixed(2) + '</span>'
		cards +=
			'<button class="btn-g" style="padding:5px 14px;font-size:.71rem" onclick="event.stopPropagation();goOrder()">Buy</button>'
		cards += '</div></div></div>'
	})
	el.innerHTML = '<div class="wl-grid">' + cards + '</div>'
}
// ═══ BADGES ═══
function updateBadges() {
	fetch('/cart.js')
		.then(function (r) {
			return r.json()
		})
		.then(function (c) {
			var cb = document.getElementById('cb')
			if (cb) {
				cb.textContent = c.item_count
				cb.className = 'bdg' + (c.item_count ? ' on' : '')
			}
		})
		.catch(function () {})
}

// ═══ FAQ ═══
function faq(el) {
	var fi = el.parentElement
	var was = fi.classList.contains('op')
	document.querySelectorAll('.fi').forEach(function (f) {
		f.classList.remove('op')
	})
	if (!was) fi.classList.add('op')
}

// ═══ TOAST ═══
var _tt
function toast(msg, icon) {
	var t = document.getElementById('toast')
	document.getElementById('t-ico').textContent = icon || ''
	document.getElementById('t-msg').textContent = msg
	t.classList.add('on')
	clearTimeout(_tt)
	_tt = setTimeout(function () {
		t.classList.remove('on')
	}, 2800)
}

// ═══ EXIT INTENT POPUP ═══
;(function () {
	var shown = false
	var dismissed = false

	function showPopup() {
		if (shown || dismissed) return
		shown = true
		var el = document.getElementById('exit-popup')
		if (el) el.classList.add('on')
		document.body.style.overflow = 'hidden'
		startEpTimer()
	}

	// Trigger: mouse leaves viewport upward
	document.addEventListener('mouseleave', function (e) {
		if (e.clientY <= 0) showPopup()
	})

	// Fallback: trigger after 45s if still on page
	var fbTimer = setTimeout(function () {
		showPopup()
	}, 45000)

	// Timer countdown
	var epSecs = 14 * 60 + 59
	var epInterval = null
	function startEpTimer() {
		epInterval = setInterval(function () {
			epSecs--
			if (epSecs <= 0) {
				clearInterval(epInterval)
				return
			}
			var mm = Math.floor(epSecs / 60)
			var ss = epSecs % 60
			var mmEl = document.getElementById('ep-mm')
			var ssEl = document.getElementById('ep-ss')
			if (mmEl) mmEl.textContent = mm < 10 ? '0' + mm : mm
			if (ssEl) ssEl.textContent = ss < 10 ? '0' + ss : ss
		}, 1000)
	}

	window.epClose = function () {
		dismissed = true
		var el = document.getElementById('exit-popup')
		if (el) {
			el.style.opacity = '0'
			el.style.transition = 'opacity .3s'
			setTimeout(function () {
				el.classList.remove('on')
				el.style.opacity = ''
				el.style.transition = ''
			}, 300)
		}
		document.body.style.overflow = ''
		clearTimeout(fbTimer)
		if (epInterval) clearInterval(epInterval)
	}

	window.epAccept = function () {
		epClose()
		goOrder()
	}

	window.epCopy = function () {
		try {
			navigator.clipboard.writeText('PEAK10').then(function () {
				var btn = document.getElementById('ep-copy-btn')
				if (btn) {
					btn.textContent = 'Copied!'
					btn.style.color = 'var(--gold)'
					btn.style.borderColor = 'var(--gold)'
					setTimeout(function () {
						btn.textContent = 'Copy'
						btn.style.color = ''
						btn.style.borderColor = ''
					}, 2000)
				}
			})
		} catch (e) {}
	}
})()

// ═══ SCROLL REVEAL ═══
;(function () {
	if (!window.IntersectionObserver) return
	var io = new IntersectionObserver(
		function (entries) {
			entries.forEach(function (e) {
				if (e.isIntersecting) {
					e.target.classList.add('visible')
					io.unobserve(e.target)
				}
			})
		},
		{ threshold: 0.1, rootMargin: '0px 0px -30px 0px' },
	)

	function watchAll(sel, cls, stagger) {
		document.querySelectorAll(sel).forEach(function (el, i) {
			if (
				el.classList.contains('reveal') ||
				el.classList.contains('reveal-card') ||
				el.classList.contains('reveal-img')
			)
				return
			el.classList.add(cls)
			if (stagger) el.classList.add('delay-' + Math.min((i % 6) + 1, 6))
			io.observe(el)
		})
	}

	watchAll('.tag', 'reveal', false)
	watchAll('.h2', 'reveal', true)
	watchAll('.os-card', 'reveal-card', true)
	watchAll('.faq-item', 'reveal-card', true)
	watchAll('.cta-ban h2, .cta-ban p', 'reveal', true)
})()

// ═══ SCROLL STORY DRIVER ═══
;(function () {
	function ph(p, a, b) { return Math.max(0, Math.min(1, (p - a) / (b - a))) }
	function eo(t) { return 1 - Math.pow(1 - t, 3) }

	// Thin gold progress bar
	var pbar = document.createElement('div')
	pbar.className = 'st-progress'
	document.body.appendChild(pbar)

	var chapters = []
	document.querySelectorAll('[data-story]').forEach(function (ch) {
		chapters.push(ch)
	})

	function updateCh1(p) {
		var brand = document.getElementById('st-brand')
		var tag   = document.getElementById('st-tag')
		var can   = document.getElementById('st-can')
		var cta   = document.getElementById('st-cta')
		if (!brand) return

		var pB = eo(ph(p, 0, 0.2))
		brand.style.opacity   = pB
		brand.style.transform = 'translateY(' + (20 * (1 - pB)) + 'px)'

		var pTi = eo(ph(p, 0.2, 0.45))
		var pTo = ph(p, 0.85, 1.0)
		tag.style.opacity   = Math.max(0, pTi - pTo)
		tag.style.transform = 'translateY(' + (16 * (1 - pTi)) + 'px)'

		var pCi = eo(ph(p, 0.4, 0.65))
		var pCo = ph(p, 0.88, 1.0)
		can.style.opacity   = Math.max(0, pCi - pCo)
		can.style.transform = 'translateY(' + (40 * (1 - pCi)) + 'px)'

		var pCta = eo(ph(p, 0.7, 0.88)) * (1 - ph(p, 0.94, 1.0))
		cta.style.opacity = Math.max(0, pCta)
	}

	function updateCh2(p) {
		var lines = [
			document.getElementById('st-p1'),
			document.getElementById('st-p2'),
			document.getElementById('st-p3')
		]
		if (!lines[0]) return
		var thresholds = [
			[0.05, 0.25, 0.3,  0.48],
			[0.32, 0.52, 0.6,  0.76],
			[0.62, 0.82, 1.0,  1.0]
		]
		thresholds.forEach(function (t, i) {
			var fadeIn  = eo(ph(p, t[0], t[1]))
			var fadeOut = ph(p, t[2], t[3])
			var op = Math.max(0, fadeIn - fadeOut)
			lines[i].style.opacity   = op
			lines[i].style.transform = 'translateY(' + ((1 - fadeIn) * 20) + 'px)'
		})
	}

	function updateCh3(p) {
		var can  = document.getElementById('st-ans-can')
		var name = document.getElementById('st-ans-name')
		var ing  = document.getElementById('st-ans-ing')
		if (!can) return
		var pCan = eo(ph(p, 0.05, 0.35))
		can.style.opacity   = pCan
		can.style.transform = 'translateY(' + (60 * (1 - pCan)) + 'px)'
		var pName = eo(ph(p, 0.38, 0.62))
		name.style.opacity   = pName
		name.style.transform = 'translateX(' + (-40 * (1 - pName)) + 'px)'
		var pIng = eo(ph(p, 0.65, 0.85))
		ing.style.opacity = pIng
	}

	function updateCh4(p) {
		var ings = [0, 1, 2].map(function (i) { return document.getElementById('st-ing' + i) })
		if (!ings[0]) return
		var ZONE = 1 / 3
		ings.forEach(function (el, i) {
			if (!el) return
			var center   = (i + 0.5) * ZONE
			var fadeIn   = eo(ph(p, center - 0.22, center - 0.06))
			var fadeOut  = ph(p, center + 0.06, center + 0.22)
			el.style.opacity   = Math.max(0, fadeIn - fadeOut)
			el.style.transform = 'translateY(' + ((1 - fadeIn) * 24) + 'px)'
		})
	}

	function updateCh5(p) {
		document.querySelectorAll('.st-step').forEach(function (step) {
			var at = parseFloat(step.getAttribute('data-at') || '0')
			if (p >= at) step.classList.add('visible')
		})
	}

	function updateCh6(p) {
		document.querySelectorAll('.st-rev').forEach(function (rev) {
			var at = parseFloat(rev.getAttribute('data-at') || '0')
			var op = eo(ph(p, at, at + 0.18))
			rev.style.opacity = op
		})
	}

	var updaters = [updateCh1, updateCh2, updateCh3, updateCh4, updateCh5, updateCh6]

	function onScroll() {
		var scrollY = window.scrollY || window.pageYOffset
		var totalH  = document.body.scrollHeight - window.innerHeight
		if (pbar) pbar.style.width = (totalH > 0 ? (scrollY / totalH) * 100 : 0) + '%'

		chapters.forEach(function (ch, i) {
			var rect = ch.getBoundingClientRect()
			var p = Math.max(0, Math.min(1, -rect.top / (ch.offsetHeight - window.innerHeight)))
			if (updaters[i]) updaters[i](p)
		})
	}

	window.addEventListener('scroll', onScroll, { passive: true })
	// Initial call after DOM settles
	setTimeout(onScroll, 100)
})()

/* ═══════════════════════════════
   SUBSCRIPTION PURCHASE TOGGLE
═══════════════════════════════ */
;(function () {
	// Base price per tin — from Shopify product, fallback to 34.90
	var PRICE_OT =
		window.PEAKASY && window.PEAKASY.price
			? window.PEAKASY.price / 100
			: 34.9
	var SUB_DISCOUNT = 0.1 // 10% off

	var pkPurchaseType = 'onetime' // 'onetime' | 'subscribe'
	window._pkPurchaseType = pkPurchaseType

	window.pkSetPurchaseType = function (type) {
		pkPurchaseType = type
		window._pkPurchaseType = type
		var btnOt = document.getElementById('sub-onetime')
		var btnSub = document.getElementById('sub-sub')
		var subInfo = document.getElementById('sub-info')
		var subManage = document.getElementById('sub-manage-link')
		var subSavRow = document.getElementById('sub-savings-row')

		if (type === 'subscribe') {
			if (btnOt) btnOt.classList.remove('active')
			if (btnSub) btnSub.classList.add('active')
			if (subInfo) subInfo.style.display = 'flex'
			if (subManage) subManage.style.display = 'block'
			if (subSavRow) subSavRow.style.display = 'flex'
		} else {
			if (btnOt) btnOt.classList.add('active')
			if (btnSub) btnSub.classList.remove('active')
			if (subInfo) subInfo.style.display = 'none'
			if (subManage) subManage.style.display = 'none'
			if (subSavRow) subSavRow.style.display = 'none'
		}
		// Re-run price update with current qty
		var qty = window._pkQty || 1
		pkUpdatePrices(qty)
	}

	// Update prices when qty changes (hook into existing osPick)
	var origOsPick = window.osPick
	window.osPick = function (el, q) {
		if (origOsPick) origOsPick(el, q)
		window._pkQty = q
		pkUpdatePrices(q)
	}

	function pkUpdatePrices(q) {
		var isSubscribe = pkPurchaseType === 'subscribe'
		var unitPrice = isSubscribe ? PRICE_OT * (1 - SUB_DISCOUNT) : PRICE_OT
		var subtotal = unitPrice * q
		var savings = isSubscribe ? PRICE_OT * SUB_DISCOUNT * q : 0

		var fmtPrice = function (p) {
			return '$' + p.toFixed(2)
		}

		var elSub = document.getElementById('os-sub')
		var elTot = document.getElementById('os-tot')
		var elSav = document.getElementById('sub-savings-amt')
		var elCta = document.getElementById('os-cta-t')

		if (elSub) elSub.textContent = fmtPrice(subtotal)
		if (elTot) elTot.textContent = fmtPrice(subtotal)
		if (elSav) elSav.textContent = '−' + fmtPrice(savings)

		// Update price display on sub buttons
		var elPriceOt = document.getElementById('sub-price-ot')
		var elPriceSub = document.getElementById('sub-price-sub')
		var unitSub = PRICE_OT * (1 - SUB_DISCOUNT)
		if (elPriceOt) elPriceOt.textContent = fmtPrice(PRICE_OT * q)
		if (elPriceSub)
			elPriceSub.innerHTML =
				fmtPrice(unitSub * q) + '<span class="sub-per">/mo</span>'

		// Update CTA label
		var qLabel = q === 1 ? '1 Tin' : q + ' Tins'
		if (elCta) {
			elCta.textContent = isSubscribe
				? 'Subscribe · ' + qLabel + ' · ' + fmtPrice(subtotal) + '/mo'
				: 'Add ' + qLabel + ' to Cart · ' + fmtPrice(subtotal)
		}
	}
})()
