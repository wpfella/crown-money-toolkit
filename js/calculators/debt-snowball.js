/**
 * Debt Payoff Planner (Snowball / Avalanche)
 */
function getDebtSnowballHTML() {
  return `
    <div class="page-header">
      <h2>&#x2744; Debt Payoff Planner</h2>
      <p class="page-desc">Plan your debt-free journey using the snowball (smallest first) or avalanche (highest rate first) method.</p>
    </div>

    <div class="calc-form">
      <h3>Your Debts</h3>
      <div class="form-hint mb-md">Add all your debts below. The calculator will show you the fastest path to being debt-free.</div>

      <div id="ds-debt-list" class="debt-list">
        <div class="debt-item">
          <input type="text" placeholder="Debt name" value="Credit Card" class="ds-name">
          <input type="number" placeholder="Balance" value="5000" class="ds-balance" min="0">
          <input type="number" placeholder="Rate %" value="19.9" class="ds-rate" min="0" step="0.1">
          <input type="number" placeholder="Min payment" value="150" class="ds-min" min="0">
          <button class="remove-debt" title="Remove">&#x2715;</button>
        </div>
        <div class="debt-item">
          <input type="text" placeholder="Debt name" value="Car Loan" class="ds-name">
          <input type="number" placeholder="Balance" value="15000" class="ds-balance" min="0">
          <input type="number" placeholder="Rate %" value="7.5" class="ds-rate" min="0" step="0.1">
          <input type="number" placeholder="Min payment" value="350" class="ds-min" min="0">
          <button class="remove-debt" title="Remove">&#x2715;</button>
        </div>
        <div class="debt-item">
          <input type="text" placeholder="Debt name" value="Personal Loan" class="ds-name">
          <input type="number" placeholder="Balance" value="8000" class="ds-balance" min="0">
          <input type="number" placeholder="Rate %" value="12.0" class="ds-rate" min="0" step="0.1">
          <input type="number" placeholder="Min payment" value="200" class="ds-min" min="0">
          <button class="remove-debt" title="Remove">&#x2715;</button>
        </div>
      </div>

      <button class="btn btn-secondary mt-md" id="ds-add-debt">+ Add Another Debt</button>

      <div class="form-row mt-lg">
        <div class="form-group">
          <label>Extra Monthly Payment</label>
          <div class="input-prefix"><span class="prefix">$</span>
            <input type="number" id="ds-extra" value="200" min="0" step="50">
          </div>
          <div class="form-hint">Amount above minimum payments you can put toward debt</div>
        </div>
        <div class="form-group">
          <label>Strategy</label>
          <select id="ds-strategy">
            <option value="avalanche" selected>Avalanche (highest rate first)</option>
            <option value="snowball">Snowball (smallest balance first)</option>
          </select>
        </div>
      </div>

      <div class="calc-actions">
        <button class="btn btn-primary btn-lg" id="ds-calculate">Create Payoff Plan</button>
      </div>
    </div>

    <div class="results-section" id="ds-results">
      <div class="stat-grid" id="ds-stats"></div>
      <div class="chart-container">
        <h4>Debt Payoff Timeline</h4>
        <div style="height:300px;"><canvas id="ds-chart"></canvas></div>
      </div>
      <div class="card mt-lg">
        <h4>Payoff Order</h4>
        <div id="ds-order"></div>
      </div>
      <div class="recommendations" id="ds-recommendations"></div>
      <div class="export-bar">
        <span>Export:</span>
        <button class="btn btn-sm btn-outline" id="ds-export-pdf">&#x1F4D1; PDF</button>
      </div>
    </div>
    ${CrownUtils.adBanner()}
  `;
}

CrownCalc.DebtSnowball = (() => {
  function init() {
    document.getElementById('ds-calculate').addEventListener('click', calculate);
    document.getElementById('ds-add-debt').addEventListener('click', addDebt);

    // Remove debt handlers
    document.getElementById('ds-debt-list').addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-debt')) {
        const items = document.querySelectorAll('.debt-item');
        if (items.length > 1) e.target.closest('.debt-item').remove();
      }
    });
  }

  function addDebt() {
    const list = document.getElementById('ds-debt-list');
    const item = document.createElement('div');
    item.className = 'debt-item';
    item.innerHTML = `
      <input type="text" placeholder="Debt name" class="ds-name">
      <input type="number" placeholder="Balance" class="ds-balance" min="0" value="0">
      <input type="number" placeholder="Rate %" class="ds-rate" min="0" step="0.1" value="0">
      <input type="number" placeholder="Min payment" class="ds-min" min="0" value="0">
      <button class="remove-debt" title="Remove">&#x2715;</button>
    `;
    list.appendChild(item);
  }

  function getDebts() {
    const debts = [];
    document.querySelectorAll('.debt-item').forEach(item => {
      const name = item.querySelector('.ds-name').value || 'Unnamed';
      const balance = CrownUtils.parseNum(item.querySelector('.ds-balance').value);
      const rate = parseFloat(item.querySelector('.ds-rate').value) || 0;
      const minPayment = CrownUtils.parseNum(item.querySelector('.ds-min').value);
      if (balance > 0) debts.push({ name, balance, rate, minPayment });
    });
    return debts;
  }

  function calculate() {
    const debts = getDebts();
    if (debts.length === 0) return;

    const extra = CrownUtils.parseNum(document.getElementById('ds-extra').value);
    const strategy = document.getElementById('ds-strategy').value;

    // Sort by strategy
    if (strategy === 'avalanche') {
      debts.sort((a, b) => b.rate - a.rate);
    } else {
      debts.sort((a, b) => a.balance - b.balance);
    }

    const totalDebt = debts.reduce((s, d) => s + d.balance, 0);
    const totalMinPayment = debts.reduce((s, d) => s + d.minPayment, 0);

    // Simulate payoff
    let balances = debts.map(d => d.balance);
    let totalInterestPaid = 0;
    let months = 0;
    const maxMonths = 600;
    const payoffOrder = [];
    const monthlyTotals = [];

    while (balances.some(b => b > 0) && months < maxMonths) {
      months++;
      let extraLeft = extra;

      // Pay interest and minimum on all
      for (let i = 0; i < debts.length; i++) {
        if (balances[i] <= 0) continue;
        const interest = balances[i] * (debts[i].rate / 100 / 12);
        totalInterestPaid += interest;
        balances[i] += interest;
        const payment = Math.min(debts[i].minPayment, balances[i]);
        balances[i] -= payment;
        if (balances[i] < 0.01) balances[i] = 0;
      }

      // Apply extra to target debt
      for (let i = 0; i < debts.length && extraLeft > 0; i++) {
        if (balances[i] <= 0) continue;
        const apply = Math.min(extraLeft, balances[i]);
        balances[i] -= apply;
        extraLeft -= apply;
        if (balances[i] < 0.01) {
          balances[i] = 0;
          if (!payoffOrder.find(p => p.name === debts[i].name)) {
            payoffOrder.push({ name: debts[i].name, month: months });
          }
        }
      }

      if (months % 1 === 0) {
        monthlyTotals.push({ month: months, total: balances.reduce((s, b) => s + b, 0) });
      }
    }

    const totalPaid = totalDebt + totalInterestPaid;

    document.getElementById('ds-stats').innerHTML = `
      <div class="stat-card highlight">
        <div class="stat-icon">&#x1F3C1;</div>
        <div class="stat-value">${CrownUtils.formatDuration(months)}</div>
        <div class="stat-label">Debt-Free In</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">&#x1F4B0;</div>
        <div class="stat-value">${CrownUtils.formatDollars(totalDebt)}</div>
        <div class="stat-label">Total Debt</div>
      </div>
      <div class="stat-card danger">
        <div class="stat-icon">&#x1F4C9;</div>
        <div class="stat-value">${CrownUtils.formatDollars(totalInterestPaid)}</div>
        <div class="stat-label">Total Interest</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">&#x1F4B3;</div>
        <div class="stat-value">${CrownUtils.formatDollars(totalMinPayment + extra)}</div>
        <div class="stat-label">Monthly Payment</div>
      </div>
    `;

    // Chart
    const chartLabels = [];
    const chartData = [];
    monthlyTotals.forEach((d, i) => {
      if (i % 3 === 0 || i === monthlyTotals.length - 1) {
        chartLabels.push(`Mo ${d.month}`);
        chartData.push(Math.round(d.total));
      }
    });

    CrownCharts.line('ds-chart', chartLabels, [
      { label: 'Remaining Debt', data: chartData, borderColor: '#E74C3C', fill: true, backgroundColor: 'rgba(231,76,60,0.1)' }
    ]);

    // Payoff order
    let orderHTML = '<table><thead><tr><th>#</th><th>Debt</th><th>Paid Off</th></tr></thead><tbody>';
    payoffOrder.forEach((p, i) => {
      orderHTML += `<tr><td>${i + 1}</td><td>${p.name}</td><td>${CrownUtils.formatDuration(p.month)}</td></tr>`;
    });
    orderHTML += '</tbody></table>';
    document.getElementById('ds-order').innerHTML = orderHTML;

    // Recommendations
    const recs = [
      { icon: '&#x1F3C6;', text: `Using the <strong>${strategy}</strong> method, you'll be debt-free in <strong>${CrownUtils.formatDuration(months)}</strong>.` },
      { icon: '&#x1F4B0;', text: `You'll pay ${CrownUtils.formatDollars(totalInterestPaid)} in interest. The ${extra > 0 ? CrownUtils.formatDollars(extra) + ' extra/month helps reduce this significantly' : 'adding extra payments would reduce this'}.` }
    ];
    if (strategy === 'snowball') {
      recs.push({ icon: '&#x1F4A1;', text: 'The avalanche method (highest rate first) may save more on interest. Try switching to compare!' });
    }
    recs.push({ icon: '&#x1F451;', text: 'Visit <strong>CrownMoney.com.au</strong> for debt reduction strategies and home loan tips.' });

    document.getElementById('ds-recommendations').innerHTML = `
      <h4>&#x1F4A1; Payoff Strategy</h4>
      ${recs.map(r => `<div class="recommendation-item"><span class="rec-icon">${r.icon}</span><span>${r.text}</span></div>`).join('')}
    `;

    document.getElementById('ds-export-pdf').onclick = () => {
      CrownExport.toPDF('Debt Payoff Plan', ['Debt', 'Balance', 'Rate', 'Paid Off In'],
        payoffOrder.map(p => {
          const d = debts.find(dd => dd.name === p.name);
          return [p.name, CrownUtils.formatDollars(d?.balance || 0), (d?.rate || 0) + '%', CrownUtils.formatDuration(p.month)];
        }), 'ds-chart');
    };

    document.getElementById('ds-results').classList.add('visible');
  }

  return { init };
})();
