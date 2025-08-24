/* ===== Utilities ===== */
const $ = (q, ctx = document) => ctx.querySelector(q);
const $$ = (q, ctx = document) => Array.from(ctx.querySelectorAll(q));

/* ===== Theme Toggle (persist) ===== */
const themeBtn = $('#themeBtn');
const rootHtml = document.documentElement;
const savedTheme = localStorage.getItem('theme');
if (savedTheme) rootHtml.setAttribute('data-theme', savedTheme);
updateThemeIcon();

themeBtn.addEventListener('click', () => {
    const next = rootHtml.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    rootHtml.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon();
});
function updateThemeIcon() {
    const isLight = rootHtml.getAttribute('data-theme') === 'light';
    themeBtn.innerHTML = `<i class="fa-solid ${isLight ? 'fa-moon' : 'fa-sun'}"></i>`;
}

/* ===== Preloader ===== */
window.addEventListener('load', () => {
    setTimeout(() => $('#preloader').style.display = 'none', 600);
});

/* ===== Smooth Scroll + Header shrink ===== */
$$('.navlink').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        const id = a.getAttribute('href');
        const target = $(id);
        if (!target) return;
        window.scrollTo({ top: target.offsetTop - 70, behavior: 'smooth' });
    });
});
window.addEventListener('scroll', () => {
    const h = $('#header');
    h.style.background = (window.scrollY > 100) ? 'rgba(15,12,29,0.98)' : 'rgba(15,12,29,0.85)';
});

/* ===== Progress bar + Gamification badges ===== */
const progressBar = $('#progress-bar');
const badgeTray = $('#badge-tray');
const sections = ['#home', '#portfolio', '#testimonials', '#clients', '#analytics', '#contact'].map(id => ({ id, seen: false }));
window.addEventListener('scroll', () => {
    const st = document.documentElement.scrollTop;
    const sh = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    progressBar.style.width = `${(st / sh) * 100}%`;

    sections.forEach(s => {
        const el = $(s.id);
        if (!s.seen && el && el.getBoundingClientRect().top < window.innerHeight * 0.6) {
            s.seen = true;
            giveBadge(el.id);
        }
    });
});
function giveBadge(name) {
    const span = document.createElement('span');
    span.className = 'badge';
    span.textContent = `✓ ${name} viewed`;
    badgeTray.appendChild(span);
    setTimeout(() => span.remove(), 3500);
}

/* ===== IntersectionObserver: scroll animations & lazy video play ===== */
const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
            // Auto-play portfolio hover videos if visible and hovering handled later
        }
    });
}, { threshold: 0.2 });
$$('.section-observe').forEach(el => io.observe(el));

/* ===== Custom Cursor ===== */
const cDot = $('#cursorDot'), cOut = $('#cursorOutline');
window.addEventListener('mousemove', (e) => {
    const { clientX: x, clientY: y } = e;
    cDot.style.left = x + 'px'; cDot.style.top = y + 'px';
    cOut.style.left = x + 'px'; cOut.style.top = y + 'px';
});
window.addEventListener('mousedown', () => cOut.style.transform = 'translate(-50%,-50%) scale(0.7)');
window.addEventListener('mouseup', () => cOut.style.transform = 'translate(-50%,-50%) scale(1)');
/* Ripple coords */
$$('.ripple').forEach(el => {
    el.addEventListener('pointerdown', e => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--x', `${e.clientX - rect.left}px`);
        el.style.setProperty('--y', `${e.clientY - rect.top}px`);
    });
});

/* ===== Portfolio: Filter + Search + Live Preview (hover video) ===== */
const filterBtns = $$('.filter-btn');
const cards = $$('.portfolio-card');
const searchInput = $('#searchInput');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyFilterSearch();
    });
});
searchInput.addEventListener('input', applyFilterSearch);

function applyFilterSearch() {
    const active = $('.filter-btn.active').dataset.filter;
    const term = (searchInput.value || '').toLowerCase().trim();
    cards.forEach(card => {
        const cat = card.dataset.category;
        const tags = (card.dataset.tags || '') + ' ' + card.innerText.toLowerCase();
        const matchCat = (active === 'all' || cat === active);
        const matchTerm = (term === '' || tags.includes(term));
        card.style.display = (matchCat && matchTerm) ? '' : 'none';
    });
}

/* Hover live preview */
cards.forEach(card => {
    const holder = $('.preview', card);
    const src = holder?.dataset.video;
    if (!holder || !src) return;
    let vid;
    card.addEventListener('mouseenter', () => {
        if (vid) return;
        vid = document.createElement('video');
        vid.src = src;
        vid.muted = true; vid.loop = true; vid.playsInline = true; vid.autoplay = true;
        vid.setAttribute('preload', 'none');
        holder.appendChild(vid);
    });
    card.addEventListener('mouseleave', () => {
        if (vid) { vid.remove(); vid = null; }
    });
});

/* ===== Testimonials Carousel ===== */
const track = $('.carousel-track');
const tCards = $$('.tcard', track);
const prev = $('.carousel-btn.prev');
const next = $('.carousel-btn.next');
const dotsWrap = $('#tDots');

let idx = 0;
tCards.forEach((_, i) => {
    const b = document.createElement('button');
    b.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(b);
});
function updateDots() {
    $$('.dots button', dotsWrap).forEach((d, i) => d.classList.toggle('active', i === idx));
}
function goTo(i) {
    idx = (i + tCards.length) % tCards.length;
    track.scrollTo({ left: idx * (track.clientWidth), behavior: 'smooth' });
    updateDots();
}
updateDots();
prev.addEventListener('click', () => goTo(idx - 1));
next.addEventListener('click', () => goTo(idx + 1));
let autoTimer = setInterval(() => goTo(idx + 1), 4000);
track.addEventListener('pointerenter', () => clearInterval(autoTimer));
track.addEventListener('pointerleave', () => autoTimer = setInterval(() => goTo(idx + 1), 4000));
window.addEventListener('resize', () => goTo(idx));

/* ===== Sticky CTA + Quote Modal ===== */
const cta = $('#sticky-cta');
const quoteModal = $('#quoteModal');
const quoteClose = $('.close-modal', quoteModal);

cta.addEventListener('click', () => quoteModal.showModal());
quoteClose.addEventListener('click', () => quoteModal.close());
$('#quoteForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thanks! We’ll email a quote shortly.');
    quoteModal.close();
});

/* ===== Newsletter Popup (exit intent + localStorage) ===== */
const newsDlg = $('#newsletter');
const newsClose = $('.close-modal', newsDlg);
const NEWS_KEY = 'ek_news_seen';
let newsShown = localStorage.getItem(NEWS_KEY);

function showNewsletter() { if (!newsShown) { newsDlg.showModal(); localStorage.setItem(NEWS_KEY, '1'); newsShown = true; } }
document.addEventListener('mouseout', (e) => {
    if (e.clientY <= 0) showNewsletter();
});
setTimeout(showNewsletter, 18000); // fallback after 18s
newsClose.addEventListener('click', () => newsDlg.close());
$('#newsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Subscribed! Check your inbox ✉️');
    newsDlg.close();
});

/* ===== Contact Form ===== */
$('#contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    e.target.reset();
});

/* ===== Live Analytics (JS only demo) ===== */
const liveVisitors = $('#liveVisitors');
const sessionTime = $('#sessionTime');
const convRate = $('#convRate');
let sec = 0, ctaClicks = 0, views = 1;
setInterval(() => {
    // random jitter for visitors
    const v = 18 + Math.floor(Math.random() * 22);
    liveVisitors.textContent = v;

    // session timer
    sec++;
    sessionTime.textContent = `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

    // fake conversion
    const rate = Math.min(18, (ctaClicks / (views || 1)) * 100 + Math.random() * 2).toFixed(1);
    convRate.textContent = `${rate}%`;
    addPoint(v);
}, 1000);
cta.addEventListener('click', () => { ctaClicks++; addPoint(60 + Math.random() * 15); });
window.addEventListener('scroll', () => { views += 0.02; });

/* Sparkline on canvas */
const canvas = $('#sparkline');
const ctx = canvas.getContext('2d');
const points = [];
function addPoint(val) {
    points.push(val);
    if (points.length > 120) points.shift();
    drawSpark();
}
function drawSpark() {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    // axes baseline
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, h - 28, w, 1);
    ctx.globalAlpha = 1;

    // normalize
    const max = Math.max(40, ...points);
    const min = Math.min(10, ...points);
    ctx.beginPath();
    points.forEach((p, i) => {
        const x = (i / (120 - 1)) * w;
        const y = h - ((p - min) / (max - min + 0.0001)) * (h - 30) - 10;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#8ab4ff';
    ctx.stroke();

    // fill gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(37,117,252,.35)');
    grad.addColorStop(1, 'rgba(37,117,252,0)');
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
}

/* ===== Newsletter year & misc ===== */
$('#year').textContent = new Date().getFullYear();

/* ===== Scroll-based Animations already handled by IO above ===== */

/* ===== AI Chatbot (rule-based) ===== */
const chatToggle = $('#chatToggle');
const chatClose = $('#chatClose');
const chatBot = $('#chatbot');
const chatLog = $('#chatLog');
const chatForm = $('#chatForm');
const chatText = $('#chatText');

chatToggle.addEventListener('click', () => {
    chatBot.style.display = (chatBot.style.display === 'flex' ? 'none' : 'flex');
    chatText.focus();
});
chatClose.addEventListener('click', () => chatBot.style.display = 'none');

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const txt = chatText.value.trim();
    if (!txt) return;
    addMsg(txt, 'user');
    chatText.value = '';
    setTimeout(() => addMsg(replyFor(txt), 'bot'), 300);
});
function addMsg(text, role = 'bot') {
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    div.textContent = text;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
}
function replyFor(q) {
    const s = q.toLowerCase();
    if (s.includes('price') || s.includes('pricing') || s.includes('cost')) {
        return 'Typical ranges: Reels ₹800–₹3,000, Long-form ₹4,000–₹20,000+, Ads ₹3,000–₹12,000. Share scope for a precise quote.';
    }
    if (s.includes('turnaround') || s.includes('delivery') || s.includes('time')) {
        return 'Reels: 24–48h. Long-form: 3–7 days. Urgent slots available with rush fee.';
    }
    if (s.includes('revisions')) {
        return 'We include 2 revision rounds free on all packages. Extra revisions at minimal cost.';
    }
    if (s.includes('portfolio') || s.includes('work')) {
        return 'Scroll to Portfolio and hover cards for live previews. Want custom samples? Drop a message in Contact.';
    }
    if (s.includes('contact') || s.includes('email')) {
        return 'Email: info@editkaro.in or use the Contact form. We typically respond within a few hours.';
    }
    if (s.includes('services')) {
        return 'We do reels, long-form edits, gaming montages, product ads, and professional color grading.';
    }
    return 'Got it! For quotes, click the ⚡ button or tell me your project length, platform, and style.';
}

/* ===== Newsletter lazy images/videos note ===== */
/* Images use loading="lazy"; portfolio videos are created on-demand via hover, saving bandwidth. */
