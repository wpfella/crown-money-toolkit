/**
 * Crown Money SPA Router
 * Hash-based page loader with calculator initialization
 */
const CrownRouter = (() => {
  const routes = {
    '':                    { title: 'Dashboard',             init: null },
    'home-loan':           { title: 'Home Loan Calculator',  init: 'HomeLoan' },
    'mortgage-comparison': { title: 'Mortgage Comparison',   init: 'MortgageComparison' },
    'extra-repayment':     { title: 'Extra Repayments',      init: 'ExtraRepayment' },
    'offset-account':      { title: 'Offset Account',        init: 'OffsetAccount' },
    'stamp-duty':          { title: 'Stamp Duty Calculator', init: 'StampDuty' },
    'rent-vs-buy':         { title: 'Rent vs Buy',           init: 'RentVsBuy' },
    'refinance':           { title: 'Refinance Calculator',  init: 'Refinance' },
    'budget-planner':      { title: 'Budget Planner',        init: 'BudgetPlanner' },
    'tax-estimator':       { title: 'Tax Estimator',         init: 'TaxEstimator' },
    'savings-goal':        { title: 'Savings Goal',          init: 'SavingsGoal' },
    'fhog':                { title: 'First Home Owner Grant', init: 'FHOG' },
    'investment-growth':   { title: 'Investment Growth',     init: 'InvestmentGrowth' },
    'compound-interest':   { title: 'Compound Interest',     init: 'CompoundInterest' },
    'debt-snowball':       { title: 'Debt Payoff Planner',   init: 'DebtSnowball' },
    'settings':            { title: 'Settings',              init: 'Settings' }
  };

  let currentPage = '';

  function getPage() {
    return window.location.hash.replace('#', '') || '';
  }

  async function navigate(page) {
    if (page === undefined) page = getPage();

    const route = routes[page];
    if (!route) {
      page = '';
    }

    currentPage = page;

    // Update active nav
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });

    // Destroy old charts
    CrownCharts.destroyAll();

    // Load page content
    const content = document.getElementById('content');
    const contentInner = content.querySelector('.content-inner') || content;

    try {
      const html = getPageHTML(page);
      contentInner.innerHTML = html;

      // Initialize calculator
      if (route && route.init && window.CrownCalc && window.CrownCalc[route.init]) {
        window.CrownCalc[route.init].init();
      }

      // Update chat context
      if (route && route.init) {
        CrownChat.setCalcContext(route.title, null);
      } else {
        CrownChat.setCalcContext(null, null);
      }
      CrownChat.updateContextBadge();

      // Scroll to top
      content.scrollTop = 0;
    } catch (err) {
      contentInner.innerHTML = `<div class="card"><h3>Error Loading Page</h3><p>${err.message}</p></div>`;
    }
  }

  function init() {
    // Nav click handlers
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        window.location.hash = page;
      });
    });

    // Settings button
    document.getElementById('btnSettings').addEventListener('click', () => {
      window.location.hash = 'settings';
    });

    // Hash change
    window.addEventListener('hashchange', () => navigate());

    // Search
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', CrownUtils.debounce((e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        document.querySelectorAll('.nav-item').forEach(item => item.style.display = '');
        document.querySelectorAll('.nav-group').forEach(g => g.style.display = '');
        return;
      }
      document.querySelectorAll('.nav-item').forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(q) ? '' : 'none';
      });
    }, 200));

    // Initial load
    navigate();
  }

  function getCurrentPage() {
    return currentPage;
  }

  return { init, navigate, getCurrentPage };
})();
