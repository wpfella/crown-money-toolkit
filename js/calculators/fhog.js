/**
 * First Home Owner Grant Calculator
 */
function getFHOGHTML() {
  const stateOptions = Object.entries(AU.STATES).map(([k, v]) => `<option value="${k}">${v}</option>`).join('');
  return `
    <div class="page-header">
      <h2>&#x1F3C6; First Home Owner Grant (FHOG)</h2>
      <p class="page-desc">Check your eligibility for the First Home Owner Grant and related state concessions.</p>
    </div>

    <div class="calc-form">
      <h3>Your Details</h3>
      <div class="form-row">
        <div class="form-group">
          <label>State / Territory</label>
          <select id="fhog-state">${stateOptions}</select>
        </div>
        <div class="form-group">
          <label>Property Value</label>
          <div class="input-prefix"><span class="prefix">$</span>
            <input type="number" id="fhog-value" value="550000" min="0" step="5000">
          </div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Property Type</label>
          <select id="fhog-type">
            <option value="new" selected>New build / off-the-plan</option>
            <option value="existing">Existing property</option>
          </select>
        </div>
        <div class="form-group">
          <label><input type="checkbox" id="fhog-citizen" checked> Australian citizen or permanent resident</label>
          <label class="mt-sm"><input type="checkbox" id="fhog-18" checked> Aged 18 or over</label>
          <label class="mt-sm"><input type="checkbox" id="fhog-never-owned" checked> Never owned property in Australia</label>
        </div>
      </div>

      <div class="calc-actions">
        <button class="btn btn-primary btn-lg" id="fhog-check">Check Eligibility</button>
      </div>
    </div>

    <div class="results-section" id="fhog-results">
      <div id="fhog-eligibility"></div>
      <div class="stat-grid" id="fhog-stats"></div>
      <div class="card mt-lg" id="fhog-details"></div>
      <div class="card mt-lg" id="fhog-schemes"></div>
      <div class="recommendations" id="fhog-recommendations"></div>
      <div class="export-bar">
        <span>Export:</span>
        <button class="btn btn-sm btn-outline" id="fhog-export-pdf">&#x1F4D1; PDF</button>
        <button class="btn btn-sm btn-outline" id="fhog-share">&#x1F4E4; Share</button>
      </div>
    </div>
    ${CrownUtils.adBanner()}
  `;
}

CrownCalc.FHOG = (() => {
  function init() {
    document.getElementById('fhog-check').addEventListener('click', check);
  }

  function check() {
    const state = document.getElementById('fhog-state').value;
    const value = CrownUtils.parseNum(document.getElementById('fhog-value').value);
    const propType = document.getElementById('fhog-type').value;
    const citizen = document.getElementById('fhog-citizen').checked;
    const over18 = document.getElementById('fhog-18').checked;
    const neverOwned = document.getElementById('fhog-never-owned').checked;

    const stateData = FHOGData[state];
    if (!stateData) return;

    const basicEligible = citizen && over18 && neverOwned;
    const isNewBuild = propType === 'new';
    const withinCap = value <= stateData.propertyValueCap || stateData.propertyValueCap === Infinity;
    const meetsType = isNewBuild || !stateData.newBuildOnly;

    const eligible = basicEligible && withinCap && meetsType;
    let grantAmount = eligible ? stateData.grantAmount : 0;

    // Regional bonus (VIC)
    if (eligible && stateData.regionalBonus) {
      grantAmount = stateData.grantAmount; // Base grant, regional bonus requires regional location
    }

    // Build bonus (NT)
    if (eligible && stateData.buildBonus && isNewBuild) {
      grantAmount += stateData.buildBonus;
    }

    // Stamp duty concession
    const stampDuty = calculateStampDuty(state, value, true, false);

    document.getElementById('fhog-eligibility').innerHTML = eligible
      ? `<div class="alert alert-success">&#x2705; <strong>Congratulations!</strong> Based on your inputs, you appear to be eligible for the First Home Owner Grant in ${stateData.name}.</div>`
      : `<div class="alert alert-warning">&#x26A0; <strong>Not eligible.</strong> Based on your inputs, you may not qualify for the FHOG. ${!meetsType ? 'The grant may only be available for new builds.' : ''} ${!withinCap ? `Property value exceeds the cap of ${CrownUtils.formatDollars(stateData.propertyValueCap)}.` : ''} ${!basicEligible ? 'Please check the eligibility criteria below.' : ''}</div>`;

    document.getElementById('fhog-stats').innerHTML = `
      <div class="stat-card ${eligible ? 'highlight' : ''}">
        <div class="stat-icon">&#x1F3C6;</div>
        <div class="stat-value">${CrownUtils.formatDollars(grantAmount)}</div>
        <div class="stat-label">FHOG Amount</div>
      </div>
      <div class="stat-card success">
        <div class="stat-icon">&#x1F4CB;</div>
        <div class="stat-value">${CrownUtils.formatDollars(stampDuty.firstHomeDiscount)}</div>
        <div class="stat-label">Stamp Duty Saving</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">&#x1F4B0;</div>
        <div class="stat-value">${CrownUtils.formatDollars(grantAmount + stampDuty.firstHomeDiscount)}</div>
        <div class="stat-label">Total Benefit</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">&#x1F4B3;</div>
        <div class="stat-value">${CrownUtils.formatDollars(stampDuty.netDuty)}</div>
        <div class="stat-label">Stamp Duty Payable</div>
      </div>
    `;

    // Eligibility details
    document.getElementById('fhog-details').innerHTML = `
      <h4>Eligibility Criteria — ${stateData.name}</h4>
      <ul style="list-style:none;padding:0;">
        ${stateData.eligibility.map(e => `<li style="padding:6px 0;font-size:14px;">&#x2022; ${e}</li>`).join('')}
      </ul>
    `;

    // Additional schemes
    if (stateData.additionalSchemes && stateData.additionalSchemes.length > 0) {
      document.getElementById('fhog-schemes').innerHTML = `
        <h4>Additional Schemes in ${stateData.name}</h4>
        ${stateData.additionalSchemes.map(s => `
          <div style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
            <strong style="color:#1A1A2E;">${s.name}</strong>
            <p style="font-size:13px;color:#666;margin:4px 0 0;">${s.desc}</p>
          </div>
        `).join('')}
      `;
    }

    const recs = [
      { icon: '&#x1F4A1;', text: `In ${stateData.name}, first home buyers can access up to ${CrownUtils.formatDollars(grantAmount + stampDuty.firstHomeDiscount)} in grants and concessions.` },
      { icon: '&#x1F4B0;', text: 'Remember: FHOG typically must be applied for by your solicitor/conveyancer at settlement.' },
      { icon: '&#x1F451;', text: 'Visit <strong>CrownMoney.com.au</strong> for a complete guide to buying your first home in Australia.' }
    ];

    document.getElementById('fhog-recommendations').innerHTML = `
      <h4>&#x1F4A1; First Home Tips</h4>
      ${recs.map(r => `<div class="recommendation-item"><span class="rec-icon">${r.icon}</span><span>${r.text}</span></div>`).join('')}
    `;

    document.getElementById('fhog-export-pdf').onclick = () => {
      CrownExport.toPDF('First Home Owner Grant Assessment', ['Item', 'Details'], [
        ['State', stateData.name],
        ['Property Value', CrownUtils.formatDollars(value)],
        ['Eligible', eligible ? 'Yes' : 'No'],
        ['FHOG Amount', CrownUtils.formatDollars(grantAmount)],
        ['Stamp Duty Saving', CrownUtils.formatDollars(stampDuty.firstHomeDiscount)],
        ['Total Benefit', CrownUtils.formatDollars(grantAmount + stampDuty.firstHomeDiscount)]
      ]);
    };
    document.getElementById('fhog-share').onclick = () => {
      CrownExport.share('FHOG', `First Home Owner Grant in ${stateData.name}: ${CrownUtils.formatDollars(grantAmount)} grant + ${CrownUtils.formatDollars(stampDuty.firstHomeDiscount)} stamp duty saving = ${CrownUtils.formatDollars(grantAmount + stampDuty.firstHomeDiscount)} total benefit!`);
    };

    document.getElementById('fhog-results').classList.add('visible');
  }

  return { init };
})();
