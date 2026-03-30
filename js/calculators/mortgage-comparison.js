/**
 * Mortgage Comparison Calculator
 */
function getMortgageComparisonHTML() {
  return `
    <div class="page-header">
      <h2>&#x1F4CA; Mortgage Comparison</h2>
      <p class="page-desc">Compare two loan options side by side to find the best deal for you.</p>
    </div>

    <div class="comparison-grid">
      <div class="calc-form">
        <h3>Loan A</h3>
        <div class="form-group">
          <label>Loan Amount</label>
          <div class="input-prefix"><span class="prefix">$</span>
            <input type="number" id="mc-a-amount" value="500000" min="0" step="1000">
          </div>
        </div>
        <div class="form-group">
          <label>Interest Rate (% p.a.)</label>
          <div class="input-suffix"><span class="suffix">%</span>
            <input type="number" id="mc-a-rate" value="6.20" min="0" max="20" step="0.01">
          </div>
        </div>
        <div class="form-group">
          <label>Loan Term (years)</label>
          <input type="number" id="mc-a-term" value="30" min="1" max="40">
        </div>
        <div class="form-group">
          <label>Annual Fees</label>
          <div class="input-prefix"><span class="prefix">$</span>
            <input type="number" id="mc-a-fees" value="395" min="0">
          </div>
        </div>
      </div>

      <div class="calc-form">
        <h3>Loan B</h3>
        <div class="form-group">
          <label>Loan Amount</label>
          <div class="input-prefix"><span class="prefix">$</span>
            <input type="number" id="mc-b-amount" value="500000" min="0" step="1000">
          </div>
        </div>
        <div class="form-group">
          <label>Interest Rate (% p.a.)</label>
          <div class="input-suffix"><span class="suffix">%</span>
            <input type="number" id="mc-b-rate" value="5.80" min="0" max="20" step="0.01">
          </div>
        </div>
        <div class="form-group">
          <label>Loan Term (years)</label>
          <input type="number" id="mc-b-term" value="30" min="1" max="40">
        </div>
        <div class="form-group">
          <label>Annual Fees</label>
          <div class="input-prefix"><span class="prefix">$</span>
            <input type="number" id="mc-b-fees" value="0" min="0">
          </div>
        </div>
      </div>
    </div>

    <div style="text-align:center;margin:24px 0;">
      <button class="btn btn-primary btn-lg" id="mc-calculate">Compare Loans</button>
    </div>

    <div class="results-section" id="mc-results">
      <div class="stat-grid" id="mc-stats"></div>

      <div class="chart-container">
        <h4>Total Cost Comparison</h4>
        <div style="height:300px;"><canvas id="mc-chart"></canvas></div>
      </div>

      <div class="recommendations" id="mc-recommendations"></div>

      <div class="export-bar">
        <span>Export:</span>
        <button class="btn btn-sm btn-outline" id="mc-export-pdf">&#x1F4D1; PDF</button>
        <button class="btn btn-sm btn-outline" id="mc-share">&#x1F4E4; Share</button>
      </div>
    </div>

    ${CrownUtils.adBanner()}
  `;
}

CrownCalc.MortgageComparison = (() => {
  function init() {
    document.getElementById('mc-calculate').addEventListener('click', calculate);
  }

  function calculate() {
    const a = {
      amount: CrownUtils.parseNum(document.getElementById('mc-a-amount').value),
      rate: parseFloat(document.getElementById('mc-a-rate').value),
      term: parseInt(document.getElementById('mc-a-term').value),
      fees: CrownUtils.parseNum(document.getElementById('mc-a-fees').value)
    };
    const b = {
      amount: CrownUtils.parseNum(document.getElementById('mc-b-amount').value),
      rate: parseFloat(document.getElementById('mc-b-rate').value),
      term: parseInt(document.getElementById('mc-b-term').value),
      fees: CrownUtils.parseNum(document.getElementById('mc-b-fees').value)
    };

    const aMonthly = CrownUtils.pmt(a.rate / 100 / 12, a.term * 12, a.amount);
    const bMonthly = CrownUtils.pmt(b.rate / 100 / 12, b.term * 12, b.amount);

    const aTotalInterest = (aMonthly * a.term * 12) - a.amount;
    const bTotalInterest = (bMonthly * b.term * 12) - b.amount;

    const aTotalCost = a.amount + aTotalInterest + (a.fees * a.term);
    const bTotalCost = b.amount + bTotalInterest + (b.fees * b.term);

    const savings = Math.abs(aTotalCost - bTotalCost);
    const winner = aTotalCost < bTotalCost ? 'A' : 'B';

    document.getElementById('mc-stats').innerHTML = `
      <div class="stat-card ${winner === 'A' ? 'highlight' : ''}">
        <div class="stat-icon">&#x1F170;</div>
        <div class="stat-value">${CrownUtils.formatCurrency(aMonthly)}</div>
        <div class="stat-label">Loan A Monthly</div>
      </div>
      <div class="stat-card ${winner === 'B' ? 'highlight' : ''}">
        <div class="stat-icon">&#x1F171;</div>
        <div class="stat-value">${CrownUtils.formatCurrency(bMonthly)}</div>
        <div class="stat-label">Loan B Monthly</div>
      </div>
      <div class="stat-card success">
        <div class="stat-icon">&#x1F3C6;</div>
        <div class="stat-value">Loan ${winner}</div>
        <div class="stat-label">Better Deal</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">&#x1F4B0;</div>
        <div class="stat-value">${CrownUtils.formatDollars(savings)}</div>
        <div class="stat-label">You Save</div>
      </div>
    `;

    CrownCharts.bar('mc-chart',
      ['Monthly Payment', 'Total Interest', 'Total Fees', 'Total Cost'],
      [
        { label: 'Loan A', data: [Math.round(aMonthly), Math.round(aTotalInterest), a.fees * a.term, Math.round(aTotalCost)], backgroundColor: '#D4A843' },
        { label: 'Loan B', data: [Math.round(bMonthly), Math.round(bTotalInterest), b.fees * b.term, Math.round(bTotalCost)], backgroundColor: '#3498DB' }
      ]
    );

    document.getElementById('mc-recommendations').innerHTML = `
      <h4>&#x1F4A1; Analysis</h4>
      <div class="recommendation-item"><span class="rec-icon">&#x1F3C6;</span><span><strong>Loan ${winner}</strong> saves you <strong>${CrownUtils.formatDollars(savings)}</strong> over the life of the loan.</span></div>
      <div class="recommendation-item"><span class="rec-icon">&#x1F4B3;</span><span>Monthly difference: ${CrownUtils.formatCurrency(Math.abs(aMonthly - bMonthly))} per month.</span></div>
      <div class="recommendation-item"><span class="rec-icon">&#x1F451;</span><span>Visit <strong>CrownMoney.com.au</strong> to find the best home loan rates for your situation.</span></div>
    `;

    document.getElementById('mc-export-pdf').onclick = () => {
      CrownExport.toPDF('Mortgage Comparison', ['', 'Loan A', 'Loan B'], [
        ['Amount', CrownUtils.formatDollars(a.amount), CrownUtils.formatDollars(b.amount)],
        ['Rate', a.rate + '%', b.rate + '%'],
        ['Monthly', CrownUtils.formatCurrency(aMonthly), CrownUtils.formatCurrency(bMonthly)],
        ['Total Interest', CrownUtils.formatDollars(aTotalInterest), CrownUtils.formatDollars(bTotalInterest)],
        ['Total Cost', CrownUtils.formatDollars(aTotalCost), CrownUtils.formatDollars(bTotalCost)]
      ], 'mc-chart');
    };

    document.getElementById('mc-share').onclick = () => {
      CrownExport.share('Mortgage Comparison', `Compared two loans: Loan ${winner} saves ${CrownUtils.formatDollars(savings)} over the life of the loan.`);
    };

    document.getElementById('mc-results').classList.add('visible');
  }

  return { init };
})();
