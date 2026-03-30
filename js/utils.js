/**
 * Crown Money Utility Functions
 * Australian-specific financial math and formatting
 */
const CrownUtils = (() => {

  // Format number as AUD currency
  function formatCurrency(num) {
    if (num === null || num === undefined || isNaN(num)) return '$0.00';
    const sign = num < 0 ? '-' : '';
    const abs = Math.abs(num);
    return sign + '$' + abs.toLocaleString('en-AU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  // Format as whole dollars
  function formatDollars(num) {
    if (num === null || num === undefined || isNaN(num)) return '$0';
    const sign = num < 0 ? '-' : '';
    const abs = Math.abs(num);
    return sign + '$' + Math.round(abs).toLocaleString('en-AU');
  }

  // Format percentage
  function formatPercent(num, decimals = 2) {
    if (isNaN(num)) return '0%';
    return num.toFixed(decimals) + '%';
  }

  // Format number with commas
  function formatNumber(num, decimals = 0) {
    if (isNaN(num)) return '0';
    return num.toLocaleString('en-AU', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  // PMT - Monthly payment for a loan
  // rate = monthly interest rate, nper = total months, pv = principal
  function pmt(rate, nper, pv) {
    if (rate === 0) return pv / nper;
    const x = Math.pow(1 + rate, nper);
    return (pv * rate * x) / (x - 1);
  }

  // Future Value
  function fv(rate, nper, pmtVal, pv = 0) {
    if (rate === 0) return -(pv + pmtVal * nper);
    const x = Math.pow(1 + rate, nper);
    return -(pv * x + pmtVal * ((x - 1) / rate));
  }

  // Present Value
  function pvCalc(rate, nper, pmtVal) {
    if (rate === 0) return -pmtVal * nper;
    const x = Math.pow(1 + rate, nper);
    return pmtVal * (1 - x) / (rate * x);
  }

  // IPMT - Interest portion of a payment
  function ipmt(rate, per, nper, pv) {
    const payment = pmt(rate, nper, pv);
    const balance = pv * Math.pow(1 + rate, per - 1) - payment * ((Math.pow(1 + rate, per - 1) - 1) / rate);
    return balance * rate;
  }

  // PPMT - Principal portion of a payment
  function ppmt(rate, per, nper, pv) {
    return pmt(rate, nper, pv) - ipmt(rate, per, nper, pv);
  }

  // Generate full amortization schedule
  function amortizationSchedule(principal, annualRate, years, extraPayment = 0) {
    const monthlyRate = annualRate / 100 / 12;
    const totalMonths = years * 12;
    const basePayment = pmt(monthlyRate, totalMonths, principal);
    const schedule = [];
    let balance = principal;
    let totalInterest = 0;
    let totalPrincipal = 0;

    for (let month = 1; month <= totalMonths && balance > 0; month++) {
      const interest = balance * monthlyRate;
      let principalPaid = basePayment - interest + extraPayment;
      if (principalPaid > balance) principalPaid = balance;
      balance -= principalPaid;
      if (balance < 0) balance = 0;
      totalInterest += interest;
      totalPrincipal += principalPaid;

      schedule.push({
        month,
        year: Math.ceil(month / 12),
        payment: interest + principalPaid,
        principal: principalPaid,
        interest,
        balance,
        totalInterest,
        totalPrincipal
      });

      if (balance <= 0) break;
    }

    return schedule;
  }

  // Parse number from input (strip $ and commas)
  function parseNum(val) {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    return parseFloat(String(val).replace(/[$,\s]/g, '')) || 0;
  }

  // Validate a numeric input
  function validateInput(input, min = 0, max = Infinity) {
    const val = parseNum(input.value);
    const isValid = !isNaN(val) && val >= min && val <= max;
    input.classList.toggle('invalid', !isValid);
    return isValid ? val : null;
  }

  // Get form values as object
  function getFormValues(formEl) {
    const data = {};
    formEl.querySelectorAll('input, select').forEach(el => {
      if (el.name) {
        if (el.type === 'number' || el.dataset.type === 'currency') {
          data[el.name] = parseNum(el.value);
        } else if (el.type === 'checkbox') {
          data[el.name] = el.checked;
        } else {
          data[el.name] = el.value;
        }
      }
    });
    return data;
  }

  // Populate form from saved data
  function populateForm(formEl, data) {
    if (!data) return;
    Object.entries(data).forEach(([key, val]) => {
      const el = formEl.querySelector(`[name="${key}"]`);
      if (!el) return;
      if (el.type === 'checkbox') {
        el.checked = !!val;
      } else {
        el.value = val;
      }
    });
  }

  // Generate years/months text
  function formatDuration(months) {
    const y = Math.floor(months / 12);
    const m = months % 12;
    if (y === 0) return `${m} month${m !== 1 ? 's' : ''}`;
    if (m === 0) return `${y} year${y !== 1 ? 's' : ''}`;
    return `${y} yr${y !== 1 ? 's' : ''} ${m} mo`;
  }

  // Crown Money ad HTML
  function adBanner() {
    return `<div class="crown-ad">
      This calculator is brought to you by <a href="https://crownmoney.com.au" target="_blank" class="crown-ad-brand">CrownMoney.com.au</a> — helping hardworking Australians pay off their home loan sooner and save thousands in interest.
    </div>`;
  }

  // Debounce
  function debounce(fn, ms = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }

  return {
    formatCurrency, formatDollars, formatPercent, formatNumber,
    pmt, fv, pvCalc, ipmt, ppmt, amortizationSchedule,
    parseNum, validateInput, getFormValues, populateForm,
    formatDuration, adBanner, debounce
  };
})();
