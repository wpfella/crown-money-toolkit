/**
 * Offset Account Calculator
 */
function getOffsetAccountHTML() {
  return `
    <div class="page-header">
      <h2>&#x1F3E6; Offset Account Calculator</h2>
      <p class="page-desc">See how much you can save by keeping money in an offset account linked to your mortgage.</p>
    </div>

    <div class="calc-form">
      <h3>Loan & Offset Details</h3>
      <div class="form-row">
        <div class="form-group">
          <label>Loan Balance</label>
          <div class="input-prefix"><span class="prefix">$</span>
            <input type="number" id="oa-balance" value="500000" min="0" step="1000">
          </div>
        </div>
        <div class="form-group">
          <label>Interest Rate (% p.a.)</label>
          <div class="input-suffix"><span class="suffix">%</span>
            <input type="number" id="oa-rate" value="6.20" min="0" max="20" step="0.01">
          </div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Remaining Term (years)</label>
          <select id="oa-term">
            <option value="10">10 years</option>
            <option value="15">15 years</option>
            <option value="20">20 years</option>
            <option value="25" selected>25 years</option>
            <option value="30">30 years</option>
          </select>
        </div>
        <div class="form-group">
          <label>Offset Account Balance</label>
          <div class="input-prefix"><span class="prefix">$</span>
            <input type="number" id="oa-offset" value="50000" min="0" step="1000">
          </div>
        </div>
      </div>

      <div class="calc-actions">
        <button class="btn btn-primary btn-lg" id="oa-calculate">Calculate Savings</button>
      </div>
    </div>

    <div class="results-section" id="oa-results">
      <div class="stat-grid" id="oa-stats"></div>
      <div class="chart-container">
        <h4>Balance Comparison</h4>
        <div style="height:300px;"><canvas id="oa-chart"></canvas></div>
      </div>
      <div class="recommendations" id="oa-recommendations"></div>
      <div class="export-bar">
        <span>Export:</span>
        <button class="btn btn-sm btn-outline" id="oa-export-pdf">&#x1F4D1; PDF</button>
        <button class="btn btn-sm btn-outline" id="oa-share">&#x1F4E4; Share</button>
      </div>
    </div>
    ${CrownUtils.adBanner()}
  `;
}

CrownCalc.OffsetAccount = (() => {
  function init() {
    document.getElementById('oa-calculate').addEventListener('click', calculate);
  }

  function calculate() {
    const balance = CrownUtils.parseNum(document.getElementById('oa-balance').value);
    const rate = parseFloat(document.getElementById('oa-rate').value);
    const term = parseInt(document.getElementById('oa-term').value);
    const offset = CrownUtils.parseNum(document.getElementById('oa-offset').value);

    if (balance <= 0 || rate <= 0) return;

    // Without offset
    const scheduleNoOffset = CrownUtils.amortizationSchedule(balance, rate, term);
    // With offset — effective balance is reduced
    const effectiveBalance = Math.max(0, balance - offset);
    const monthlyRate = rate / 100 / 12;
    const totalMonths = term * 12;
    const payment = CrownUtils.pmt(monthlyRate, totalMonths, balance); // Same payment

    // Simulate with offset
    let bal = balance;
    let totalInterestOffset = 0;
    let monthsOffset = 0;
    for (let m = 1; m <= totalMonths && bal > 0; m++) {
      const interestBal = Math.max(0, bal - offset);
      const interest = interestBal * monthlyRate;
      const principal = payment - interest;
      bal -= principal;
      if (bal < 0) bal = 0;
      totalInterestOffset += interest;
      monthsOffset = m;
      if (bal <= 0) break;
    }

    const noOffsetInterest = scheduleNoOffset[scheduleNoOffset.length - 1]?.totalInterest || 0;
    const interestSaved = noOffsetInterest - totalInterestOffset;
    const timeSaved = scheduleNoOffset.length - monthsOffset;

    document.getElementById('oa-stats').innerHTML = `
      <div class="stat-card highlight">
        <div class="stat-icon">&#x1F4B0;</div>
        <div class="stat-value">${CrownUtils.formatDollars(interestSaved)}</div>
        <div class="stat-label">Interest Saved</div>
      </div>
      <div class="stat-card success">
        <div class="stat-icon">&#x23F1;</div>
        <div class="stat-value">${CrownUtils.formatDuration(timeSaved)}</div>
        <div class="stat-label">Time Saved</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">&#x1F4B5;</div>
        <div class="stat-value">${CrownUtils.formatDollars(offset * rate / 100)}</div>
        <div class="stat-label">Annual Interest Saving</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">&#x1F3E6;</div>
        <div class="stat-value">${CrownUtils.formatDollars(totalInterestOffset)}</div>
        <div class="stat-label">Total Interest (with offset)</div>
      </div>
    `;

    // Chart - yearly balances
    const labels = [];
    const noOffsetData = [];
    const withOffsetData = [];
    for (let y = 0; y <= term; y++) {
      labels.push(`Year ${y}`);
      if (y === 0) {
        noOffsetData.push(balance);
        withOffsetData.push(balance);
      } else {
        const idx = Math.min(y * 12, scheduleNoOffset.length) - 1;
        noOffsetData.push(idx >= 0 ? Math.round(scheduleNoOffset[idx].balance) : 0);
        // Approximate offset balance
        withOffsetData.push(Math.max(0, Math.round(noOffsetData[y] - interestSaved * (y / term))));
      }
    }

    CrownCharts.line('oa-chart', labels, [
      { label: 'Without Offset', data: noOffsetData, borderColor: '#E74C3C' },
      { label: 'With Offset', data: withOffsetData, borderColor: '#27AE60' }
    ]);

    const recs = [
      { icon: '&#x1F4A1;', text: `Your ${CrownUtils.formatDollars(offset)} offset saves ${CrownUtils.formatDollars(interestSaved)} in interest — that\'s like earning ${rate}% tax-free on your savings!` },
      { icon: '&#x1F4B0;', text: `Every extra $10,000 in your offset saves approximately ${CrownUtils.formatDollars(10000 * rate / 100)} per year in interest.` },
      { icon: '&#x1F451;', text: 'Visit <strong>CrownMoney.com.au</strong> for tips on maximising your offset account.' }
    ];

    document.getElementById('oa-recommendations').innerHTML = `
      <h4>&#x1F4A1; Offset Tips</h4>
      ${recs.map(r => `<div class="recommendation-item"><span class="rec-icon">${r.icon}</span><span>${r.text}</span></div>`).join('')}
    `;

    document.getElementById('oa-export-pdf').onclick = () => {
      CrownExport.toPDF('Offset Account Analysis', ['Item', 'Value'], [
        ['Loan Balance', CrownUtils.formatDollars(balance)],
        ['Offset Balance', CrownUtils.formatDollars(offset)],
        ['Interest Saved', CrownUtils.formatDollars(interestSaved)],
        ['Time Saved', CrownUtils.formatDuration(timeSaved)]
      ], 'oa-chart');
    };
    document.getElementById('oa-share').onclick = () => {
      CrownExport.share('Offset Account', `My ${CrownUtils.formatDollars(offset)} offset account saves ${CrownUtils.formatDollars(interestSaved)} on my mortgage!`);
    };

    document.getElementById('oa-results').classList.add('visible');
  }

  return { init };
})();
