/**
 * Settings Page — Multi-provider AI + Data Management
 */
function getSettingsHTML() {
  return `
    <div class="page-header">
      <h2>&#x2699; Settings</h2>
      <p class="page-desc">Configure your Crown Money Financial Toolkit preferences.</p>
    </div>

    <div class="calc-form">
      <h3>&#x1F916; AI Assistant</h3>
      <div class="alert alert-info" style="margin-bottom:16px;">
        &#x2139; All calculators work without an API key. The <strong>built-in assistant</strong> answers common Australian financial questions for free. Connect an AI provider below for <strong>advanced conversational AI</strong> that can deeply analyse your calculator results.
      </div>

      <div class="form-group">
        <label>AI Provider</label>
        <select id="settings-provider">
          <option value="">Built-in Only (no key required)</option>
          <option value="openai">OpenAI (GPT-4o)</option>
          <option value="anthropic">Anthropic (Claude)</option>
          <option value="gemini">Google Gemini</option>
        </select>
      </div>

      <div id="settings-provider-config" style="display:none;">
        <div class="form-group">
          <label>API Key</label>
          <input type="password" id="settings-api-key" placeholder="Enter your API key...">
          <div class="form-hint" id="settings-key-hint">Your key is stored locally and never shared with anyone except your chosen provider.</div>
        </div>
        <div class="form-group">
          <label>Model</label>
          <select id="settings-ai-model"></select>
        </div>
        <div class="btn-group">
          <button class="btn btn-primary" id="settings-save-key">Save & Connect</button>
          <button class="btn btn-danger btn-sm" id="settings-remove-key">Disconnect</button>
        </div>
      </div>

      <div id="settings-provider-info" class="mt-md" style="font-size:13px;color:#666;"></div>
    </div>

    <div class="calc-form">
      <h3>&#x1F4BE; Data Management</h3>
      <p style="font-size:14px;color:#666;margin-bottom:16px;">Your calculator data is stored locally in your browser. You can export or clear it below.</p>
      <div class="btn-group">
        <button class="btn btn-secondary" id="settings-export-data">Export All Data</button>
        <button class="btn btn-secondary" id="settings-import-data">Import Data</button>
        <button class="btn btn-danger" id="settings-clear-data">Clear All Data</button>
      </div>
      <input type="file" id="settings-import-file" accept=".json" style="display:none;">
    </div>

    <div class="calc-form">
      <h3>&#x1F4CA; Default Values</h3>
      <div class="form-row">
        <div class="form-group">
          <label>Default State</label>
          <select id="settings-state">
            ${Object.entries(AU.STATES).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Default Interest Rate (%)</label>
          <div class="input-suffix"><span class="suffix">%</span>
            <input type="number" id="settings-rate" value="6.20" min="0" max="20" step="0.01">
          </div>
        </div>
      </div>
      <button class="btn btn-primary" id="settings-save-defaults">Save Defaults</button>
    </div>

    <div class="calc-form">
      <h3>&#x1F512; Privacy & Security</h3>
      <p style="font-size:14px;color:#666;line-height:1.6;">
        <strong>Your data stays on your device.</strong> Crown Money Financial Toolkit stores all calculator data and preferences locally in your browser. No data is sent to CrownMoney.com.au or any third party.<br><br>
        <strong>AI API keys:</strong> If you connect an AI provider, your API key is stored locally and only used to communicate directly with your chosen provider (OpenAI, Anthropic, or Google). We never see, store, or have access to your API keys.<br><br>
        <strong>No tracking.</strong> This extension does not collect analytics, usage data, or personal information of any kind.
      </p>
    </div>

    <div class="calc-form">
      <h3>About</h3>
      <p style="font-size:14px;color:#666;">
        <strong>Crown Money Financial Toolkit</strong> v1.0.0<br>
        Built for hardworking Australians by <a href="https://crownmoney.com.au" target="_blank" style="color:#D4A843;font-weight:600;">CrownMoney.com.au</a><br><br>
        All calculators provide general information only and should not be considered personal financial advice. Please consult a licensed financial adviser before making major financial decisions.<br><br>
        Tax brackets, stamp duty rates, and FHOG data are current as of FY 2025-2026. Rates and thresholds may change — always verify with official government sources.
      </p>
    </div>

    ${CrownUtils.adBanner()}
  `;
}

CrownCalc.Settings = (() => {
  const PROVIDER_INFO = {
    openai: {
      hint: 'Get your key at <strong>platform.openai.com/api-keys</strong> — starts with <code>sk-</code>',
      placeholder: 'sk-...',
      models: [
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini (fast & affordable)' },
        { id: 'gpt-4o', name: 'GPT-4o (most capable)' },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' }
      ]
    },
    anthropic: {
      hint: 'Get your key at <strong>console.anthropic.com</strong> — starts with <code>sk-ant-</code>',
      placeholder: 'sk-ant-...',
      models: [
        { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6 (balanced)' },
        { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5 (fast)' }
      ]
    },
    gemini: {
      hint: 'Get your key at <strong>aistudio.google.com/apikey</strong>',
      placeholder: 'AI...',
      models: [
        { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (fast)' },
        { id: 'gemini-2.5-pro-preview-06-05', name: 'Gemini 2.5 Pro (capable)' }
      ]
    }
  };

  async function init() {
    const providerSelect = document.getElementById('settings-provider');
    const configSection = document.getElementById('settings-provider-config');

    // Load saved provider
    const saved = await CrownStorage.get('ai_provider');
    if (saved && saved.name) {
      providerSelect.value = saved.name;
      showProviderConfig(saved.name);
      document.getElementById('settings-api-key').value = saved.key || '';
      if (saved.model) {
        setTimeout(() => {
          const modelSelect = document.getElementById('settings-ai-model');
          if (modelSelect) modelSelect.value = saved.model;
        }, 50);
      }
    }

    // Provider change
    providerSelect.addEventListener('change', () => {
      const val = providerSelect.value;
      if (val) {
        showProviderConfig(val);
      } else {
        configSection.style.display = 'none';
        document.getElementById('settings-provider-info').innerHTML =
          '<div class="alert alert-success" style="margin:0;">&#x2705; Using built-in mode — all calculators and the basic AI assistant work without any API key.</div>';
      }
    });

    // Save key
    document.getElementById('settings-save-key').addEventListener('click', async () => {
      const providerName = providerSelect.value;
      const key = document.getElementById('settings-api-key').value.trim();
      const model = document.getElementById('settings-ai-model').value;

      if (!key) {
        alert('Please enter an API key.');
        return;
      }

      await CrownStorage.set('ai_provider', { name: providerName, key, model });
      await CrownChat.reloadProvider();

      document.getElementById('settings-provider-info').innerHTML =
        '<div class="alert alert-success" style="margin:0;">&#x2705; Connected! The AI assistant now uses ' +
        (PROVIDER_INFO[providerName]?.models.find(m => m.id === model)?.name || model) +
        '. Open the chat panel to try it.</div>';
    });

    // Remove key
    document.getElementById('settings-remove-key').addEventListener('click', async () => {
      await CrownStorage.remove('ai_provider');
      document.getElementById('settings-api-key').value = '';
      providerSelect.value = '';
      configSection.style.display = 'none';
      await CrownChat.reloadProvider();

      document.getElementById('settings-provider-info').innerHTML =
        '<div class="alert alert-info" style="margin:0;">&#x2139; Disconnected. The built-in assistant is still available.</div>';
    });

    // Load defaults
    const defaults = await CrownStorage.get('defaults');
    if (defaults) {
      if (defaults.state) document.getElementById('settings-state').value = defaults.state;
      if (defaults.rate) document.getElementById('settings-rate').value = defaults.rate;
    }

    // Save Defaults
    document.getElementById('settings-save-defaults').addEventListener('click', async () => {
      await CrownStorage.set('defaults', {
        state: document.getElementById('settings-state').value,
        rate: document.getElementById('settings-rate').value
      });
      alert('Defaults saved!');
    });

    // Data management
    document.getElementById('settings-export-data').addEventListener('click', async () => {
      const data = await CrownStorage.getAll();
      // Remove API key from export for security
      const exportData = { ...data };
      delete exportData.ai_provider;
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CrownMoney_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    document.getElementById('settings-import-data').addEventListener('click', () => {
      document.getElementById('settings-import-file').click();
    });

    document.getElementById('settings-import-file').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const text = await file.text();
      try {
        const data = JSON.parse(text);
        for (const [key, value] of Object.entries(data)) {
          await CrownStorage.set(key, value);
        }
        alert('Data imported successfully!');
      } catch (err) {
        alert('Error importing data. Please check the file format.');
      }
    });

    document.getElementById('settings-clear-data').addEventListener('click', async () => {
      if (confirm('Are you sure? This will delete all saved calculator data, preferences, and API keys.')) {
        await CrownStorage.clearAll();
        await CrownChat.reloadProvider();
        alert('All data cleared.');
        window.location.hash = 'settings';
        CrownRouter.navigate('settings');
      }
    });
  }

  function showProviderConfig(providerName) {
    const info = PROVIDER_INFO[providerName];
    if (!info) return;

    document.getElementById('settings-provider-config').style.display = 'block';
    document.getElementById('settings-api-key').placeholder = info.placeholder;
    document.getElementById('settings-key-hint').innerHTML = info.hint;

    const modelSelect = document.getElementById('settings-ai-model');
    modelSelect.innerHTML = info.models.map(m =>
      `<option value="${m.id}">${m.name}</option>`
    ).join('');

    document.getElementById('settings-provider-info').innerHTML = '';
  }

  return { init };
})();
