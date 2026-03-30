/**
 * Crown Money AI Chatbot
 * Free built-in financial assistant + optional advanced AI via user's own API key
 * Supports: OpenAI, Anthropic (Claude), Google Gemini
 */
const CrownChat = (() => {
  let provider = null; // { name, key, model }
  let conversationHistory = [];
  let isOpen = false;
  let currentCalcContext = null;

  const SYSTEM_PROMPT = `You are Crown Money AI, a friendly and knowledgeable Australian financial assistant for CrownMoney.com.au.

Your role:
- Help users understand their calculator results and Australian financial concepts
- Provide general educational information about Australian home loans, tax, superannuation, and investing
- Explain stamp duty, FHOG, and government grants in plain language
- Suggest strategies for paying off mortgages sooner and saving on interest
- Always be encouraging and supportive of users' financial goals

Important guidelines:
- Always mention that your advice is general in nature and not personal financial advice
- Recommend consulting a licensed financial adviser for major decisions
- Use Australian terminology (e.g., "super" not "401k", "stamp duty" not "transfer tax")
- Format currency as AUD (e.g., $500,000)
- Keep responses concise but helpful
- If asked about current interest rates, note that rates change frequently and suggest checking comparison sites
- Promote CrownMoney.com.au as a helpful resource for Australian homeowners

You are currently helping a user with the Crown Money Financial Toolkit Chrome extension.`;

  // ─── Built-in knowledge base for free AI ───
  const KNOWLEDGE_BASE = {
    greetings: {
      patterns: ['hello', 'hi', 'hey', 'g\'day', 'gday', 'howdy', 'good morning', 'good afternoon'],
      response: "G'day! I'm your Crown Money financial assistant. I can help you understand Australian home loans, stamp duty, tax, budgeting, and more. Ask me anything — or click a calculator on the left to get started!"
    },
    home_loan: {
      patterns: ['home loan', 'mortgage', 'repayment', 'how much can i borrow', 'borrowing power', 'loan amount', 'monthly payment'],
      response: "**Home Loan Basics:**\n\n- Most Australian lenders require a minimum 5-20% deposit\n- An 80% LVR (Loan-to-Value Ratio) avoids Lenders Mortgage Insurance (LMI)\n- The current average variable rate is around 6.20% p.a.\n- P&I loans pay off both principal and interest; Interest-Only loans are higher cost long-term\n\n**Tip:** Use our Home Loan Calculator to see exact repayments! Even small extra repayments can save you tens of thousands in interest.\n\n*This is general information, not personal financial advice.*"
    },
    extra_repayment: {
      patterns: ['extra repayment', 'pay off sooner', 'pay off faster', 'extra payment', 'additional payment', 'save interest'],
      response: "**Extra Repayments — Your Secret Weapon:**\n\n- Paying just $200 extra per month on a $500,000 loan at 6.2% can save over $100,000 in interest!\n- You'll also shorten your loan by approximately 5-7 years\n- Fortnightly payments (half your monthly amount every 2 weeks) equals 13 monthly payments per year instead of 12\n- Check if your loan allows unlimited extra repayments without fees\n\n**Try our Extra Repayments Calculator** to see your exact savings!\n\n*This is general information, not personal financial advice.*"
    },
    offset: {
      patterns: ['offset', 'offset account', 'offset savings'],
      response: "**Offset Accounts Explained:**\n\n- An offset account reduces the loan balance that interest is calculated on\n- $50,000 in offset against a $500,000 loan means interest is only charged on $450,000\n- This is effectively earning a tax-free return equal to your mortgage rate\n- At 6.2% rate, $50,000 in offset saves ~$3,100/year in interest\n- Unlike extra repayments, money in offset is accessible anytime\n\n**Use our Offset Account Calculator** to see your potential savings!\n\n*This is general information, not personal financial advice.*"
    },
    stamp_duty: {
      patterns: ['stamp duty', 'transfer duty', 'stamp duty exemption', 'how much stamp duty'],
      response: "**Stamp Duty in Australia:**\n\nStamp duty varies by state and property value. For a $650,000 property:\n- NSW: ~$24,000\n- VIC: ~$35,000\n- QLD: ~$13,000\n- SA: ~$27,000\n\n**First Home Buyers** may be eligible for concessions or full exemptions — this can save you thousands!\n\n**Use our Stamp Duty Calculator** to get the exact amount for your state and see first home buyer concessions.\n\n*This is general information, not personal financial advice.*"
    },
    first_home: {
      patterns: ['first home', 'fhog', 'first home owner', 'first home buyer', 'first home grant', 'government grant'],
      response: "**First Home Owner Grant (FHOG):**\n\n- QLD & TAS: $30,000 (most generous!)\n- SA: $15,000\n- NSW, VIC, WA, NT: $10,000\n- ACT: $7,000\n\n**Key Rules:**\n- Usually for new builds/substantially renovated homes only\n- Property value caps apply (varies by state)\n- Must be Australian citizen/PR, 18+, never owned property before\n- Must live in the property for at least 6-12 months\n\n**Check our First Home Grant Calculator** for your specific eligibility!\n\n*This is general information, not personal financial advice.*"
    },
    tax: {
      patterns: ['tax', 'income tax', 'tax bracket', 'tax return', 'how much tax', 'take home pay', 'net pay', 'medicare'],
      response: "**Australian Tax Brackets (FY 2025-26):**\n\n- $0-$18,200: 0% (tax-free threshold)\n- $18,201-$45,000: 16%\n- $45,001-$135,000: 30%\n- $135,001-$190,000: 37%\n- $190,001+: 45%\n\n**Plus:** 2% Medicare Levy on taxable income\n\n**Tax-saving tips:**\n- Salary sacrifice into super (taxed at 15% instead of your marginal rate)\n- Claim legitimate work-related deductions\n- Consider income protection insurance (premiums may be deductible)\n\n**Use our Tax Estimator** for your exact take-home pay!\n\n*This is general information, not personal financial advice.*"
    },
    investment: {
      patterns: ['invest', 'investment', 'shares', 'etf', 'stock market', 'portfolio', 'returns'],
      response: "**Investment Basics for Australians:**\n\n- The ASX has historically returned ~9-10% p.a. over the long term\n- Diversified ETFs (like Vanguard VAS or A200) offer broad market exposure\n- Dollar-cost averaging (regular small investments) reduces timing risk\n- Inside super, investment earnings are taxed at only 15%\n\n**Compound Interest is Key:**\n$500/month at 7% p.a. for 20 years = ~$260,000 (you only contributed $120,000!)\n\n**Try our Investment Growth Calculator** to project your returns!\n\n*This is general information, not personal financial advice.*"
    },
    super: {
      patterns: ['super', 'superannuation', 'retirement', 'super contribution', 'super guarantee'],
      response: "**Superannuation Key Facts:**\n\n- Employer contribution rate: 12% (from July 2025)\n- Concessional (before-tax) contributions cap: $30,000/year\n- Non-concessional cap: $120,000/year\n- Super earnings are taxed at only 15%\n- Preservation age: 60 (for most Australians)\n\n**Salary Sacrifice Tip:** If you earn $100,000 and salary sacrifice $10,000 into super, you save ~$1,500-$2,000 in tax compared to taking it as salary!\n\n*This is general information, not personal financial advice.*"
    },
    budget: {
      patterns: ['budget', 'budgeting', 'spending', 'save money', 'saving tips', 'expenses'],
      response: "**The 50/30/20 Budget Rule:**\n\n- **50%** on Needs: rent/mortgage, groceries, utilities, transport\n- **30%** on Wants: dining out, entertainment, subscriptions, hobbies\n- **20%** on Savings: emergency fund, investments, extra loan repayments\n\n**Australian Cost-Cutting Tips:**\n- Compare energy plans at energymadeeasy.gov.au\n- Review your health insurance annually\n- Use cashback apps for groceries\n- Consider refinancing your home loan if your rate is above market\n\n**Use our Budget Planner** to track your income and expenses!\n\n*This is general information, not personal financial advice.*"
    },
    debt: {
      patterns: ['debt', 'credit card', 'personal loan', 'debt free', 'pay off debt', 'snowball', 'avalanche'],
      response: "**Debt Payoff Strategies:**\n\n**Avalanche Method** (saves the most money):\nPay minimums on all debts, then throw extra cash at the highest-interest debt first.\n\n**Snowball Method** (best for motivation):\nPay off smallest balance first for quick wins, then roll that payment into the next debt.\n\n**Priority Order:**\n1. Credit cards (15-22% interest!) — pay these first\n2. Personal loans (7-15%)\n3. Car loans (5-9%)\n4. Home loan (5-7%) — lowest priority but largest balance\n\n**Use our Debt Payoff Planner** to create your debt-free plan!\n\n*This is general information, not personal financial advice.*"
    },
    refinance: {
      patterns: ['refinance', 'refinancing', 'switch lender', 'better rate', 'lower rate'],
      response: "**Should You Refinance?**\n\n**Refinancing makes sense when:**\n- You can get a rate at least 0.5% lower than your current rate\n- You've had your loan for at least 2-3 years\n- Your property value has increased (better LVR = better rate)\n- You want to access equity for renovations or investing\n\n**Watch out for:**\n- Discharge fees from current lender ($150-$400)\n- Application/settlement fees at new lender\n- Break costs on fixed-rate loans (can be thousands!)\n\n**Use our Refinance Calculator** to see if switching saves you money!\n\n*This is general information, not personal financial advice.*"
    },
    rent_buy: {
      patterns: ['rent or buy', 'rent vs buy', 'renting', 'should i buy', 'keep renting'],
      response: "**Rent vs Buy — Things to Consider:**\n\n**Buying Pros:**\n- Building equity in an appreciating asset\n- Stability and security of ownership\n- Can renovate and improve\n- No rent increases\n\n**Renting Pros:**\n- Flexibility to move easily\n- No maintenance costs or stamp duty\n- Can invest your deposit in shares (potentially higher returns)\n- Lower upfront costs\n\n**Rule of Thumb:** Buying tends to win over 7+ years if property grows at 3-5% p.a.\n\n**Use our Rent vs Buy Calculator** to compare for your specific situation!\n\n*This is general information, not personal financial advice.*"
    },
    help: {
      patterns: ['help', 'what can you do', 'how do i use', 'features', 'what calculators'],
      response: "**I can help you with:**\n\n🏠 **Property:** Home loans, mortgage comparison, extra repayments, offset accounts, stamp duty, rent vs buy, refinancing\n\n💰 **Money:** Budget planning, tax estimation, savings goals, first home grants\n\n📈 **Investing & Debt:** Investment growth, compound interest, debt payoff strategies\n\n**Just ask me about any of these topics**, or click a calculator in the sidebar to get started!\n\nFor **advanced AI assistance** that can analyse your specific calculator results in detail, you can connect your own API key in Settings (supports OpenAI, Claude, and Gemini)."
    }
  };

  function findBuiltInResponse(message) {
    const lower = message.toLowerCase().trim();

    // Check each knowledge base entry
    let bestMatch = null;
    let bestScore = 0;

    for (const [key, entry] of Object.entries(KNOWLEDGE_BASE)) {
      for (const pattern of entry.patterns) {
        if (lower.includes(pattern)) {
          const score = pattern.length;
          if (score > bestScore) {
            bestScore = score;
            bestMatch = entry;
          }
        }
      }
    }

    return bestMatch ? bestMatch.response : null;
  }

  function getFallbackResponse(message) {
    const lower = message.toLowerCase();

    // Context-aware fallback
    if (currentCalcContext && currentCalcContext.data) {
      const calc = currentCalcContext.calculator;
      return `I can see you're using the **${calc}** calculator. Here's what I'd suggest:\n\n- Review the **Personalised Recommendations** section below your results for tailored tips\n- Try adjusting the inputs to see how different scenarios compare\n- Use the **Export** buttons to save your results as PDF or CSV\n\nFor more detailed analysis of your specific numbers, you can connect an AI provider (OpenAI, Claude, or Gemini) in **Settings** — this gives me the ability to deeply analyse your results.\n\nOr ask me about any Australian financial topic and I'll do my best to help!\n\n*This is general information, not personal financial advice.*`;
    }

    return "That's a great question! While I can provide built-in guidance on common Australian financial topics like home loans, stamp duty, tax, budgeting, and investing, for more detailed or personalised analysis you can:\n\n1. **Try one of our calculators** — they include personalised recommendations based on your inputs\n2. **Ask me about a specific topic** like 'stamp duty', 'home loan', 'tax', 'budget', or 'investing'\n3. **Connect an AI provider** in Settings for advanced conversational AI (supports OpenAI, Claude, and Gemini)\n\nWhat financial topic would you like to explore?";
  }

  // ─── Provider API calls ───
  const PROVIDERS = {
    openai: {
      name: 'OpenAI',
      keyPrefix: 'sk-',
      models: [
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini (fast & affordable)' },
        { id: 'gpt-4o', name: 'GPT-4o (most capable)' },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' }
      ],
      async call(key, model, messages) {
        const resp = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
          body: JSON.stringify({
            model: model || 'gpt-4o-mini',
            messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
            max_tokens: 800,
            temperature: 0.7
          })
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.error?.message || `API error (${resp.status})`);
        }
        const data = await resp.json();
        return data.choices?.[0]?.message?.content || 'No response generated.';
      }
    },
    anthropic: {
      name: 'Anthropic (Claude)',
      keyPrefix: 'sk-ant-',
      models: [
        { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6 (balanced)' },
        { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5 (fast)' }
      ],
      async call(key, model, messages) {
        const resp = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          },
          body: JSON.stringify({
            model: model || 'claude-sonnet-4-6',
            max_tokens: 800,
            system: SYSTEM_PROMPT,
            messages: messages
          })
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.error?.message || `API error (${resp.status})`);
        }
        const data = await resp.json();
        return data.content?.[0]?.text || 'No response generated.';
      }
    },
    gemini: {
      name: 'Google Gemini',
      keyPrefix: 'AI',
      models: [
        { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (fast)' },
        { id: 'gemini-2.5-pro-preview-06-05', name: 'Gemini 2.5 Pro (capable)' }
      ],
      async call(key, model, messages) {
        const modelId = model || 'gemini-2.0-flash';
        const contents = [];
        // Add system instruction context into first user message
        const systemCtx = SYSTEM_PROMPT + '\n\n';
        messages.forEach((m, i) => {
          const role = m.role === 'assistant' ? 'model' : 'user';
          let text = m.content;
          if (i === 0 && role === 'user') text = systemCtx + text;
          contents.push({ role, parts: [{ text }] });
        });

        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
              generationConfig: { maxOutputTokens: 800, temperature: 0.7 }
            })
          }
        );
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.error?.message || `API error (${resp.status})`);
        }
        const data = await resp.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
      }
    }
  };

  async function init() {
    await loadProvider();
    renderChatBody();
    bindEvents();
  }

  async function loadProvider() {
    const saved = await CrownStorage.get('ai_provider');
    if (saved && saved.key) {
      provider = saved; // { name: 'openai'|'anthropic'|'gemini', key, model }
    } else {
      provider = null;
    }
  }

  function bindEvents() {
    document.getElementById('btnChat').addEventListener('click', toggleChat);
    document.getElementById('chatClose').addEventListener('click', closeChat);
  }

  function toggleChat() {
    isOpen = !isOpen;
    document.getElementById('chatPanel').classList.toggle('open', isOpen);
    document.getElementById('btnChat').classList.toggle('active', isOpen);
  }

  function closeChat() {
    isOpen = false;
    document.getElementById('chatPanel').classList.remove('open');
    document.getElementById('btnChat').classList.remove('active');
  }

  function setCalcContext(calcName, data) {
    currentCalcContext = calcName ? { calculator: calcName, data } : null;
  }

  function renderChatBody() {
    const body = document.getElementById('chatBody');
    const modeLabel = provider ? PROVIDERS[provider.name]?.name || provider.name : 'Built-in';

    body.innerHTML = `
      <div class="chat-messages" id="chatMessages">
        <div class="chat-message assistant">
          <div class="msg-avatar">&#x1F451;</div>
          <div class="chat-bubble">
            G'day! I'm your Crown Money financial assistant. I can help you understand Australian home loans, tax, stamp duty, budgeting, and more. Just ask!${!provider ? '\n\n<em style="font-size:12px;color:#868E96;">Built-in mode — for advanced AI analysis, connect an API key in Settings.</em>' : ''}
          </div>
        </div>
      </div>
      <div class="chat-input-area">
        <div id="chatContextBadge"></div>
        <div class="chat-input-wrap">
          <textarea id="chatInput" placeholder="Ask about home loans, tax, stamp duty..." rows="1"></textarea>
          <button class="chat-send" id="chatSendBtn">&#x27A4;</button>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px;">
          <span style="font-size:11px;color:#868E96;">Mode: <strong>${modeLabel}</strong></span>
          <a href="#settings" style="font-size:11px;color:#D4A843;" id="chatSettingsLink">AI Settings</a>
        </div>
      </div>`;

    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('chatSendBtn');

    sendBtn.addEventListener('click', () => sendMessage());
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });

    document.getElementById('chatSettingsLink').addEventListener('click', (e) => {
      e.preventDefault();
      closeChat();
      window.location.hash = 'settings';
    });

    updateContextBadge();
  }

  function updateContextBadge() {
    const badge = document.getElementById('chatContextBadge');
    if (!badge) return;
    if (currentCalcContext) {
      badge.innerHTML = `<div class="chat-context-badge">&#x1F4CA; Discussing: ${currentCalcContext.calculator}</div>`;
    } else {
      badge.innerHTML = '';
    }
  }

  function addMessage(role, content) {
    const messages = document.getElementById('chatMessages');
    if (!messages) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${role}`;

    if (role === 'assistant') {
      msgDiv.innerHTML = `
        <div class="msg-avatar">&#x1F451;</div>
        <div class="chat-bubble">${formatMessage(content)}</div>`;
    } else {
      msgDiv.innerHTML = `
        <div class="msg-avatar">&#x1F464;</div>
        <div class="chat-bubble">${escapeHtml(content)}</div>`;
    }

    messages.appendChild(msgDiv);
    messages.scrollTop = messages.scrollHeight;
  }

  function addTypingIndicator() {
    const messages = document.getElementById('chatMessages');
    const typing = document.createElement('div');
    typing.className = 'chat-message assistant';
    typing.id = 'typingIndicator';
    typing.innerHTML = `
      <div class="msg-avatar">&#x1F451;</div>
      <div class="chat-bubble">
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>`;
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
  }

  function removeTypingIndicator() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
  }

  async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;

    input.value = '';
    input.style.height = 'auto';
    addMessage('user', message);

    // If no provider, use built-in knowledge base
    if (!provider) {
      addTypingIndicator();
      // Small delay to feel natural
      await new Promise(r => setTimeout(r, 400 + Math.random() * 600));
      removeTypingIndicator();

      const builtInResponse = findBuiltInResponse(message);
      addMessage('assistant', builtInResponse || getFallbackResponse(message));
      return;
    }

    // Advanced AI mode — call the configured provider
    let contextMessage = message;
    if (currentCalcContext && currentCalcContext.data) {
      contextMessage = `[User is currently viewing the ${currentCalcContext.calculator} calculator with these inputs/results: ${JSON.stringify(currentCalcContext.data)}]\n\nUser question: ${message}`;
    }

    conversationHistory.push({ role: 'user', content: contextMessage });

    addTypingIndicator();
    document.getElementById('chatSendBtn').disabled = true;

    try {
      const providerDef = PROVIDERS[provider.name];
      if (!providerDef) throw new Error('Unknown AI provider');

      const reply = await providerDef.call(
        provider.key,
        provider.model,
        conversationHistory.slice(-10)
      );

      removeTypingIndicator();
      conversationHistory.push({ role: 'assistant', content: reply });
      addMessage('assistant', reply);

    } catch (err) {
      removeTypingIndicator();
      const errorMsg = err.message || 'Unknown error';

      if (errorMsg.includes('401') || errorMsg.includes('invalid') || errorMsg.includes('Unauthorized')) {
        addMessage('assistant', `Your API key appears to be invalid. Please update it in **Settings**.\n\nI'll continue using built-in mode in the meantime — you can still ask me about Australian financial topics!`);
        provider = null;
        await CrownStorage.remove('ai_provider');
        renderChatBody();
      } else {
        addMessage('assistant', `I encountered an error with the AI service: ${errorMsg}\n\nFalling back to built-in mode. You can still ask me about home loans, tax, stamp duty, and more!`);
        // Try built-in response for the same message
        const builtIn = findBuiltInResponse(message);
        if (builtIn) addMessage('assistant', builtIn);
      }
    } finally {
      const sendBtn = document.getElementById('chatSendBtn');
      if (sendBtn) sendBtn.disabled = false;
      const chatInput = document.getElementById('chatInput');
      if (chatInput) chatInput.focus();
    }
  }

  function formatMessage(text) {
    let html = escapeHtml(text);
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    html = html.replace(/\n/g, '<br>');
    return html;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function clearHistory() {
    conversationHistory = [];
  }

  async function reloadProvider() {
    await loadProvider();
    renderChatBody();
  }

  return { init, setCalcContext, toggleChat, closeChat, clearHistory, updateContextBadge, reloadProvider };
})();
