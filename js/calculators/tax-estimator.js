/**
 * Tax Estimator Calculator
 */
function getTaxEstimatorHTML() {
  return `
    <div class="page-header">
      <h2>&#x1F9FE; Australian Tax Estimator</h2>
      <p class="page-desc">Estimate your income tax, Medicare levy, and take-home pay for the current financial year (FY 2025-26).</p>
    </div>

    <div class="calc-form">
      <h3>Income Details</h3>
      <div class="form-row">
        <div class="form-group">
          <label>Annual Gross Income</label>
          <div class="input-prefix"><span class="prefix">$</span>
            <input type="number" id="tax-income" value="85000" min="0" step="1000">
          </div>
        </div>
        <div class="form-group">
          <label>Income Frequency</label>
          <select id="tax-freq">
            <option value="annual" selected>Annual</option>
            <option value="monthly">Monthly</option>
            <option value="fortnightly">Fortnightly</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>HECS/HELP Debt</label>
          <div class="input-prefix"><span class="prefix">$</span>
            <input type="number" id="tax-hecs" value="0" min="0" step="100">
          </div>
          <div class="form-hint">Enter 0 if you don't have a HECS/HELP debt</div>
        </div>
        <div class="form-group">
          <label>Private Health Insurance</label>
          <select id="tax-phi">
            <option value="yes">Yes, I have PHI</option>
            <option value="no" selected>No PHI</option>
          </select>
          <div class="form-hint">Affects Medicare Levy Surcharge</div>
        </div>
      </div>

      <div class="calc-actions">
        <button class="btn btn-primary btn-lg" id="tax-calculate">Estimate Tax</button>
        <button class="btn btn-secondary" id="tax-reset">Reset</button>
      </div>
    </div>

    <div class="results-section" id="tax-results">
      <div class="stat-grid" id="tax-stats"></div>

      <div class="card mt-lg">
        <h4>Tax Breakdown</h4>
        <div style="height:280px;"><canvas id="tax-chart"></canvas></div>
      </div>

      <div class="card mt-lg">
        <h4>Take-Home Pay Summary</h4>
        <div class="table-wrap" id="tax-breakdown-table"></div>
      </div>

      <div class="card mt-lg">
        <h4>Pay Frequency Breakdown</h4>
        <div class="table-wrap" id="tax-frequency-table"></div>
      </div>

      <div class="recommendations" id="tax-recommendations"></div>

      <div class="export-bar">
        <span>Export your results:</span>
        <button class="btn btn-sm btn-outline" id="tax-export-csv">&#x1F4C4; CSV</button>
        <button class="btn btn-sm btn-outline" id="tax-export-pdf">&#x1F4D1; PDF</button>
        <button class="btn btn-sm btn-outline" id="tax-share">&#x1F4E4; Share</button>
      </div>
    </div>

    ${CrownUtils.adBanner()}
  `;
}

CrownCalc.TaxEstimator = (() => {
  let lastResult = null;

  function init() {
    document.getElementById('tax-calculate').addEventListener('click', calculate);
    document.getElementById('tax-reset').addEventListener('click', () => {
      document.getElementById('tax-income').value = 85000;
      document.getElementById('tax-hecs').value = 0;
      document.getElementById('tax-results').classList.remove('visible');
    });

    // Auto-convert frequency
    document.getElementById('tax-freq').addEventListener('change', convertFrequency);
  }

  function convertFrequency() {
    const freq = document.getElementById('tax-freq').value;
    const rawVal = CrownUtils.parseNum(document.getElementById('tax-income').value);
    // We always calculate on annual, but show the hint
  }

  function calculate() {
    let income = CrownUtils.parseNum(document.getElementById('tax-income').value);
    const freq = document.getElementById('tax-freq').value;
    const hecsDebt = CrownUtils.parseNum(document.getElementById('tax-hecs').value);

    // Convert to annual
    if (freq === 'monthly') income *= 12;
    else if (freq === 'fortnightly') income *= 26;
    else if (freq === 'weekly') income *= 52;

    if (income <= 0) return;

    lastResult = TaxData.calculate(income, { hecsDebt });

    // Stats
    document.getElementById('tax-stats').innerHTML = `
      <div class="stat-card highlight">
        <div class="stat-icon">&#x1F4B5;</div>
        <div class="stat-value">${CrownUtils.formatDollars(lastResult.netIncome)}</div>
        <div class="stat-label">Annual Take-Home Pay</div>
      </div>
      <div class="stat-card danger">
        <div class="stat-icon">&#x1F4C9;</div>
        <div class="stat-value">${CrownUtils.formatDollars(lastResult.totalTax)}</div>
        <div class="stat-label">Total Tax</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">&#x1F4CA;</div>
        <div class="stat-value">${lastResult.effectiveRate}%</div>
        <div class="stat-label">Effective Tax Rate</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">&#x1F4C8;</div>
        <div class="stat-value">${lastResult.marginalRate}%</div>
        <div class="stat-label">Marginal Tax Rate</div>
      </div>
    `;

    // Doughnut chart
    const chartData = [lastResult.netIncome, lastResult.incomeTax, lastResult.medicareLevy];
    const chartLabels = ['Take-Home Pay', 'Income Tax', 'Medicare Levy'];
    if (lastResult.hecsRepayment > 0) {
      chartData.push(lastResult.hecsRepayment);
      chartLabels.push('HECS Repayment');
    }

    CrownCharts.doughnut('tax-chart', chartLabels, chartData.map(Math.round), {
      colors: ['#27AE60', '#E74C3C', '#3498DB', '#F39C12']
    });

    // Breakdown table
    document.getElementById('tax-breakdown-table').innerHTML = `
      <table>
        <tbody>
          <tr><td>Gross Income</td><td class="text-right font-mono">${CrownUtils.formatDollars(income)}</td></tr>
          <tr><td>Income Tax</td><td class="text-right font-mono text-danger">-${CrownUtils.formatDollars(lastResult.incomeTax)}</td></tr>
          <tr><td>Low Income Tax Offset (LITO)</td><td class="text-right font-mono text-success">${CrownUtils.formatDollars(lastResult.lito)} applied</td></tr>
          <tr><td>Medicare Levy (2%)</td><td class="text-right font-mono text-danger">-${CrownUtils.formatDollars(lastResult.medicareLevy)}</td></tr>
          ${lastResult.hecsRepayment > 0 ? `<tr><td>HECS/HELP Repayment</td><td class="text-right font-mono text-danger">-${CrownUtils.formatDollars(lastResult.hecsRepayment)}</td></tr>` : ''}
          <tr style="font-weight:700;border-top:2px solid #dee2e6;"><td>Net Take-Home Pay</td><td class="text-right font-mono">${CrownUtils.formatDollars(lastResult.netIncome)}</td></tr>
        </tbody>
      </table>
    `;

    // Frequency table
    document.getElementById('tax-frequency-table').innerHTML = `
      <table>
        <thead><tr><th>Period</th><th>Gross</th><th>Tax</th><th>Net</th></tr></thead>
        <tbody>
          <tr><td>Annual</td><td class="currency">${CrownUtils.formatDollars(income)}</td><td class="currency">${CrownUtils.formatDollars(lastResult.totalDeductions)}</td><td class="currency">${CrownUtils.formatDollars(lastResult.netIncome)}</td></tr>
          <tr><td>Monthly</td><td class="currency">${CrownUtils.formatDollars(income/12)}</td><td class="currency">${CrownUtils.formatDollars(lastResult.totalDeductions/12)}</td><td class="currency">${CrownUtils.formatDollars(lastResult.monthlyNet)}</td></tr>
          <tr><td>Fortnightly</td><td class="currency">${CrownUtils.formatDollars(income/26)}</td><td class="currency">${CrownUtils.formatDollars(lastResult.totalDeductions/26)}</td><td class="currency">${CrownUtils.formatDollars(lastResult.fortnightlyNet)}</td></tr>
          <tr><td>Weekly</td><td class="currency">${CrownUtils.formatDollars(income/52)}</td><td class="currency">${CrownUtils.formatDollars(lastResult.totalDeductions/52)}</td><td class="currency">${CrownUtils.formatDollars(lastResult.weeklyNet)}</td></tr>
        </tbody>
      </table>
    `;

    // Recommendations
    const recs = [];
    if (lastResult.marginalRate >= 37) {
      recs.push({ icon: '&#x1F4A1;', text: `You\'re in the ${lastResult.marginalRate}% tax bracket. Consider salary sacrificing into super to reduce your taxable income — you\'ll only pay 15% tax on concessional contributions.` });
    }
    if (hecsDebt > 0) {
      recs.push({ icon: '&#x1F393;', text: `Your HECS repayment is ${CrownUtils.formatDollars(lastResult.hecsRepayment)} this year. Voluntary repayments don\'t offer a discount, so focus on higher-interest debt first.` });
    }
    recs.push({ icon: '&#x1F451;', text: 'Visit <strong>CrownMoney.com.au</strong> for strategies to legally minimise your tax and grow your wealth.' });

    document.getElementById('tax-recommendations').innerHTML = `
      <h4>&#x1F4A1; Tax Tips</h4>
      ${recs.map(r => `<div class="recommendation-item"><span class="rec-icon">${r.icon}</span><span>${r.text}</span></div>`).join('')}
    `;

    // Exports
    document.getElementById('tax-export-csv').onclick = () => {
      CrownExport.toCSV('Tax_Estimate', ['Item', 'Amount'], [
        ['Gross Income', income], ['Income Tax', lastResult.incomeTax],
        ['Medicare Levy', lastResult.medicareLevy], ['HECS', lastResult.hecsRepayment],
        ['Net Income', lastResult.netIncome]
      ]);
    };
    document.getElementById('tax-export-pdf').onclick = () => {
      CrownExport.toPDF('Tax Estimate FY 2025-26', ['Item', 'Amount'], [
        ['Gross Income', CrownUtils.formatDollars(income)],
        ['Income Tax', CrownUtils.formatDollars(lastResult.incomeTax)],
        ['LITO Applied', CrownUtils.formatDollars(lastResult.lito)],
        ['Medicare Levy', CrownUtils.formatDollars(lastResult.medicareLevy)],
        ['HECS Repayment', CrownUtils.formatDollars(lastResult.hecsRepayment)],
        ['Net Take-Home', CrownUtils.formatDollars(lastResult.netIncome)],
        ['Effective Rate', lastResult.effectiveRate + '%'],
        ['Marginal Rate', lastResult.marginalRate + '%']
      ], 'tax-chart');
    };
    document.getElementById('tax-share').onclick = () => {
      CrownExport.share('Tax Estimate', `On ${CrownUtils.formatDollars(income)} income: Tax ${CrownUtils.formatDollars(lastResult.totalTax)} | Take-home ${CrownUtils.formatDollars(lastResult.netIncome)} | Effective rate ${lastResult.effectiveRate}%`);
    };

    document.getElementById('tax-results').classList.add('visible');

    CrownChat.setCalcContext('Tax Estimator', {
      grossIncome: CrownUtils.formatDollars(income),
      netIncome: CrownUtils.formatDollars(lastResult.netIncome),
      effectiveRate: lastResult.effectiveRate + '%',
      marginalRate: lastResult.marginalRate + '%'
    });
  }

  return { init };
})();
