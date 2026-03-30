/**
 * Budget Planner Calculator
 */
function getBudgetPlannerHTML() {
  return `
    <div class="page-header">
      <h2>&#x1F4B0; Budget Planner</h2>
      <p class="page-desc">Track your income and expenses to understand your cash flow and find savings opportunities.</p>
    </div>

    <div class="calc-form">
      <h3>Income (Monthly)</h3>
      <div class="form-row">
        <div class="form-group">
          <label>Take-Home Salary</label>
          <div class="input-prefix"><span class="prefix">$</span>
            <input type="number" id="bp-salary" value="5500" min="0" step="100">
          </div>
        </div>
        <div class="form-group">
          <label>Partner's Income</label>
          <div class="input-prefix"><span class="prefix">$</span>
            <input type="number" id="bp-partner" value="0" min="0" step="100">
          </div>
        </div>
        <div class="form-group">
          <label>Other Income</label>
          <div class="input-prefix"><span class="prefix">$</span>
            <input type="number" id="bp-other-income" value="0" min="0" step="50">
          </div>
        </div>
      </div>
    </div>

    <div class="calc-form">
      <h3>Expenses (Monthly)</h3>
      <div id="bp-expenses">
        <div class="budget-category">
          <div class="budget-category-header"><span>&#x1F3E0; Housing</span><span class="cat-total" data-cat="housing">$0</span></div>
          <div class="budget-items">
            <div class="budget-row"><label>Mortgage/Rent</label><div class="input-prefix"><span class="prefix">$</span><input type="number" data-cat="housing" class="bp-exp" value="2200" min="0" step="50"></div></div>
            <div class="budget-row"><label>Council Rates</label><div class="input-prefix"><span class="prefix">$</span><input type="number" data-cat="housing" class="bp-exp" value="160" min="0" step="10"></div></div>
            <div class="budget-row"><label>Home Insurance</label><div class="input-prefix"><span class="prefix">$</span><input type="number" data-cat="housing" class="bp-exp" value="120" min="0" step="10"></div></div>
            <div class="budget-row"><label>Maintenance</label><div class="input-prefix"><span class="prefix">$</span><input type="number" data-cat="housing" class="bp-exp" value="100" min="0" step="10"></div></div>
          </div>
        </div>

        <div class="budget-category">
          <div class="budget-category-header"><span>&#x1F697; Transport</span><span class="cat-total" data-cat="transport">$0</span></div>
          <div class="budget-items">
            <div class="budget-row"><label>Car Loan/Lease</label><div class="input-prefix"><span class="prefix">$</span><input type="number" data-cat="transport" class="bp-exp" value="450" min="0" step="50"></div></div>
            <div class="budget-row"><label>Fuel</label><div class="input-prefix"><span class="prefix">$</span><input type="number" data-cat="transport" class="bp-exp" value="200" min="0" step="10"></div></div>
            <div class="budget-row"><label>Rego & Insurance</label><div class="input-prefix"><span class="prefix">$</span><input type="number" data-cat="transport" class="bp-exp" value="150" min="0" step="10"></div></div>
            <div class="budget-row"><label>Public Transport</label><div class="input-prefix"><span class="prefix">$</span><input type="number" data-cat="transport" class="bp-exp" value="0" min="0" step="10"></div></div>
          </div>
        </div>

        <div class="budget-category">
          <div class="budget-category-header"><span>&#x1F6D2; Living</span><span class="cat-total" data-cat="living">$0</span></div>
          <div class="budget-items">
            <div class="budget-row"><label>Groceries</label><div class="input-prefix"><span class="prefix">$</span><input type="number" data-cat="living" class="bp-exp" value="600" min="0" step="50"></div></div>
            <div class="budget-row"><label>Utilities</label><div class="input-prefix"><span class="prefix">$</span><input type="number" data-cat="living" class="bp-exp" value="250" min="0" step="10"></div></div>
            <div class="budget-row"><label>Phone & Internet</label><div class="input-prefix"><span class="prefix">$</span><input type="number" data-cat="living" class="bp-exp" value="120" min="0" step="10"></div></div>
            <div class="budget-row"><label>Health & Medical</label><div class="input-prefix"><span class="prefix">$</span><input type="number" data-cat="living" class="bp-exp" value="150" min="0" step="10"></div></div>
          </div>
        </div>

        <div class="budget-category">
          <div class="budget-category-header"><span>&#x1F3AC; Lifestyle</span><span class="cat-total" data-cat="lifestyle">$0</span></div>
          <div class="budget-items">
            <div class="budget-row"><label>Dining Out</label><div class="input-prefix"><span class="prefix">$</span><input type="number" data-cat="lifestyle" class="bp-exp" value="200" min="0" step="20"></div></div>
            <div class="budget-row"><label>Entertainment</label><div class="input-prefix"><span class="prefix">$</span><input type="number" data-cat="lifestyle" class="bp-exp" value="100" min="0" step="10"></div></div>
            <div class="budget-row"><label>Subscriptions</label><div class="input-prefix"><span class="prefix">$</span><input type="number" data-cat="lifestyle" class="bp-exp" value="80" min="0" step="10"></div></div>
            <div class="budget-row"><label>Clothing</label><div class="input-prefix"><span class="prefix">$</span><input type="number" data-cat="lifestyle" class="bp-exp" value="100" min="0" step="10"></div></div>
          </div>
        </div>

        <div class="budget-category">
          <div class="budget-category-header"><span>&#x1F4DA; Other</span><span class="cat-total" data-cat="other">$0</span></div>
          <div class="budget-items">
            <div class="budget-row"><label>Childcare/Education</label><div class="input-prefix"><span class="prefix">$</span><input type="number" data-cat="other" class="bp-exp" value="0" min="0" step="50"></div></div>
            <div class="budget-row"><label>Personal Insurance</label><div class="input-prefix"><span class="prefix">$</span><input type="number" data-cat="other" class="bp-exp" value="0" min="0" step="10"></div></div>
            <div class="budget-row"><label>Savings/Investments</label><div class="input-prefix"><span class="prefix">$</span><input type="number" data-cat="other" class="bp-exp" value="300" min="0" step="50"></div></div>
            <div class="budget-row"><label>Other</label><div class="input-prefix"><span class="prefix">$</span><input type="number" data-cat="other" class="bp-exp" value="100" min="0" step="10"></div></div>
          </div>
        </div>
      </div>

      <div class="calc-actions">
        <button class="btn btn-primary btn-lg" id="bp-calculate">Analyse Budget</button>
        <button class="btn btn-secondary" id="bp-save">Save Budget</button>
      </div>
    </div>

    <div class="results-section" id="bp-results">
      <div class="stat-grid" id="bp-stats"></div>
      <div class="comparison-grid">
        <div class="chart-container">
          <h4>Income vs Expenses</h4>
          <div style="height:250px;"><canvas id="bp-bar-chart"></canvas></div>
        </div>
        <div class="chart-container">
          <h4>Expense Breakdown</h4>
          <div style="height:250px;"><canvas id="bp-pie-chart"></canvas></div>
        </div>
      </div>
      <div class="recommendations" id="bp-recommendations"></div>
      <div class="export-bar">
        <span>Export:</span>
        <button class="btn btn-sm btn-outline" id="bp-export-csv">&#x1F4C4; CSV</button>
        <button class="btn btn-sm btn-outline" id="bp-export-pdf">&#x1F4D1; PDF</button>
      </div>
    </div>
    ${CrownUtils.adBanner()}
  `;
}

CrownCalc.BudgetPlanner = (() => {
  function init() {
    document.getElementById('bp-calculate').addEventListener('click', calculate);
    document.getElementById('bp-save').addEventListener('click', saveBudget);

    // Live category totals
    document.querySelectorAll('.bp-exp').forEach(input => {
      input.addEventListener('input', updateCategoryTotals);
    });
    updateCategoryTotals();
    loadBudget();
  }

  function updateCategoryTotals() {
    const cats = {};
    document.querySelectorAll('.bp-exp').forEach(input => {
      const cat = input.dataset.cat;
      if (!cats[cat]) cats[cat] = 0;
      cats[cat] += CrownUtils.parseNum(input.value);
    });
    Object.entries(cats).forEach(([cat, total]) => {
      const el = document.querySelector(`.cat-total[data-cat="${cat}"]`);
      if (el) el.textContent = CrownUtils.formatDollars(total);
    });
  }

  function calculate() {
    const salary = CrownUtils.parseNum(document.getElementById('bp-salary').value);
    const partner = CrownUtils.parseNum(document.getElementById('bp-partner').value);
    const otherIncome = CrownUtils.parseNum(document.getElementById('bp-other-income').value);
    const totalIncome = salary + partner + otherIncome;

    const categories = {};
    let totalExpenses = 0;
    document.querySelectorAll('.bp-exp').forEach(input => {
      const cat = input.dataset.cat;
      const val = CrownUtils.parseNum(input.value);
      if (!categories[cat]) categories[cat] = 0;
      categories[cat] += val;
      totalExpenses += val;
    });

    const surplus = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (surplus / totalIncome * 100) : 0;

    document.getElementById('bp-stats').innerHTML = `
      <div class="stat-card">
        <div class="stat-icon">&#x1F4B5;</div>
        <div class="stat-value">${CrownUtils.formatDollars(totalIncome)}</div>
        <div class="stat-label">Monthly Income</div>
      </div>
      <div class="stat-card danger">
        <div class="stat-icon">&#x1F4B8;</div>
        <div class="stat-value">${CrownUtils.formatDollars(totalExpenses)}</div>
        <div class="stat-label">Monthly Expenses</div>
      </div>
      <div class="stat-card ${surplus >= 0 ? 'success' : 'danger'}">
        <div class="stat-icon">${surplus >= 0 ? '&#x2705;' : '&#x274C;'}</div>
        <div class="stat-value">${CrownUtils.formatDollars(surplus)}</div>
        <div class="stat-label">Monthly ${surplus >= 0 ? 'Surplus' : 'Deficit'}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">&#x1F4CA;</div>
        <div class="stat-value">${savingsRate.toFixed(1)}%</div>
        <div class="stat-label">Savings Rate</div>
      </div>
    `;

    // Charts
    CrownCharts.bar('bp-bar-chart',
      ['Monthly'],
      [
        { label: 'Income', data: [totalIncome], backgroundColor: '#27AE60' },
        { label: 'Expenses', data: [totalExpenses], backgroundColor: '#E74C3C' }
      ]
    );

    const catNames = { housing: 'Housing', transport: 'Transport', living: 'Living', lifestyle: 'Lifestyle', other: 'Other' };
    CrownCharts.doughnut('bp-pie-chart',
      Object.keys(categories).map(k => catNames[k] || k),
      Object.values(categories).map(Math.round)
    );

    // Recommendations
    const recs = [];
    if (surplus < 0) {
      recs.push({ icon: '&#x26A0;', text: `You\'re spending ${CrownUtils.formatDollars(Math.abs(surplus))} more than you earn each month. Look for areas to cut back.` });
    }
    if (savingsRate < 20 && surplus > 0) {
      recs.push({ icon: '&#x1F4A1;', text: `Your savings rate is ${savingsRate.toFixed(1)}%. The 50/30/20 rule suggests saving at least 20% of income. Try to increase your savings by ${CrownUtils.formatDollars(totalIncome * 0.2 - surplus)}/month.` });
    }
    if (categories.lifestyle > totalIncome * 0.3) {
      recs.push({ icon: '&#x1F3AC;', text: 'Your lifestyle spending is over 30% of income. Small cuts here can add up to big savings.' });
    }
    if (surplus > 500) {
      recs.push({ icon: '&#x1F4B0;', text: `Great work! Your ${CrownUtils.formatDollars(surplus)} surplus could go towards extra mortgage repayments — saving you thousands in interest.` });
    }
    recs.push({ icon: '&#x1F451;', text: 'Visit <strong>CrownMoney.com.au</strong> for budgeting tips tailored to Australian households.' });

    document.getElementById('bp-recommendations').innerHTML = `
      <h4>&#x1F4A1; Budget Insights</h4>
      ${recs.map(r => `<div class="recommendation-item"><span class="rec-icon">${r.icon}</span><span>${r.text}</span></div>`).join('')}
    `;

    document.getElementById('bp-export-csv').onclick = () => {
      const headers = ['Category', 'Monthly', 'Annual'];
      const rows = Object.entries(categories).map(([k, v]) => [catNames[k], v.toFixed(2), (v * 12).toFixed(2)]);
      rows.unshift(['Total Income', totalIncome.toFixed(2), (totalIncome * 12).toFixed(2)]);
      rows.push(['Surplus/Deficit', surplus.toFixed(2), (surplus * 12).toFixed(2)]);
      CrownExport.toCSV('Budget_Plan', headers, rows);
    };

    document.getElementById('bp-export-pdf').onclick = () => {
      const rows = Object.entries(categories).map(([k, v]) => [catNames[k], CrownUtils.formatDollars(v), CrownUtils.formatDollars(v * 12)]);
      rows.unshift(['Total Income', CrownUtils.formatDollars(totalIncome), CrownUtils.formatDollars(totalIncome * 12)]);
      rows.push(['Surplus/Deficit', CrownUtils.formatDollars(surplus), CrownUtils.formatDollars(surplus * 12)]);
      CrownExport.toPDF('Budget Plan', ['Category', 'Monthly', 'Annual'], rows, 'bp-pie-chart');
    };

    document.getElementById('bp-results').classList.add('visible');
  }

  async function saveBudget() {
    const data = {};
    document.querySelectorAll('.bp-exp').forEach((input, i) => { data['exp_' + i] = input.value; });
    data.salary = document.getElementById('bp-salary').value;
    data.partner = document.getElementById('bp-partner').value;
    data.otherIncome = document.getElementById('bp-other-income').value;
    await CrownStorage.set('budget_planner', data);
    alert('Budget saved successfully!');
  }

  async function loadBudget() {
    const data = await CrownStorage.get('budget_planner');
    if (!data) return;
    if (data.salary) document.getElementById('bp-salary').value = data.salary;
    if (data.partner) document.getElementById('bp-partner').value = data.partner;
    if (data.otherIncome) document.getElementById('bp-other-income').value = data.otherIncome;
    document.querySelectorAll('.bp-exp').forEach((input, i) => {
      if (data['exp_' + i] !== undefined) input.value = data['exp_' + i];
    });
    updateCategoryTotals();
  }

  return { init };
})();
