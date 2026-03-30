/**
 * Rent vs Buy Calculator
 */
function getRentVsBuyHTML() {
  return `
    <div class="page-header">
      <h2>&#x1F3D8; Rent vs Buy Calculator</h2>
      <p class="page-desc">Compare the financial outcomes of renting versus buying a home over time.</p>
    </div>

    <div class="comparison-grid">
      <div class="calc-form">
        <h3>&#x1F3E0; Buying</h3>
        <div class="form-group">
          <label>Property Price</label>
          <div class="input-prefix"><span class="prefix">$</span>
            <input type="number" id="rvb-price" value="650000" min="0" step="5000">
          </div>
        </div>
        <div class="form-group">
          <label>Deposit</label>
          <div class="input-prefix"><span class="prefix">$</span>
            <input type="number" id="rvb-deposit" value="130000" min="0" step="5000">
          </div>
        </div>
        <div class="form-group">
          <label>Interest Rate (%)</label>
          <div class="input-suffix"><span class="suffix">%</span>
            <input type="number" id="rvb-rate" value="6.20" min="0" max="20" step="0.01">
          </div>
        </div>
        <div class="form-group">
          <label>Property Growth (% p.a.)</label>
          <div class="input-suffix"><span class="suffix">%</span>
            <input type="number" id="rvb-growth" value="4.0" min="0" max="15" step="0.5">
          </div>
        </div>
        <div class="form-group">
          <label>Annual Ownership Costs</label>
          <div class="input-prefix"><span class="prefix">$</span>
            <input type="number" id="rvb-costs" value="6000" min="0" step="500">
          </div>
          <div class="form-hint">Rates, insurance, maintenance</div>
        </div>
      </div>

      <div class="calc-form">
        <h3>&#x1F3E2; Renting</h3>
        <div class="form-group">
          <label>Weekly Rent</label>
          <div class="input-prefix"><span class="prefix">$</span>
            <input type="number" id="rvb-rent" value="550" min="0" step="10">
          </div>
        </div>
        <div class="form-group">
          <label>Annual Rent Increase (%)</label>
          <div class="input-suffix"><span class="suffix">%</span>
            <input type="number" id="rvb-rent-increase" value="4.0" min="0" max="15" step="0.5">
          </div>
        </div>
        <div class="form-group">
          <label>Investment Return on Deposit (%)</label>
          <div class="input-suffix"><span class="suffix">%</span>
            <input type="number" id="rvb-invest-return" value="7.0" min="0" max="20" step="0.5">
          </div>
          <div class="form-hint">If you invest your deposit instead of buying</div>
        </div>
        <div class="form-group">
          <label>Time Period (years)</label>
          <input type="number" id="rvb-years" value="10" min="1" max="40">
        </div>
      </div>
    </div>

    <div style="text-align:center;margin:24px 0;">
      <button class="btn btn-primary btn-lg" id="rvb-calculate">Compare</button>
    </div>

    <div class="results-section" id="rvb-results">
      <div class="stat-grid" id="rvb-stats"></div>
      <div class="chart-container">
        <h4>Wealth Comparison Over Time</h4>
        <div style="height:300px;"><canvas id="rvb-chart"></canvas></div>
      </div>
      <div class="recommendations" id="rvb-recommendations"></div>
      <div class="export-bar">
        <span>Export:</span>
        <button class="btn btn-sm btn-outline" id="rvb-export-pdf">&#x1F4D1; PDF</button>
      </div>
    </div>
    ${CrownUtils.adBanner()}
  `;
}

CrownCalc.RentVsBuy = (() => {
  function init() {
    document.getElementById('rvb-calculate').addEventListener('click', calculate);
  }

  function calculate() {
    const price = CrownUtils.parseNum(document.getElementById('rvb-price').value);
    const deposit = CrownUtils.parseNum(document.getElementById('rvb-deposit').value);
    const rate = parseFloat(document.getElementById('rvb-rate').value);
    const growth = parseFloat(document.getElementById('rvb-growth').value) / 100;
    const annualCosts = CrownUtils.parseNum(document.getElementById('rvb-costs').value);
    const weeklyRent = CrownUtils.parseNum(document.getElementById('rvb-rent').value);
    const rentIncrease = parseFloat(document.getElementById('rvb-rent-increase').value) / 100;
    const investReturn = parseFloat(document.getElementById('rvb-invest-return').value) / 100;
    const years = parseInt(document.getElementById('rvb-years').value);

    const loan = price - deposit;
    const monthlyPayment = CrownUtils.pmt(rate / 100 / 12, 30 * 12, loan);

    let buyEquity = deposit;
    let buyTotalCost = 0;
    let rentTotalCost = 0;
    let rentInvestment = deposit;
    let currentRent = weeklyRent;

    const yearData = [];

    for (let y = 1; y <= years; y++) {
      // Buy side
      const propertyValue = price * Math.pow(1 + growth, y);
      const schedule = CrownUtils.amortizationSchedule(loan, rate, 30);
      const monthIdx = Math.min(y * 12, schedule.length) - 1;
      const remainingLoan = monthIdx >= 0 ? schedule[monthIdx].balance : 0;
      buyEquity = propertyValue - remainingLoan;
      buyTotalCost += (monthlyPayment * 12) + annualCosts;

      // Rent side
      const annualRent = currentRent * 52;
      rentTotalCost += annualRent;
      const monthlySavings = Math.max(0, (monthlyPayment + annualCosts / 12) - (currentRent * 52 / 12));
      rentInvestment = rentInvestment * (1 + investReturn) + monthlySavings * 12;
      currentRent *= (1 + rentIncrease);

      yearData.push({
        year: y,
        buyWealth: Math.round(buyEquity),
        rentWealth: Math.round(rentInvestment),
        buyCost: Math.round(buyTotalCost),
        rentCost: Math.round(rentTotalCost)
      });
    }

    const finalBuy = yearData[yearData.length - 1].buyWealth;
    const finalRent = yearData[yearData.length - 1].rentWealth;
    const winner = finalBuy > finalRent ? 'Buying' : 'Renting';
    const advantage = Math.abs(finalBuy - finalRent);

    document.getElementById('rvb-stats').innerHTML = `
      <div class="stat-card ${winner === 'Buying' ? 'highlight' : ''}">
        <div class="stat-icon">&#x1F3E0;</div>
        <div class="stat-value">${CrownUtils.formatDollars(finalBuy)}</div>
        <div class="stat-label">Buying: Net Wealth</div>
      </div>
      <div class="stat-card ${winner === 'Renting' ? 'highlight' : ''}">
        <div class="stat-icon">&#x1F3E2;</div>
        <div class="stat-value">${CrownUtils.formatDollars(finalRent)}</div>
        <div class="stat-label">Renting: Investment Value</div>
      </div>
      <div class="stat-card success">
        <div class="stat-icon">&#x1F3C6;</div>
        <div class="stat-value">${winner}</div>
        <div class="stat-label">Better Off By ${CrownUtils.formatDollars(advantage)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">&#x1F4CA;</div>
        <div class="stat-value">${CrownUtils.formatDollars(price * Math.pow(1 + growth, years))}</div>
        <div class="stat-label">Property Value in ${years}yrs</div>
      </div>
    `;

    CrownCharts.line('rvb-chart',
      yearData.map(d => `Year ${d.year}`),
      [
        { label: 'Buying (Equity)', data: yearData.map(d => d.buyWealth), borderColor: '#27AE60' },
        { label: 'Renting (Investments)', data: yearData.map(d => d.rentWealth), borderColor: '#3498DB' }
      ]
    );

    const recs = [
      { icon: '&#x1F3C6;', text: `Over ${years} years, <strong>${winner.toLowerCase()}</strong> comes out ahead by ${CrownUtils.formatDollars(advantage)}.` },
      { icon: '&#x1F4A1;', text: 'This comparison assumes consistent growth rates and doesn\'t account for lifestyle benefits of homeownership or rental flexibility.' },
      { icon: '&#x1F451;', text: 'Visit <strong>CrownMoney.com.au</strong> for personalised guidance on your rent vs buy decision.' }
    ];

    document.getElementById('rvb-recommendations').innerHTML = `
      <h4>&#x1F4A1; Analysis</h4>
      ${recs.map(r => `<div class="recommendation-item"><span class="rec-icon">${r.icon}</span><span>${r.text}</span></div>`).join('')}
    `;

    document.getElementById('rvb-export-pdf').onclick = () => {
      CrownExport.toPDF('Rent vs Buy Analysis', ['Year', 'Buy Wealth', 'Rent Wealth'],
        yearData.map(d => [d.year, CrownUtils.formatDollars(d.buyWealth), CrownUtils.formatDollars(d.rentWealth)]),
        'rvb-chart');
    };

    document.getElementById('rvb-results').classList.add('visible');
  }

  return { init };
})();
