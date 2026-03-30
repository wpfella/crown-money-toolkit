/**
 * Extra Repayment Calculator
 */
function getExtraRepaymentHTML() {
  return `
    <div class="page-header">
      <h2>&#x1F4B8; Extra Repayments Calculator</h2>
      <p class="page-desc">See how extra repayments can help you pay off your home loan sooner and save thousands in interest.</p>
    </div>

    <div class="calc-form">
      <h3>Loan Details</h3>
      <div class="form-row">
        <div class="form-group">
          <label>Current Loan Balance</label>
          <div class="input-prefix"><span class="prefix">$</span>
            <input type="number" id="er-balance" value="500000" min="0" step="1000">
          </div>
        </div>
        <div class="form-group">
          <label>Interest Rate (% p.a.)</label>
          <div class="input-suffix"><span class="suffix">%</span>
            <input type="number" id="er-rate" value="6.20" min="0" max="20" step="0.01">
          </div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Remaining Loan Term</label>
          <select id="er-term">
            <option value="5">5 years</option>
            <option value="10">10 years</option>
            <option value="15">15 years</option>
            <option value="20">20 years</option>
            <option value="25" selected>25 years</option>
            <option value="30">30 years</option>
          </select>
        </div>
        <div class="form-group">
          <label>Extra Monthly Repayment</label>
          <div class="input-prefix"><span class="prefix">$</span>
            <input type="number" id="er-extra" value="500" min="0" step="50">
          </div>
        </div>
      </div>
      <div class="form-group">
        <label>Extra Repayment: ${CrownUtils.formatCurrency(500)}/month</label>
        <input type="range" id="er-slider" min="0" max="3000" step="50" value="500">
      </div>

      <div class="calc-actions">
        <button class="btn btn-primary btn-lg" id="er-calculate">Calculate Savings</button>
      </div>
    </div>

    <div class="results-section" id="er-results">
      <div class="stat-grid" id="er-stats"></div>

      <div class="chart-container">
        <h4>Loan Balance: Standard vs Extra Repayments</h4>
        <div style="height:300px;"><canvas id="er-chart"></canvas></div>
      </div>

      <div class="recommendations" id="er-recommendations"></div>

      <div class="export-bar">
        <span>Export:</span>
        <button class="btn btn-sm btn-outline" id="er-export-pdf">&#x1F4D1; PDF</button>
        <button class="btn btn-sm btn-outline" id="er-share">&#x1F4E4; Share</button>
      </div>
    </div>

    ${CrownUtils.adBanner()}
  `;
}

CrownCalc.ExtraRepayment = (() => {
  function init() {
    document.getElementById('er-calculate').addEventListener('click', calculate);

    const slider = document.getElementById('er-slider');
    const extraInput = document.getElementById('er-extra');
    slider.addEventListener('input', () => {
      extraInput.value = slider.value;
      slider.previousElementSibling.textContent = `Extra Repayment: ${CrownUtils.formatCurrency(parseInt(slider.value))}/month`;
    });
    extraInput.addEventListener('input', () => {
      slider.value = extraInput.value;
      slider.previousElementSibling.textContent = `Extra Repayment: ${CrownUtils.formatCurrency(CrownUtils.parseNum(extraInput.value))}/month`;
    });
  }

  function calculate() {
    const balance = CrownUtils.parseNum(document.getElementById('er-balance').value);
    const rate = parseFloat(document.getElementById('er-rate').value);
    const term = parseInt(document.getElementById('er-term').value);
    const extra = CrownUtils.parseNum(document.getElementById('er-extra').value);

    if (balance <= 0 || rate <= 0) return;

    const scheduleNormal = CrownUtils.amortizationSchedule(balance, rate, term, 0);
    const scheduleExtra = CrownUtils.amortizationSchedule(balance, rate, term, extra);

    const normalInterest = scheduleNormal[scheduleNormal.length - 1]?.totalInterest || 0;
    const extraInterest = scheduleExtra[scheduleExtra.length - 1]?.totalInterest || 0;
    const interestSaved = normalInterest - extraInterest;
    const timeSaved = scheduleNormal.length - scheduleExtra.length;

    document.getElementById('er-stats').innerHTML = `
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
        <div class="stat-icon">&#x1F4C5;</div>
        <div class="stat-value">${CrownUtils.formatDuration(scheduleExtra.length)}</div>
        <div class="stat-label">New Loan Term</div>
      </div>
      <div class="stat-card danger">
        <div class="stat-icon">&#x1F4C9;</div>
        <div class="stat-value">${CrownUtils.formatDollars(extraInterest)}</div>
        <div class="stat-label">Total Interest (with extra)</div>
      </div>
    `;

    // Chart
    const maxMonths = scheduleNormal.length;
    const labels = [];
    const normalData = [];
    const extraData = [];
    for (let m = 0; m <= maxMonths; m += 12) {
      const year = m / 12;
      labels.push(`Year ${year}`);
      const ni = m > 0 && m <= scheduleNormal.length ? scheduleNormal[m - 1].balance : (m === 0 ? balance : 0);
      const ei = m > 0 && m <= scheduleExtra.length ? scheduleExtra[m - 1].balance : (m === 0 ? balance : 0);
      normalData.push(Math.round(ni));
      extraData.push(Math.round(ei));
    }

    CrownCharts.line('er-chart', labels, [
      { label: 'Standard Repayments', data: normalData, borderColor: '#E74C3C' },
      { label: `With $${extra}/mo Extra`, data: extraData, borderColor: '#27AE60' }
    ]);

    // Recommendations
    const recs = [
      { icon: '&#x1F4A1;', text: `Paying ${CrownUtils.formatCurrency(extra)} extra per month saves you <strong>${CrownUtils.formatDollars(interestSaved)}</strong> in interest and knocks <strong>${CrownUtils.formatDuration(timeSaved)}</strong> off your loan!` }
    ];
    if (extra < 200) {
      recs.push({ icon: '&#x1F4B8;', text: 'Even small extra repayments make a big difference. Try increasing to $200-$500/month to accelerate your payoff.' });
    }
    recs.push({ icon: '&#x1F451;', text: 'Visit <strong>CrownMoney.com.au</strong> for more strategies to pay off your home loan sooner.' });

    document.getElementById('er-recommendations').innerHTML = `
      <h4>&#x1F4A1; Your Savings</h4>
      ${recs.map(r => `<div class="recommendation-item"><span class="rec-icon">${r.icon}</span><span>${r.text}</span></div>`).join('')}
    `;

    document.getElementById('er-export-pdf').onclick = () => {
      CrownExport.toPDF('Extra Repayments Analysis', ['Item', 'Value'], [
        ['Loan Balance', CrownUtils.formatDollars(balance)],
        ['Interest Rate', rate + '%'],
        ['Extra Monthly', CrownUtils.formatCurrency(extra)],
        ['Interest Saved', CrownUtils.formatDollars(interestSaved)],
        ['Time Saved', CrownUtils.formatDuration(timeSaved)]
      ], 'er-chart');
    };
    document.getElementById('er-share').onclick = () => {
      CrownExport.share('Extra Repayments', `By paying ${CrownUtils.formatCurrency(extra)} extra/month on my ${CrownUtils.formatDollars(balance)} loan, I can save ${CrownUtils.formatDollars(interestSaved)} and pay it off ${CrownUtils.formatDuration(timeSaved)} sooner!`);
    };

    document.getElementById('er-results').classList.add('visible');

    CrownChat.setCalcContext('Extra Repayments', {
      balance: CrownUtils.formatDollars(balance), extra: CrownUtils.formatCurrency(extra),
      interestSaved: CrownUtils.formatDollars(interestSaved), timeSaved: CrownUtils.formatDuration(timeSaved)
    });
  }

  return { init };
})();
