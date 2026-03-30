/**
 * Savings Goal Calculator
 */
function getSavingsGoalHTML() {
  return `
    <div class="page-header">
      <h2>&#x1F3AF; Savings Goal Calculator</h2>
      <p class="page-desc">Plan how to reach your savings target with regular contributions.</p>
    </div>

    <div class="calc-form">
      <h3>Your Goal</h3>
      <div class="form-row">
        <div class="form-group">
          <label>Savings Goal</label>
          <div class="input-prefix"><span class="prefix">$</span>
            <input type="number" id="sg-goal" value="50000" min="0" step="1000">
          </div>
        </div>
        <div class="form-group">
          <label>Current Savings</label>
          <div class="input-prefix"><span class="prefix">$</span>
            <input type="number" id="sg-current" value="5000" min="0" step="500">
          </div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Monthly Contribution</label>
          <div class="input-prefix"><span class="prefix">$</span>
            <input type="number" id="sg-monthly" value="1000" min="0" step="50">
          </div>
        </div>
        <div class="form-group">
          <label>Interest Rate on Savings (% p.a.)</label>
          <div class="input-suffix"><span class="suffix">%</span>
            <input type="number" id="sg-rate" value="4.5" min="0" max="15" step="0.1">
          </div>
        </div>
      </div>
      <div class="form-group">
        <label>Target Date (optional)</label>
        <input type="date" id="sg-target-date">
      </div>

      <div class="calc-actions">
        <button class="btn btn-primary btn-lg" id="sg-calculate">Calculate</button>
      </div>
    </div>

    <div class="results-section" id="sg-results">
      <div class="stat-grid" id="sg-stats"></div>
      <div class="chart-container">
        <h4>Savings Progress</h4>
        <div style="height:300px;"><canvas id="sg-chart"></canvas></div>
      </div>
      <div class="recommendations" id="sg-recommendations"></div>
      <div class="export-bar">
        <span>Export:</span>
        <button class="btn btn-sm btn-outline" id="sg-export-pdf">&#x1F4D1; PDF</button>
        <button class="btn btn-sm btn-outline" id="sg-share">&#x1F4E4; Share</button>
      </div>
    </div>
    ${CrownUtils.adBanner()}
  `;
}

CrownCalc.SavingsGoal = (() => {
  function init() {
    document.getElementById('sg-calculate').addEventListener('click', calculate);
  }

  function calculate() {
    const goal = CrownUtils.parseNum(document.getElementById('sg-goal').value);
    const current = CrownUtils.parseNum(document.getElementById('sg-current').value);
    const monthly = CrownUtils.parseNum(document.getElementById('sg-monthly').value);
    const rate = parseFloat(document.getElementById('sg-rate').value) / 100;
    const targetDate = document.getElementById('sg-target-date').value;

    if (goal <= 0 || monthly <= 0) return;

    const monthlyRate = rate / 12;
    const needed = goal - current;

    // Calculate months to reach goal
    let balance = current;
    let months = 0;
    let totalInterest = 0;
    const monthlyData = [];

    while (balance < goal && months < 600) {
      months++;
      const interest = balance * monthlyRate;
      totalInterest += interest;
      balance += interest + monthly;
      if (months % 1 === 0) {
        monthlyData.push({ month: months, balance: Math.min(balance, goal), deposits: current + monthly * months });
      }
    }

    const totalDeposits = current + monthly * months;

    // If target date provided
    let targetInfo = '';
    if (targetDate) {
      const today = new Date();
      const target = new Date(targetDate);
      const targetMonths = Math.max(1, Math.round((target - today) / (1000 * 60 * 60 * 24 * 30)));
      const neededMonthly = needed > 0 ? (needed * monthlyRate * Math.pow(1 + monthlyRate, targetMonths)) / (Math.pow(1 + monthlyRate, targetMonths) - 1) : 0;
      targetInfo = `To reach your goal by ${target.toLocaleDateString('en-AU')} (${targetMonths} months), you'd need to save <strong>${CrownUtils.formatCurrency(Math.max(0, neededMonthly))}</strong> per month.`;
    }

    document.getElementById('sg-stats').innerHTML = `
      <div class="stat-card highlight">
        <div class="stat-icon">&#x1F3AF;</div>
        <div class="stat-value">${CrownUtils.formatDuration(months)}</div>
        <div class="stat-label">Time to Goal</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">&#x1F4B0;</div>
        <div class="stat-value">${CrownUtils.formatDollars(goal)}</div>
        <div class="stat-label">Savings Goal</div>
      </div>
      <div class="stat-card success">
        <div class="stat-icon">&#x1F4C8;</div>
        <div class="stat-value">${CrownUtils.formatDollars(totalInterest)}</div>
        <div class="stat-label">Interest Earned</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">&#x1F4CA;</div>
        <div class="stat-value">${((current / goal) * 100).toFixed(1)}%</div>
        <div class="stat-label">Current Progress</div>
      </div>
    `;

    // Chart
    const labels = [];
    const balanceData = [];
    const goalLine = [];
    monthlyData.forEach((d, i) => {
      if (i % 3 === 0 || i === monthlyData.length - 1) {
        labels.push(`Mo ${d.month}`);
        balanceData.push(Math.round(d.balance));
        goalLine.push(goal);
      }
    });

    CrownCharts.line('sg-chart', labels, [
      { label: 'Your Savings', data: balanceData, borderColor: '#27AE60', fill: true, backgroundColor: 'rgba(39,174,96,0.1)' },
      { label: 'Goal', data: goalLine, borderColor: '#D4A843', borderDash: [8, 4], fill: false, pointRadius: 0 }
    ]);

    const recs = [];
    if (targetInfo) {
      recs.push({ icon: '&#x1F4C5;', text: targetInfo });
    }
    recs.push({ icon: '&#x1F4A1;', text: `At ${CrownUtils.formatCurrency(monthly)}/month, you\'ll reach ${CrownUtils.formatDollars(goal)} in ${CrownUtils.formatDuration(months)}. Interest contributes ${CrownUtils.formatDollars(totalInterest)} to your goal.` });

    if (rate < AU.RATES.AVG_SAVINGS_ACCOUNT) {
      recs.push({ icon: '&#x1F50D;', text: `Your rate of ${(rate * 100).toFixed(1)}% is below the average savings rate of ${AU.RATES.AVG_SAVINGS_ACCOUNT}%. Shop around for a better high-interest savings account.` });
    }
    recs.push({ icon: '&#x1F451;', text: 'Visit <strong>CrownMoney.com.au</strong> for tips on reaching your savings goals faster.' });

    document.getElementById('sg-recommendations').innerHTML = `
      <h4>&#x1F4A1; Savings Tips</h4>
      ${recs.map(r => `<div class="recommendation-item"><span class="rec-icon">${r.icon}</span><span>${r.text}</span></div>`).join('')}
    `;

    document.getElementById('sg-export-pdf').onclick = () => {
      CrownExport.toPDF('Savings Goal Plan', ['Item', 'Value'], [
        ['Goal', CrownUtils.formatDollars(goal)],
        ['Current Savings', CrownUtils.formatDollars(current)],
        ['Monthly Contribution', CrownUtils.formatCurrency(monthly)],
        ['Time to Goal', CrownUtils.formatDuration(months)],
        ['Interest Earned', CrownUtils.formatDollars(totalInterest)]
      ], 'sg-chart');
    };
    document.getElementById('sg-share').onclick = () => {
      CrownExport.share('Savings Goal', `Saving ${CrownUtils.formatCurrency(monthly)}/month to reach my ${CrownUtils.formatDollars(goal)} goal in ${CrownUtils.formatDuration(months)}!`);
    };

    document.getElementById('sg-results').classList.add('visible');
  }

  return { init };
})();
