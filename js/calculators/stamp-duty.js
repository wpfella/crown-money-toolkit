/**
 * Stamp Duty Calculator
 */
function getStampDutyHTML() {
  const stateOptions = Object.entries(AU.STATES).map(([k, v]) => `<option value="${k}">${v}</option>`).join('');
  return `
    <div class="page-header">
      <h2>&#x1F4CB; Stamp Duty Calculator</h2>
      <p class="page-desc">Calculate stamp duty (transfer duty) for your property purchase in any Australian state or territory.</p>
    </div>

    <div class="calc-form">
      <h3>Property Details</h3>
      <div class="form-row">
        <div class="form-group">
          <label>Property Value</label>
          <div class="input-prefix"><span class="prefix">$</span>
            <input type="number" id="sd-value" value="650000" min="0" step="1000">
          </div>
        </div>
        <div class="form-group">
          <label>State / Territory</label>
          <select id="sd-state">${stateOptions}</select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label><input type="checkbox" id="sd-firsthome"> I am a first home buyer</label>
        </div>
        <div class="form-group">
          <label><input type="checkbox" id="sd-foreign"> Foreign purchaser</label>
        </div>
      </div>

      <div class="calc-actions">
        <button class="btn btn-primary btn-lg" id="sd-calculate">Calculate Stamp Duty</button>
        <button class="btn btn-secondary" id="sd-compare">Compare All States</button>
      </div>
    </div>

    <div class="results-section" id="sd-results">
      <div class="stat-grid" id="sd-stats"></div>

      <div id="sd-concession-info"></div>

      <div class="chart-container">
        <h4>Stamp Duty by State</h4>
        <div style="height:300px;"><canvas id="sd-chart"></canvas></div>
      </div>

      <div class="recommendations" id="sd-recommendations"></div>

      <div class="export-bar">
        <span>Export your results:</span>
        <button class="btn btn-sm btn-outline" id="sd-export-pdf">&#x1F4D1; PDF</button>
        <button class="btn btn-sm btn-outline" id="sd-share">&#x1F4E4; Share</button>
      </div>
    </div>

    ${CrownUtils.adBanner()}
  `;
}

CrownCalc.StampDuty = (() => {
  let lastResult = null;

  function init() {
    document.getElementById('sd-calculate').addEventListener('click', calculate);
    document.getElementById('sd-compare').addEventListener('click', compareAllStates);
  }

  function calculate() {
    const value = CrownUtils.parseNum(document.getElementById('sd-value').value);
    const state = document.getElementById('sd-state').value;
    const isFirstHome = document.getElementById('sd-firsthome').checked;
    const isForeign = document.getElementById('sd-foreign').checked;

    if (value <= 0) return;

    lastResult = calculateStampDuty(state, value, isFirstHome, isForeign);

    const totalUpfront = lastResult.netDuty;
    const asPercent = (totalUpfront / value * 100).toFixed(2);

    document.getElementById('sd-stats').innerHTML = `
      <div class="stat-card highlight">
        <div class="stat-icon">&#x1F4B3;</div>
        <div class="stat-value">${CrownUtils.formatDollars(lastResult.netDuty)}</div>
        <div class="stat-label">Stamp Duty Payable</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">&#x1F3E0;</div>
        <div class="stat-value">${CrownUtils.formatDollars(value)}</div>
        <div class="stat-label">Property Value</div>
      </div>
      <div class="stat-card success">
        <div class="stat-icon">&#x1F389;</div>
        <div class="stat-value">${CrownUtils.formatDollars(lastResult.firstHomeDiscount)}</div>
        <div class="stat-label">First Home Saving</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">&#x1F4CA;</div>
        <div class="stat-value">${asPercent}%</div>
        <div class="stat-label">% of Property Value</div>
      </div>
    `;

    // Concession info
    let infoHTML = '';
    if (isFirstHome && lastResult.firstHomeDiscount > 0) {
      infoHTML = `<div class="alert alert-success">&#x2705; Great news! As a first home buyer in ${lastResult.state}, you save ${CrownUtils.formatDollars(lastResult.firstHomeDiscount)} in stamp duty concessions.</div>`;
    } else if (isFirstHome && lastResult.firstHomeDiscount === 0) {
      infoHTML = `<div class="alert alert-warning">&#x26A0; The property value may exceed the first home buyer concession threshold for ${lastResult.state}. Check eligibility requirements.</div>`;
    }
    if (isForeign && lastResult.foreignSurcharge > 0) {
      infoHTML += `<div class="alert alert-warning">&#x1F30F; Foreign buyer surcharge: ${CrownUtils.formatDollars(lastResult.foreignSurcharge)} (${StampDutyData[state].foreignSurcharge}%)</div>`;
    }
    document.getElementById('sd-concession-info').innerHTML = infoHTML;

    // Compare chart
    compareAllStates();

    // Recommendations
    const recs = [];
    if (!isFirstHome) {
      recs.push({ icon: '&#x1F4A1;', text: 'If this is your first home, tick the "First home buyer" box — you may be eligible for significant stamp duty concessions.' });
    }
    recs.push({ icon: '&#x1F4B0;', text: `Remember to factor stamp duty into your total purchase costs. You\'ll need ${CrownUtils.formatDollars(lastResult.netDuty)} on top of your deposit.` });
    recs.push({ icon: '&#x1F451;', text: 'Visit <strong>CrownMoney.com.au</strong> for more help with your property purchase.' });

    document.getElementById('sd-recommendations').innerHTML = `
      <h4>&#x1F4A1; Tips</h4>
      ${recs.map(r => `<div class="recommendation-item"><span class="rec-icon">${r.icon}</span><span>${r.text}</span></div>`).join('')}
    `;

    // Export
    document.getElementById('sd-export-pdf').onclick = () => {
      CrownExport.toPDF('Stamp Duty Estimate', ['Item', 'Amount'], [
        ['Property Value', CrownUtils.formatDollars(value)],
        ['State', lastResult.state],
        ['Base Stamp Duty', CrownUtils.formatDollars(lastResult.duty)],
        ['First Home Discount', '-' + CrownUtils.formatDollars(lastResult.firstHomeDiscount)],
        ['Foreign Surcharge', CrownUtils.formatDollars(lastResult.foreignSurcharge)],
        ['Total Payable', CrownUtils.formatDollars(lastResult.netDuty)]
      ], 'sd-chart');
    };
    document.getElementById('sd-share').onclick = () => {
      CrownExport.share('Stamp Duty', `Stamp duty in ${lastResult.state} for ${CrownUtils.formatDollars(value)} property: ${CrownUtils.formatDollars(lastResult.netDuty)}`);
    };

    document.getElementById('sd-results').classList.add('visible');

    CrownChat.setCalcContext('Stamp Duty', {
      propertyValue: CrownUtils.formatDollars(value),
      state: lastResult.state,
      stampDuty: CrownUtils.formatDollars(lastResult.netDuty),
      firstHomeSaving: CrownUtils.formatDollars(lastResult.firstHomeDiscount)
    });
  }

  function compareAllStates() {
    const value = CrownUtils.parseNum(document.getElementById('sd-value').value);
    const isFirstHome = document.getElementById('sd-firsthome').checked;
    if (value <= 0) return;

    const states = Object.keys(StampDutyData);
    const duties = states.map(s => {
      const r = calculateStampDuty(s, value, isFirstHome, false);
      return r.netDuty;
    });

    CrownCharts.bar('sd-chart',
      states.map(s => AU.STATES[s]),
      [{ label: 'Stamp Duty', data: duties }],
      { tooltipCallbacks: { label: (ctx) => ' ' + CrownUtils.formatDollars(ctx.parsed.y) } }
    );

    document.getElementById('sd-results').classList.add('visible');
  }

  return { init };
})();
