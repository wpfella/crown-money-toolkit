/**
 * Refinance Calculator
 */
function getRefinanceHTML() {
  return `
    <div class="page-header">
      <h2>&#x1F504; Refinance Calculator</h2>
      <p class="page-desc">See if refinancing your home loan could save you money.</p>
    </div>

    <div class="comparison-grid">
      <div class="calc-form">
        <h3>Current Loan</h3>
        <div class="form-group">
          <label>Remaining Balance</label>
          <div class="input-prefix"><span class="prefix">$</span>
            <input type="number" id="rf-current-balance" value="450000" min="0" step="1000">
          </div>
        </div>
        <div class="form-group">
          <label>Current Interest Rate (%)</label>
          <div class="input-suffix"><span class="suffix">%</span>
            <input type="number" id="rf-current-rate" value="6.50" min="0" max="20" step="0.01">
          </div>
        </div>
        <div class="form-group">
          <label>Remaining Term (years)</label>
          <input type="number" id="rf-current-term" value="25" min="1" max="40">
        </div>
      </div>

      <div class="calc-form">
        <h3>New Loan</h3>
        <div class="form-group">
          <label>New Interest Rate (%)</label>
          <div class="input-suffix"><span class="suffix">%</span>
            <input type="number" id="rf-new-rate" value="5.80" min="0" max="20" step="0.01">
          </div>
        </div>
        <div class="form-group">
          <label>New Loan Term (years)</label>
          <input type="number" id="rf-new-term" value="25" min="1" max="40">
        </div>
        <div class="form-group">
          <label>Switching Costs</label>
          <div class="input-prefix"><span class="prefix">$</span>
            <input type="number" id="rf-costs" value="2000" min="0" step="100">
          </div>
          <div class="form-hint">Discharge, application, valuation fees</div>
        </div>
      </div>
    </div>

    <div style="text-align:center;margin:24px 0;">
      <button class="btn btn-primary btn-lg" id="rf-calculate">Calculate Savings</button>
    </div>

    <div class="results-section" id="rf-results">
      <div class="stat-grid" id="rf-stats"></div>
      <div class="chart-container">
        <h4>Interest Paid: Current vs Refinanced</h4>
        <div style="height:300px;"><canvas id="rf-chart"></canvas></div>
      </div>
      <div class="recommendations" id="rf-recommendations"></div>
      <div class="export-bar">
        <span>Export:</span>
        <button class="btn btn-sm btn-outline" id="rf-export-pdf">&#x1F4D1; PDF</button>
        <button class="btn btn-sm btn-outline" id="rf-share">&#x1F4E4; Share</button>
      </div>
    </div>
    ${CrownUtils.adBanner()}
  `;
}

CrownCalc.Refinance = (() => {
  function init() {
    document.getElementById('rf-calculate').addEventListener('click', calculate);
  }

  function calculate() {
    const balance = CrownUtils.parseNum(document.getElementById('rf-current-balance').value);
    const currentRate = parseFloat(document.getElementById('rf-current-rate').value);
    const currentTerm = parseInt(document.getElementById('rf-current-term').value);
    const newRate = parseFloat(document.getElementById('rf-new-rate').value);
    const newTerm = parseInt(document.getElementById('rf-new-term').value);
    const costs = CrownUtils.parseNum(document.getElementById('rf-costs').value);

    if (balance <= 0) return;

    const currentMonthly = CrownUtils.pmt(currentRate / 100 / 12, currentTerm * 12, balance);
    const newMonthly = CrownUtils.pmt(newRate / 100 / 12, newTerm * 12, balance);
    const monthlySaving = currentMonthly - newMonthly;

    const currentTotalInterest = (currentMonthly * currentTerm * 12) - balance;
    const newTotalInterest = (newMonthly * newTerm * 12) - balance;
    const interestSaving = currentTotalInterest - newTotalInterest - costs;

    const breakEvenMonths = monthlySaving > 0 ? Math.ceil(costs / monthlySaving) : Infinity;

    document.getElementById('rf-stats').innerHTML = `
      <div class="stat-card highlight">
        <div class="stat-icon">&#x1F4B0;</div>
        <div class="stat-value">${CrownUtils.formatDollars(interestSaving)}</div>
        <div class="stat-label">Net Lifetime Saving</div>
      </div>
      <div class="stat-card success">
        <div class="stat-icon">&#x1F4B3;</div>
        <div class="stat-value">${CrownUtils.formatCurrency(monthlySaving)}</div>
        <div class="stat-label">Monthly Saving</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">&#x23F1;</div>
        <div class="stat-value">${breakEvenMonths < 600 ? CrownUtils.formatDuration(breakEvenMonths) : 'N/A'}</div>
        <div class="stat-label">Break-Even Point</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">&#x1F4B8;</div>
        <div class="stat-value">${CrownUtils.formatDollars(costs)}</div>
        <div class="stat-label">Switching Costs</div>
      </div>
    `;

    // Chart
    const currentSchedule = CrownUtils.amortizationSchedule(balance, currentRate, currentTerm);
    const newSchedule = CrownUtils.amortizationSchedule(balance, newRate, newTerm);

    const maxYears = Math.max(currentTerm, newTerm);
    const labels = [];
    const currentData = [];
    const newData = [];

    for (let y = 0; y <= maxYears; y++) {
      labels.push(`Year ${y}`);
      const ci = y > 0 && y * 12 <= currentSchedule.length ? currentSchedule[y * 12 - 1].totalInterest : (y === 0 ? 0 : currentTotalInterest);
      const ni = y > 0 && y * 12 <= newSchedule.length ? newSchedule[y * 12 - 1].totalInterest : (y === 0 ? 0 : newTotalInterest);
      currentData.push(Math.round(ci));
      newData.push(Math.round(ni));
    }

    CrownCharts.line('rf-chart', labels, [
      { label: `Current (${currentRate}%)`, data: currentData, borderColor: '#E74C3C' },
      { label: `Refinanced (${newRate}%)`, data: newData, borderColor: '#27AE60' }
    ]);

    const worthIt = interestSaving > 0;
    const recs = [];
    if (worthIt) {
      recs.push({ icon: '&#x2705;', text: `<strong>Refinancing looks worthwhile!</strong> You\'ll save ${CrownUtils.formatDollars(interestSaving)} over the life of the loan after accounting for ${CrownUtils.formatDollars(costs)} in switching costs.` });
      recs.push({ icon: '&#x23F1;', text: `You\'ll break even on switching costs in ${CrownUtils.formatDuration(breakEvenMonths)}.` });
    } else {
      recs.push({ icon: '&#x26A0;', text: 'Refinancing may not save you money in this scenario. Consider negotiating a rate cut with your current lender instead.' });
    }
    if (monthlySaving > 100) {
      recs.push({ icon: '&#x1F4A1;', text: `If you keep paying the old amount (${CrownUtils.formatCurrency(currentMonthly)}), the extra ${CrownUtils.formatCurrency(monthlySaving)} goes toward principal — paying off your loan even faster!` });
    }
    recs.push({ icon: '&#x1F451;', text: 'Visit <strong>CrownMoney.com.au</strong> for refinancing tips and lender comparisons.' });

    document.getElementById('rf-recommendations').innerHTML = `
      <h4>&#x1F4A1; Refinance Analysis</h4>
      ${recs.map(r => `<div class="recommendation-item"><span class="rec-icon">${r.icon}</span><span>${r.text}</span></div>`).join('')}
    `;

    document.getElementById('rf-export-pdf').onclick = () => {
      CrownExport.toPDF('Refinance Analysis', ['', 'Current', 'Refinanced'], [
        ['Balance', CrownUtils.formatDollars(balance), CrownUtils.formatDollars(balance)],
        ['Rate', currentRate + '%', newRate + '%'],
        ['Monthly', CrownUtils.formatCurrency(currentMonthly), CrownUtils.formatCurrency(newMonthly)],
        ['Total Interest', CrownUtils.formatDollars(currentTotalInterest), CrownUtils.formatDollars(newTotalInterest)],
        ['Net Saving', '', CrownUtils.formatDollars(interestSaving)]
      ], 'rf-chart');
    };
    document.getElementById('rf-share').onclick = () => {
      CrownExport.share('Refinance', `Refinancing from ${currentRate}% to ${newRate}% could save ${CrownUtils.formatDollars(interestSaving)} on my ${CrownUtils.formatDollars(balance)} loan!`);
    };

    document.getElementById('rf-results').classList.add('visible');
  }

  return { init };
})();
