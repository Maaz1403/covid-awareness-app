/* ============================================================
   COVID AWARENESS APP — MAIN JAVASCRIPT
   Features: Live API, Charts, Symptom Checker, Dark Mode,
             Scroll Reveal, FAQ Filter, Hamburger Menu
   API: https://disease.sh (free, no API key needed)
   ============================================================ */

'use strict';

// ─── Constants ─────────────────────────────────────────────
const API_BASE = 'https://disease.sh/v3/covid-19';
const NUM_FORMAT = new Intl.NumberFormat('en-IN');

// ─── DOM Ready ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavbar();
  initScrollReveal();
  loadGlobalStats();
  loadCountries();
  loadTopCountriesChart();
  setupCountrySelector();
});

/* ============================================================
   1. DARK MODE TOGGLE
   ============================================================ */
function initTheme() {
  const btn = document.getElementById('themeToggle');
  const saved = localStorage.getItem('covidcare-theme') || 'light';
  setTheme(saved);

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  });
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('covidcare-theme', theme);
  const icon = document.querySelector('#themeToggle i');
  if (icon) icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

/* ============================================================
   2. NAVBAR — Scroll shadow + Hamburger
   ============================================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const icon = hamburger.querySelector('i');
    icon.className = navLinks.classList.contains('open') ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.querySelector('i').className = 'fa-solid fa-bars';
    });
  });
}

/* ============================================================
   3. SCROLL REVEAL — Intersection Observer
   ============================================================ */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ============================================================
   4. LOAD GLOBAL COVID STATS — disease.sh API
   ============================================================ */
async function loadGlobalStats() {
  try {
    const res = await fetch(`${API_BASE}/all`);
    if (!res.ok) throw new Error('API Error');
    const data = await res.json();
    updateStatCards(data);
    renderDonutChart(data);
    updateLastUpdated(data.updated);
  } catch (err) {
    console.error('Failed to load global stats:', err);
    showAPIError();
  }
}

function updateStatCards(data) {
  setText('totalCases', NUM_FORMAT.format(data.cases));
  setText('totalRecovered', NUM_FORMAT.format(data.recovered));
  setText('totalDeaths', NUM_FORMAT.format(data.deaths));
  setText('activeCases', NUM_FORMAT.format(data.active));
  setText('todayCases', `+${NUM_FORMAT.format(data.todayCases)} today`);
  setText('todayDeaths', `+${NUM_FORMAT.format(data.todayDeaths)} today`);
  setText('recoveryRate', `${((data.recovered / data.cases) * 100).toFixed(1)}% recovery rate`);
  setText('critical', `${NUM_FORMAT.format(data.critical)} critical`);
}

function updateLastUpdated(ts) {
  const el = document.getElementById('lastUpdated');
  if (!el) return;
  const d = new Date(ts);
  el.textContent = `Last updated: ${d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}`;
}

/* ============================================================
   5. DONUT CHART — Case Distribution
   ============================================================ */
let donutInstance = null;
function renderDonutChart(data) {
  const ctx = document.getElementById('donutChart');
  if (!ctx) return;
  if (donutInstance) donutInstance.destroy();

  donutInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Active', 'Recovered', 'Deaths'],
      datasets: [{
        data: [data.active, data.recovered, data.deaths],
        backgroundColor: ['#0077B6', '#2DC653', '#E63946'],
        borderWidth: 0,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 16, font: { size: 12, family: 'Inter' },
            color: getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#1A2E3F'
          }
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${NUM_FORMAT.format(ctx.parsed)} (${((ctx.parsed / data.cases) * 100).toFixed(1)}%)`
          }
        }
      }
    }
  });
}

/* ============================================================
   6. BAR CHART — Top 10 Countries
   ============================================================ */
let barInstance = null;
async function loadTopCountriesChart() {
  try {
    const res = await fetch(`${API_BASE}/countries?sort=cases`);
    if (!res.ok) throw new Error();
    const countries = await res.json();
    const top10 = countries.slice(0, 10);

    const ctx = document.getElementById('barChart');
    if (!ctx) return;
    if (barInstance) barInstance.destroy();

    barInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: top10.map(c => c.country),
        datasets: [{
          label: 'Total Cases',
          data: top10.map(c => c.cases),
          backgroundColor: 'rgba(0,119,182,0.75)',
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: ctx => ` ${NUM_FORMAT.format(ctx.parsed.x)} cases` }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(0,119,182,0.07)' },
            ticks: {
              font: { size: 11 },
              callback: v => v >= 1e6 ? (v / 1e6).toFixed(0) + 'M' : v
            }
          },
          y: { ticks: { font: { size: 11 } }, grid: { display: false } }
        }
      }
    });
  } catch (err) {
    console.error('Failed to load chart:', err);
  }
}

/* ============================================================
   7. COUNTRY SELECTOR
   ============================================================ */
async function loadCountries() {
  try {
    const res = await fetch(`${API_BASE}/countries?sort=cases`);
    if (!res.ok) return;
    const countries = await res.json();
    const select = document.getElementById('countrySelect');
    if (!select) return;

    // Restore saved country
    const saved = localStorage.getItem('covidcare-country') || 'all';

    countries.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.countryInfo.iso2 || c.country;
      opt.textContent = `${c.countryInfo.flag || ''} ${c.country}`;
      if (opt.value === saved) opt.selected = true;
      select.appendChild(opt);
    });

    if (saved !== 'all') {
      loadCountryStats(saved);
    }
  } catch (err) {
    console.error('Failed to load countries:', err);
  }
}

function setupCountrySelector() {
  const select = document.getElementById('countrySelect');
  if (!select) return;

  select.addEventListener('change', () => {
    const val = select.value;
    localStorage.setItem('covidcare-country', val);

    if (val === 'all') {
      loadGlobalStats();
    } else {
      loadCountryStats(val);
    }
  });
}

async function loadCountryStats(country) {
  try {
    const res = await fetch(`${API_BASE}/countries/${country}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    updateStatCards(data);
    renderDonutChart(data);
    updateLastUpdated(data.updated);
  } catch (err) {
    console.error(`Failed to load stats for ${country}:`, err);
  }
}

/* ============================================================
   8. SYMPTOM CHECKER
   ============================================================ */
window.runChecker = function () {
  const checkboxes = document.querySelectorAll('input[name="sym"]:checked');
  const contact = document.querySelector('input[name="contact"]:checked')?.value === 'yes';

  let score = 0;
  checkboxes.forEach(cb => { score += parseInt(cb.value); });
  if (contact) score += 3;

  let level, icon, msg, steps, cls;

  if (score === 0) {
    level = 'No Symptoms Detected'; icon = '😊'; cls = 'result-low';
    msg = 'You currently have no COVID-19 symptoms. Continue following preventive measures to stay safe.';
    steps = ['Maintain good hand hygiene', 'Wear a mask in crowded places', 'Stay updated with local guidelines', 'Monitor your health daily'];
  } else if (score <= 4) {
    level = 'Low Risk'; icon = '🟡'; cls = 'result-medium';
    msg = 'You have mild or few symptoms. Monitor your health closely. These could be common cold or allergy symptoms.';
    steps = ['Rest at home and stay hydrated', 'Monitor temperature twice daily', 'Avoid contact with elderly or vulnerable people', 'Consult a doctor if symptoms worsen', 'Consider getting a COVID test if symptoms persist'];
  } else if (score <= 8) {
    level = 'Moderate Risk'; icon = '🟠'; cls = 'result-medium';
    msg = 'You have multiple COVID-like symptoms. Please isolate and get tested as soon as possible.';
    steps = ['Isolate immediately from household members', 'Book a COVID test (RT-PCR or RAT)', 'Inform close contacts to monitor themselves', 'Call the COVID helpline: 1075', 'Drink plenty of fluids, rest well', 'Do NOT self-medicate with antibiotics'];
  } else {
    level = 'High Risk — Seek Medical Help'; icon = '🔴'; cls = 'result-high';
    msg = 'You have several high-risk symptoms. Please seek medical attention immediately. Do not delay.';
    steps = ['Call 112 or 1075 immediately', 'Do NOT travel in public transport', 'Isolate yourself in a separate room', 'Wear a mask even at home', 'Have someone monitor your oxygen levels', 'Get emergency medical evaluation without delay'];
  }

  const result = document.getElementById('checkerResult');
  const step1 = document.getElementById('checkerStep1');

  document.getElementById('resultIcon').textContent = icon;
  document.getElementById('resultLevel').textContent = level;
  document.getElementById('resultMsg').textContent = msg;

  const ul = document.getElementById('resultSteps');
  ul.innerHTML = steps.map(s => `<li>${s}</li>`).join('');

  result.className = `checker-result ${cls}`;
  step1.style.display = 'none';
  result.style.display = 'block';
};

window.resetChecker = function () {
  document.querySelectorAll('input[name="sym"]').forEach(cb => cb.checked = false);
  const noContact = document.querySelector('input[name="contact"][value="no"]');
  if (noContact) noContact.checked = true;
  document.getElementById('checkerStep1').style.display = 'block';
  document.getElementById('checkerResult').style.display = 'none';
};

/* ============================================================
   9. FAQ — Toggle + Search Filter
   ============================================================ */
window.toggleFAQ = function (el) {
  const wasOpen = el.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!wasOpen) el.classList.add('open');
};

window.filterFAQ = function () {
  const query = document.getElementById('faqSearch').value.toLowerCase();
  document.querySelectorAll('.faq-item').forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(query) ? 'block' : 'none';
  });
};

/* ============================================================
   10. UTILITY HELPERS
   ============================================================ */
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function showAPIError() {
  ['totalCases', 'totalRecovered', 'totalDeaths', 'activeCases'].forEach(id => {
    setText(id, 'N/A');
  });
  setText('lastUpdated', 'Could not load data — check internet connection');
}
