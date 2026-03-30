/**
 * Investment Growth Calculator
 */
function getInvestmentGrowthHTML() {
  return `
    <div class="page-header">
      <h2>&#x1F4C8; Investment Growth Calculator</h2>
      <p class="page-desc">Project how your investments will grow over time with regular contributions and compound returns.</p>
    </div>

    <div class="calc-form">
      <h3>Investment Details</h3>
      <div class="form-row">
        <div class="form-group">
          <label>Initial Investment</label>
          <div class="input-prefix"><span class="prefix">$</span>
            <input type="number" id="ig-initial" value="10000" min="0" step="1000">
          </div>
        </div>
        <div class="form-group">
          <label>Monthly Contribution</label>
          <div class="input-prefix"><span class="prefix">$</span>
            <input type="number" id="ig-monthly" value="500" min="0" step="50">
          </div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Expected Annual Return (%)</label>
          <div class="input-suffix"><span class="suffix">%</span>
            <input type="number" id="ig-return" value="7" min="0" max="30" step="0.5">
          </div>
        </div>
        <div class="form-group">
          <label>Investment Period (years)</label>
          <input type="number" id="ig-years" value="20" min="1" max="50">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Inflation Rate (%)</label>
          <div class="input-suffix"><span class="suffix">%</span>
            <input type="number" id="ig-inflation" value="3.0" min="0" max="15" step="0.1">
          </div>
        </div>
        <div class="form-group">
          <label>Tax on Earnings</label>
          <select id="ig-tax">
            <option value="0">None (e.g., Super)</option>
            <option value="15">15% (Super fund)</option>
            <option value="30" selected>30% (Personal marginal)</option>
            <option value="45">45% (Top marginal)</option>
          </select>
        </div>
      </div>

      <div class="calc-actions">
        <button class="btn btn-primary btn-lg" id="ig-calculate">Calculate Growth</button>
      </div>
    </div>

    <div class="results-section" id="ig-results">
      <div class="stat-grid" id="ig-stats"></div>
      <div class="chart-container">
        <h4>Investment Growth Over Time</h4>
        <div style="height:350px;"><canvas id="ig-chart"></canvas></div>
      </div>
      <div class="card mt-lg">
        <h4>Year-by-Year Breakdown</h4>
        <div class="amort-table" id="ig-table"></div>
      </div>
      <div class="recommendations" id="ig-recommendations"></div>
      <div class="export-bar">
        <span>Export:</span>
        <button class="btn btn-sm btn-outline" id="ig-export-csv">&#x1F4C4; CSV</button>
        <button class="btn btn-sm btn-outline" id="ig-export-pdf">&#x1F4D1; PDF</button>
      </div>
    </div>
    ${CrownUtils.adBanner()}
  `;
}

CrownCalc.InvestmentGrowth = (() => {
  let yearData = [];

  function init() {
    document.getElementById('ig-calculate').addEventListener('click', calculate);
  }

  function calculate() {
    const initial = CrownUtils.parseNum(document.getElementById('ig-initial').value);
    const monthly = CrownUtils.parseNum(document.getElementById('ig-monthly').value);
    const annualReturn = parseFloat(document.getElementById('ig-return').value) / 100;
    const years = parseInt(document.getElementById('ig-years').value);
    const inflation = parseFloat(document.getElementById('ig-inflation').value) / 100;
    const taxRate = parseInt(document.getElementById('ig-tax').value) / 100;

    const afterTaxReturn = annualReturn * (1 - taxRate);
    const monthlyReturn = afterTaxReturn / 12;
    const realReturn = ((1 + afterTaxReturn) / (1 + inflation)) - 1;

    yearData = [];
    let balance = initial;
    let totalContributions = initial;

    for (let y = 1; y <= years; y++) {
      for (let m = 0; m < 12; m++) {
        balance = balance * (1 + monthlyReturn) + monthly;
        totalContributions += monthly;
      }
      const earnings = balance - totalContributions;
      const realValue = balance / Math.pow(1 + inflation, y);

      yearData.push({
        year: y,
        balance: Math.round(balance),
        contributions: Math.round(totalContributions),
        earnings: Math.round(earnings),
        realValue: Math.round(realValue)
      });
    }

    const final = yearData[yearData.length - 1];

    document.getElementById('ig-stats').innerHTML = `
      <div class="stat-card highlight">
        <div class="stat-icon">&#x1F4B0;</div>
        <div class="stat-value">${CrownUtils.formatDollars(final.balance)}</div>
        <div class="stat-label">Future Value</div>
      </div>
      <div class="stat-card success">
        <div class="stat-icon">&#x1F4C8;</div>
        <div class="stat-value">${CrownUtils.formatDollars(final.earnings)}</div>
        <div class="stat-label">Total Earnings</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">&#x1F4B5;</div>
        <div class="stat-value">${CrownUtils.formatDollars(final.contributions)}</div>
        <div class="stat-label">Total Contributions</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">&#x1F4CA;</div>
        <div class="stat-value">${CrownUtils.formatDollars(final.realValue)}</div>
        <div class="stat-label">Real Value (inflation adj.)</div>
      </div>
    `;

    CrownCharts.stackedBar('ig-chart',
      yearData.map(d => `Yr ${d.year}`),
      [
        { label: 'Contributions', data: yearData.map(d => d.contributions), backgroundColor: '#3498DB' },
        { label: 'Earnings', data: yearData.map(d => d.earnings), backgroundColor: '#27AE60' }
      ]
    );

    // Table
    let html = '<table><thead><tr><th>Year</th><th>Contributions</th><th>Earnings</th><th>Balance</th><th>Real Value</th></tr></thead><tbody>';
    yearData.forEach(d => {
      html += `<tr><td>${d.year}</td><td class="currency">${CrownUtils.formatDollars(d.contributions)}</td><td class="currency">${CrownUtils.formatDollars(d.earnings)}</td><td class="currency">${CrownUtils.formatDollars(d.balance)}</td><td class="currency">${CrownUtils.formatDollars(d.realValue)}</td></tr>`;
    });
    html += '</tbody></table>';
    document.getElementById('ig-table').innerHTML = html;

    // Recommendations
    const recs = [
      { icon: '&#x1F4A1;', text: `Your ${CrownUtils.formatDollars(monthly)}/month turns into ${CrownUtils.formatDollars(final.balance)} over ${years} years — that\'s ${CrownUtils.formatDollars(final.earnings)} in earnings!` },
      { icon: '&#x1F4B9;', text: `In today\'s dollars, your investment is worth ${CrownUtils.formatDollars(final.realValue)} after accounting for ${(inflation * 100).toFixed(1)}% inflation.` }
    ];
    if (taxRate > 0.15) {
      recs.push({ icon: '&#x1F4A1;', text: 'Consider investing through super where earnings are taxed at only 15% — it could significantly boost your returns.' });
    }
    recs.push({ icon: '&#x1F451;', text: 'Visit <strong>CrownMoney.com.au</strong> for investment strategies suited to Australian investors.' });

    document.getElementById('ig-recommendations').innerHTML = `
      <h4>&#x1F4A1; Investment Insights</h4>
      ${recs.map(r => `<div class="recommendation-item"><span class="rec-icon">${r.icon}</span><span>${r.text}</span></div>`).join('')}
    `;

    document.getElementById('ig-export-csv').onclick = () => {
      CrownExport.toCSV('Investment_Growth', ['Year', 'Contributions', 'Earnings', 'Balance', 'Real Value'],
        yearData.map(d => [d.year, d.contributions, d.earnings, d.balance, d.realValue]));
    };
    document.getElementById('ig-export-pdf').onclick = () => {
      CrownExport.toPDF('Investment Growth Projection',
        ['Year', 'Contributions', 'Earnings', 'Balance', 'Real Value'],
        yearData.map(d => [d.year, CrownUtils.formatDollars(d.contributions), CrownUtils.formatDollars(d.earnings), CrownUtils.formatDollars(d.balance), CrownUtils.formatDollars(d.realValue)]),
        'ig-chart');
    };

    document.getElementById('ig-results').classList.add('visible');
  }

  return { init };
})();
