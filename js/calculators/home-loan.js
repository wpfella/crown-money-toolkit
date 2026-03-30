/**
 * Home Loan Calculator
 */
function getHomeLoanHTML() {
  return `
    <div class="page-header">
      <h2>&#x1F3E1; Home Loan Calculator</h2>
      <p class="page-desc">Calculate your monthly repayments, total interest, and view a full amortization schedule.</p>
    </div>

    <div class="calc-form">
      <h3>Loan Details</h3>
      <div class="form-row">
        <div class="form-group">
          <label>Property Price</label>
          <div class="input-prefix"><span class="prefix">$</span>
            <input type="number" name="propertyPrice" id="hl-price" value="650000" min="0" step="1000">
          </div>
        </div>
        <div class="form-group">
          <label>Deposit</label>
          <div class="input-prefix"><span class="prefix">$</span>
            <input type="number" name="deposit" id="hl-deposit" value="130000" min="0" step="1000">
          </div>
          <div class="form-hint" id="hl-lvr-hint">LVR: 80%</div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Interest Rate (% p.a.)</label>
          <div class="input-suffix"><span class="suffix">%</span>
            <input type="number" name="interestRate" id="hl-rate" value="6.20" min="0" max="20" step="0.01">
          </div>
        </div>
        <div class="form-group">
          <label>Loan Term</label>
          <select name="loanTerm" id="hl-term">
            <option value="10">10 years</option>
            <option value="15">15 years</option>
            <option value="20">20 years</option>
            <option value="25">25 years</option>
            <option value="30" selected>30 years</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Repayment Frequency</label>
          <select name="frequency" id="hl-freq">
            <option value="monthly" selected>Monthly</option>
            <option value="fortnightly">Fortnightly</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
        <div class="form-group">
          <label>Loan Type</label>
          <select name="loanType" id="hl-type">
            <option value="pi" selected>Principal & Interest</option>
            <option value="io">Interest Only</option>
          </select>
        </div>
      </div>

      <div class="calc-actions">
        <button class="btn btn-primary btn-lg" id="hl-calculate">Calculate Repayments</button>
        <button class="btn btn-secondary" id="hl-reset">Reset</button>
      </div>
    </div>

    <div class="results-section" id="hl-results">
      <div class="stat-grid" id="hl-stats"></div>

      <div class="chart-container">
        <h4>Loan Balance Over Time</h4>
        <div style="height:300px;"><canvas id="hl-chart"></canvas></div>
      </div>

      <div class="chart-container mt-lg">
        <h4>Payment Breakdown</h4>
        <div style="height:250px;"><canvas id="hl-pie"></canvas></div>
      </div>

      <div class="recommendations" id="hl-recommendations"></div>

      <div class="card mt-lg">
        <div class="card-header">
          <span class="card-title">Amortization Schedule</span>
          <div class="btn-group">
            <button class="btn btn-sm btn-secondary" id="hl-toggle-amort">Show Yearly</button>
          </div>
        </div>
        <div class="amort-table" id="hl-amort-table"></div>
      </div>

      <div class="export-bar">
        <span>Export your results:</span>
        <button class="btn btn-sm btn-outline" id="hl-export-csv">&#x1F4C4; CSV</button>
        <button class="btn btn-sm btn-outline" id="hl-export-pdf">&#x1F4D1; PDF</button>
        <button class="btn btn-sm btn-outline" id="hl-share">&#x1F4E4; Share</button>
      </div>
    </div>

    ${CrownUtils.adBanner()}
  `;
}

CrownCalc.HomeLoan = (() => {
  let schedule = [];
  let showYearly = false;

  function init() {
    document.getElementById('hl-calculate').addEventListener('click', calculate);
    document.getElementById('hl-reset').addEventListener('click', reset);

    // LVR hint update
    ['hl-price', 'hl-deposit'].forEach(id => {
      document.getElementById(id).addEventListener('input', updateLVR);
    });

    loadSaved();
  }

  function updateLVR() {
    const price = CrownUtils.parseNum(document.getElementById('hl-price').value);
    const deposit = CrownUtils.parseNum(document.getElementById('hl-deposit').value);
    if (price > 0) {
      const lvr = ((price - deposit) / price * 100).toFixed(1);
      document.getElementById('hl-lvr-hint').textContent = `LVR: ${lvr}%`;
    }
  }

  function calculate() {
    const price = CrownUtils.parseNum(document.getElementById('hl-price').value);
    const deposit = CrownUtils.parseNum(document.getElementById('hl-deposit').value);
    const rate = parseFloat(document.getElementById('hl-rate').value);
    const term = parseInt(document.getElementById('hl-term').value);
    const freq = document.getElementById('hl-freq').value;
    const type = document.getElementById('hl-type').value;

    const loanAmount = price - deposit;
    if (loanAmount <= 0 || rate <= 0) return;

    const monthlyRate = rate / 100 / 12;
    const totalMonths = term * 12;

    let monthlyPayment;
    if (type === 'pi') {
      monthlyPayment = CrownUtils.pmt(monthlyRate, totalMonths, loanAmount);
    } else {
      monthlyPayment = loanAmount * monthlyRate; // Interest only
    }

    // Generate schedule
    schedule = CrownUtils.amortizationSchedule(loanAmount, rate, term);
    const totalInterest = schedule.length > 0 ? schedule[schedule.length - 1].totalInterest : 0;
    const totalPayments = loanAmount + totalInterest;

    // Frequency conversion
    let displayPayment = monthlyPayment;
    let freqLabel = 'Monthly';
    if (freq === 'fortnightly') {
      displayPayment = monthlyPayment * 12 / 26;
      freqLabel = 'Fortnightly';
    } else if (freq === 'weekly') {
      displayPayment = monthlyPayment * 12 / 52;
      freqLabel = 'Weekly';
    }

    // LVR
    const lvr = (loanAmount / price) * 100;

    // Stats
    document.getElementById('hl-stats').innerHTML = `
      <div class="stat-card highlight">
        <div class="stat-icon">&#x1F4B3;</div>
        <div class="stat-value">${CrownUtils.formatCurrency(displayPayment)}</div>
        <div class="stat-label">${freqLabel} Repayment</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">&#x1F3E6;</div>
        <div class="stat-value">${CrownUtils.formatDollars(loanAmount)}</div>
        <div class="stat-label">Loan Amount</div>
      </div>
      <div class="stat-card danger">
        <div class="stat-icon">&#x1F4C9;</div>
        <div class="stat-value">${CrownUtils.formatDollars(totalInterest)}</div>
        <div class="stat-label">Total Interest</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">&#x1F4B0;</div>
        <div class="stat-value">${CrownUtils.formatDollars(totalPayments)}</div>
        <div class="stat-label">Total Repayments</div>
      </div>
    `;

    // Charts
    const yearlyData = [];
    for (let y = 1; y <= term; y++) {
      const idx = Math.min(y * 12, schedule.length) - 1;
      if (idx >= 0) yearlyData.push(schedule[idx]);
    }

    CrownCharts.line('hl-chart',
      yearlyData.map(d => `Year ${d.year}`),
      [
        { label: 'Remaining Balance', data: yearlyData.map(d => Math.round(d.balance)), fill: true },
        { label: 'Total Interest Paid', data: yearlyData.map(d => Math.round(d.totalInterest)), fill: true }
      ]
    );

    CrownCharts.doughnut('hl-pie',
      ['Principal', 'Interest'],
      [Math.round(loanAmount), Math.round(totalInterest)],
      { colors: ['#27AE60', '#E74C3C'] }
    );

    // Recommendations
    generateRecommendations(loanAmount, rate, term, lvr, totalInterest);

    // Amortization table
    renderAmortTable();

    // Export handlers
    document.getElementById('hl-export-csv').onclick = () => exportCSV();
    document.getElementById('hl-export-pdf').onclick = () => exportPDF();
    document.getElementById('hl-share').onclick = () => shareResults(displayPayment, loanAmount, totalInterest, freqLabel);
    document.getElementById('hl-toggle-amort').onclick = () => {
      showYearly = !showYearly;
      document.getElementById('hl-toggle-amort').textContent = showYearly ? 'Show Monthly' : 'Show Yearly';
      renderAmortTable();
    };

    // Show results
    document.getElementById('hl-results').classList.add('visible');

    // Update chat context
    CrownChat.setCalcContext('Home Loan', {
      loanAmount: CrownUtils.formatDollars(loanAmount),
      interestRate: rate + '%',
      term: term + ' years',
      monthlyPayment: CrownUtils.formatCurrency(monthlyPayment),
      totalInterest: CrownUtils.formatDollars(totalInterest),
      lvr: lvr.toFixed(1) + '%'
    });

    // Save inputs
    saveInputs();
  }

  function generateRecommendations(loan, rate, term, lvr, totalInterest) {
    const recs = [];

    if (lvr > 80) {
      recs.push({ icon: '&#x26A0;', text: `Your LVR is ${lvr.toFixed(1)}% — you may need to pay Lenders Mortgage Insurance (LMI). Consider saving a larger deposit to get below 80% LVR and avoid this extra cost.` });
    }

    const extraPayment = CrownUtils.pmt(rate / 100 / 12, term * 12, loan) * 0.1; // 10% extra
    const scheduleWithExtra = CrownUtils.amortizationSchedule(loan, rate, term, extraPayment);
    const savedMonths = (term * 12) - scheduleWithExtra.length;
    const savedInterest = totalInterest - (scheduleWithExtra.length > 0 ? scheduleWithExtra[scheduleWithExtra.length - 1].totalInterest : 0);

    if (savedMonths > 0) {
      recs.push({ icon: '&#x1F4A1;', text: `By adding just ${CrownUtils.formatCurrency(extraPayment)} extra per month (10% more), you could pay off your loan ${CrownUtils.formatDuration(savedMonths)} sooner and save ${CrownUtils.formatDollars(savedInterest)} in interest!` });
    }

    if (rate > AU.RATES.AVG_VARIABLE_HOME_LOAN + 0.3) {
      recs.push({ icon: '&#x1F50D;', text: `Your rate of ${rate}% is above the market average of ${AU.RATES.AVG_VARIABLE_HOME_LOAN}%. It might be worth shopping around or negotiating with your lender for a better rate.` });
    }

    recs.push({ icon: '&#x1F451;', text: `Visit <strong>CrownMoney.com.au</strong> for more tips on paying off your home loan sooner and saving thousands in interest.` });

    document.getElementById('hl-recommendations').innerHTML = `
      <h4>&#x1F4A1; Personalised Recommendations</h4>
      ${recs.map(r => `<div class="recommendation-item"><span class="rec-icon">${r.icon}</span><span>${r.text}</span></div>`).join('')}
    `;
  }

  function renderAmortTable() {
    let rows;
    if (showYearly) {
      const yearly = {};
      schedule.forEach(s => {
        if (!yearly[s.year]) yearly[s.year] = { year: s.year, principal: 0, interest: 0, payment: 0, balance: s.balance };
        yearly[s.year].principal += s.principal;
        yearly[s.year].interest += s.interest;
        yearly[s.year].payment += s.payment;
        yearly[s.year].balance = s.balance;
      });
      rows = Object.values(yearly);
    } else {
      rows = schedule;
    }

    const label = showYearly ? 'Year' : 'Month';
    let html = `<table><thead><tr>
      <th>${label}</th><th>Payment</th><th>Principal</th><th>Interest</th><th>Balance</th>
    </tr></thead><tbody>`;

    rows.forEach(r => {
      html += `<tr>
        <td>${showYearly ? r.year : r.month}</td>
        <td class="currency">${CrownUtils.formatCurrency(r.payment)}</td>
        <td class="currency">${CrownUtils.formatCurrency(r.principal)}</td>
        <td class="currency">${CrownUtils.formatCurrency(r.interest)}</td>
        <td class="currency">${CrownUtils.formatCurrency(r.balance)}</td>
      </tr>`;
    });

    html += '</tbody></table>';
    document.getElementById('hl-amort-table').innerHTML = html;
  }

  function exportCSV() {
    const headers = ['Month', 'Payment', 'Principal', 'Interest', 'Balance'];
    const rows = schedule.map(s => [s.month, s.payment.toFixed(2), s.principal.toFixed(2), s.interest.toFixed(2), s.balance.toFixed(2)]);
    CrownExport.toCSV('Home_Loan_Schedule', headers, rows);
  }

  function exportPDF() {
    const headers = ['Month', 'Payment', 'Principal', 'Interest', 'Balance'];
    // Export yearly summary for PDF
    const yearly = {};
    schedule.forEach(s => {
      if (!yearly[s.year]) yearly[s.year] = { year: s.year, principal: 0, interest: 0, payment: 0, balance: s.balance };
      yearly[s.year].principal += s.principal;
      yearly[s.year].interest += s.interest;
      yearly[s.year].payment += s.payment;
      yearly[s.year].balance = s.balance;
    });
    const rows = Object.values(yearly).map(r => [
      'Year ' + r.year,
      CrownUtils.formatCurrency(r.payment),
      CrownUtils.formatCurrency(r.principal),
      CrownUtils.formatCurrency(r.interest),
      CrownUtils.formatCurrency(r.balance)
    ]);
    CrownExport.toPDF('Home Loan Calculator', ['Year', 'Payment', 'Principal', 'Interest', 'Balance'], rows, 'hl-chart');
  }

  function shareResults(payment, loan, interest, freq) {
    const text = `Home Loan Summary:\n${freq} repayment: ${CrownUtils.formatCurrency(payment)}\nLoan: ${CrownUtils.formatDollars(loan)}\nTotal interest: ${CrownUtils.formatDollars(interest)}`;
    CrownExport.share('Home Loan Calculator', text);
  }

  async function saveInputs() {
    const data = {
      price: document.getElementById('hl-price').value,
      deposit: document.getElementById('hl-deposit').value,
      rate: document.getElementById('hl-rate').value,
      term: document.getElementById('hl-term').value,
      freq: document.getElementById('hl-freq').value,
      type: document.getElementById('hl-type').value
    };
    await CrownStorage.set('home_loan_inputs', data);
  }

  async function loadSaved() {
    const data = await CrownStorage.get('home_loan_inputs');
    if (data) {
      if (data.price) document.getElementById('hl-price').value = data.price;
      if (data.deposit) document.getElementById('hl-deposit').value = data.deposit;
      if (data.rate) document.getElementById('hl-rate').value = data.rate;
      if (data.term) document.getElementById('hl-term').value = data.term;
      if (data.freq) document.getElementById('hl-freq').value = data.freq;
      if (data.type) document.getElementById('hl-type').value = data.type;
      updateLVR();
    }
  }

  function reset() {
    document.getElementById('hl-price').value = 650000;
    document.getElementById('hl-deposit').value = 130000;
    document.getElementById('hl-rate').value = 6.20;
    document.getElementById('hl-term').value = 30;
    document.getElementById('hl-freq').value = 'monthly';
    document.getElementById('hl-type').value = 'pi';
    document.getElementById('hl-results').classList.remove('visible');
    updateLVR();
    CrownStorage.remove('home_loan_inputs');
  }

  return { init };
})();
