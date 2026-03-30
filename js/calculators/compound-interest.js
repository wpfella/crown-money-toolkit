/**
 * Compound Interest Calculator
 */
function getCompoundInterestHTML() {
  return `
    <div class="page-header">
      <h2>&#x1F4B9; Compound Interest Calculator</h2>
      <p class="page-desc">See the power of compound interest on your savings over time.</p>
    </div>

    <div class="calc-form">
      <h3>Savings Details</h3>
      <div class="form-row">
        <div class="form-group">
          <label>Starting Amount</label>
          <div class="input-prefix"><span class="prefix">$</span>
            <input type="number" id="ci-principal" value="5000" min="0" step="500">
          </div>
        </div>
        <div class="form-group">
          <label>Regular Deposit</label>
          <div class="input-prefix"><span class="prefix">$</span>
            <input type="number" id="ci-deposit" value="200" min="0" step="50">
          </div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Deposit Frequency</label>
          <select id="ci-freq">
            <option value="12" selected>Monthly</option>
            <option value="26">Fortnightly</option>
            <option value="52">Weekly</option>
            <option value="4">Quarterly</option>
            <option value="1">Annually</option>
          </select>
        </div>
        <div class="form-group">
          <label>Interest Rate (% p.a.)</label>
          <div class="input-suffix"><span class="suffix">%</span>
            <input type="number" id="ci-rate" value="4.5" min="0" max="20" step="0.1">
          </div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Compounding</label>
          <select id="ci-compound">
            <option value="12" selected>Monthly</option>
            <option value="4">Quarterly</option>
            <option value="1">Annually</option>
            <option value="365">Daily</option>
          </select>
        </div>
        <div class="form-group">
          <label>Time Period (years)</label>
          <input type="number" id="ci-years" value="10" min="1" max="50">
        </div>
      </div>

      <div class="calc-actions">
        <button class="btn btn-primary btn-lg" id="ci-calculate">Calculate</button>
      </div>
    </div>

    <div class="results-section" id="ci-results">
      <div class="stat-grid" id="ci-stats"></div>
      <div class="chart-container">
        <h4>Savings Growth</h4>
        <div style="height:300px;"><canvas id="ci-chart"></canvas></div>
      </div>
      <div class="recommendations" id="ci-recommendations"></div>
      <div class="export-bar">
        <span>Export:</span>
        <button class="btn btn-sm btn-outline" id="ci-export-pdf">&#x1F4D1; PDF</button>
        <button class="btn btn-sm btn-outline" id="ci-share">&#x1F4E4; Share</button>
      </div>
    </div>
    ${CrownUtils.adBanner()}
  `;
}

CrownCalc.CompoundInterest = (() => {
  function init() {
    document.getElementById('ci-calculate').addEventListener('click', calculate);
  }

  function calculate() {
    const principal = CrownUtils.parseNum(document.getElementById('ci-principal').value);
    const deposit = CrownUtils.parseNum(document.getElementById('ci-deposit').value);
    const depositFreq = parseInt(document.getElementById('ci-freq').value);
    const annualRate = parseFloat(document.getElementById('ci-rate').value) / 100;
    const compoundFreq = parseInt(document.getElementById('ci-compound').value);
    const years = parseInt(document.getElementById('ci-years').value);

    const periodsPerYear = compoundFreq;
    const periodRate = annualRate / periodsPerYear;
    const totalPeriods = periodsPerYear * years;
    const depositsPerPeriod = deposit * (depositFreq / periodsPerYear);

    let balance = principal;
    let totalDeposits = principal;
    const yearlyData = [];

    for (let p = 1; p <= totalPeriods; p++) {
      balance = balance * (1 + periodRate) + depositsPerPeriod;
      totalDeposits += depositsPerPeriod;

      if (p % periodsPerYear === 0) {
        yearlyData.push({
          year: p / periodsPerYear,
          balance: Math.round(balance),
          deposits: Math.round(totalDeposits),
          interest: Math.round(balance - totalDeposits)
        });
      }
    }

    const totalInterest = Math.round(balance - totalDeposits);

    document.getElementById('ci-stats').innerHTML = `
      <div class="stat-card highlight">
        <div class="stat-icon">&#x1F4B0;</div>
        <div class="stat-value">${CrownUtils.formatDollars(balance)}</div>
        <div class="stat-label">Final Balance</div>
      </div>
      <div class="stat-card success">
        <div class="stat-icon">&#x1F4C8;</div>
        <div class="stat-value">${CrownUtils.formatDollars(totalInterest)}</div>
        <div class="stat-label">Total Interest Earned</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">&#x1F4B5;</div>
        <div class="stat-value">${CrownUtils.formatDollars(totalDeposits)}</div>
        <div class="stat-label">Total Deposits</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">&#x1F4CA;</div>
        <div class="stat-value">${totalDeposits > 0 ? ((totalInterest / totalDeposits) * 100).toFixed(1) : 0}%</div>
        <div class="stat-label">Return on Deposits</div>
      </div>
    `;

    CrownCharts.line('ci-chart',
      yearlyData.map(d => `Year ${d.year}`),
      [
        { label: 'Total Balance', data: yearlyData.map(d => d.balance), borderColor: '#D4A843' },
        { label: 'Total Deposits', data: yearlyData.map(d => d.deposits), borderColor: '#3498DB', borderDash: [5, 5] }
      ]
    );

    const recs = [
      { icon: '&#x1F4A1;', text: `Your money grows from ${CrownUtils.formatDollars(principal)} to ${CrownUtils.formatDollars(balance)} — compound interest earned you ${CrownUtils.formatDollars(totalInterest)}!` },
      { icon: '&#x1F4B9;', text: `The "Rule of 72": At ${(annualRate * 100).toFixed(1)}%, your money doubles in approximately ${Math.round(72 / (annualRate * 100))} years.` },
      { icon: '&#x1F451;', text: 'Visit <strong>CrownMoney.com.au</strong> for savings strategies that help you grow your wealth.' }
    ];

    document.getElementById('ci-recommendations').innerHTML = `
      <h4>&#x1F4A1; Compound Interest Facts</h4>
      ${recs.map(r => `<div class="recommendation-item"><span class="rec-icon">${r.icon}</span><span>${r.text}</span></div>`).join('')}
    `;

    document.getElementById('ci-export-pdf').onclick = () => {
      CrownExport.toPDF('Compound Interest', ['Year', 'Deposits', 'Interest', 'Balance'],
        yearlyData.map(d => [d.year, CrownUtils.formatDollars(d.deposits), CrownUtils.formatDollars(d.interest), CrownUtils.formatDollars(d.balance)]),
        'ci-chart');
    };
    document.getElementById('ci-share').onclick = () => {
      CrownExport.share('Compound Interest', `Starting with ${CrownUtils.formatDollars(principal)} + ${CrownUtils.formatDollars(deposit)}/month at ${(annualRate * 100).toFixed(1)}%, I'll have ${CrownUtils.formatDollars(balance)} in ${years} years!`);
    };

    document.getElementById('ci-results').classList.add('visible');
  }

  return { init };
})();
