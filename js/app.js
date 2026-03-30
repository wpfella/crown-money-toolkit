/**
 * Crown Money Financial Toolkit - App Bootstrap
 */

// Page HTML generator (inline rather than fetching separate files to avoid CORS issues in extensions)
function getPageHTML(page) {
  const pages = {
    '': getDashboardHomeHTML,
    'home-loan': getHomeLoanHTML,
    'mortgage-comparison': getMortgageComparisonHTML,
    'extra-repayment': getExtraRepaymentHTML,
    'offset-account': getOffsetAccountHTML,
    'stamp-duty': getStampDutyHTML,
    'rent-vs-buy': getRentVsBuyHTML,
    'refinance': getRefinanceHTML,
    'budget-planner': getBudgetPlannerHTML,
    'tax-estimator': getTaxEstimatorHTML,
    'savings-goal': getSavingsGoalHTML,
    'fhog': getFHOGHTML,
    'investment-growth': getInvestmentGrowthHTML,
    'compound-interest': getCompoundInterestHTML,
    'debt-snowball': getDebtSnowballHTML,
    'settings': getSettingsHTML
  };

  const fn = pages[page];
  return fn ? fn() : getDashboardHomeHTML();
}

// Dashboard Home
function getDashboardHomeHTML() {
  return `
    <div class="page-header">
      <h2>&#x1F451; Welcome to Crown Money</h2>
      <p class="page-desc">Your complete Australian financial toolkit. Choose a calculator below to get started.</p>
    </div>

    <div class="calc-grid">
      <a class="calc-tile" href="#home-loan">
        <div class="tile-icon">&#x1F3E1;</div>
        <div class="tile-title">Home Loan</div>
        <div class="tile-desc">Calculate repayments, total interest, and view your amortization schedule.</div>
      </a>
      <a class="calc-tile" href="#mortgage-comparison">
        <div class="tile-icon">&#x1F4CA;</div>
        <div class="tile-title">Mortgage Comparison</div>
        <div class="tile-desc">Compare two loan options side by side to find the best deal.</div>
      </a>
      <a class="calc-tile" href="#extra-repayment">
        <div class="tile-icon">&#x1F4B8;</div>
        <div class="tile-title">Extra Repayments</div>
        <div class="tile-desc">See how extra payments can save you thousands in interest.</div>
      </a>
      <a class="calc-tile" href="#offset-account">
        <div class="tile-icon">&#x1F3E6;</div>
        <div class="tile-title">Offset Account</div>
        <div class="tile-desc">Calculate savings from an offset account against your mortgage.</div>
      </a>
      <a class="calc-tile" href="#stamp-duty">
        <div class="tile-icon">&#x1F4CB;</div>
        <div class="tile-title">Stamp Duty</div>
        <div class="tile-desc">Calculate stamp duty for any state with first home buyer concessions.</div>
      </a>
      <a class="calc-tile" href="#rent-vs-buy">
        <div class="tile-icon">&#x1F3D8;</div>
        <div class="tile-title">Rent vs Buy</div>
        <div class="tile-desc">Compare the financial outcomes of renting versus buying a home.</div>
      </a>
      <a class="calc-tile" href="#refinance">
        <div class="tile-icon">&#x1F504;</div>
        <div class="tile-title">Refinance</div>
        <div class="tile-desc">See if refinancing your home loan could save you money.</div>
      </a>
      <a class="calc-tile" href="#budget-planner">
        <div class="tile-icon">&#x1F4B0;</div>
        <div class="tile-title">Budget Planner</div>
        <div class="tile-desc">Track your income and expenses with an Australian-focused budget.</div>
      </a>
      <a class="calc-tile" href="#tax-estimator">
        <div class="tile-icon">&#x1F9FE;</div>
        <div class="tile-title">Tax Estimator</div>
        <div class="tile-desc">Estimate your Australian income tax, Medicare levy, and take-home pay.</div>
      </a>
      <a class="calc-tile" href="#savings-goal">
        <div class="tile-icon">&#x1F3AF;</div>
        <div class="tile-title">Savings Goal</div>
        <div class="tile-desc">Plan how to reach your savings target with regular contributions.</div>
      </a>
      <a class="calc-tile" href="#fhog">
        <div class="tile-icon">&#x1F3C6;</div>
        <div class="tile-title">First Home Grant</div>
        <div class="tile-desc">Check your eligibility for FHOG and state-based concessions.</div>
      </a>
      <a class="calc-tile" href="#investment-growth">
        <div class="tile-icon">&#x1F4C8;</div>
        <div class="tile-title">Investment Growth</div>
        <div class="tile-desc">Project how your investments will grow over time with contributions.</div>
      </a>
      <a class="calc-tile" href="#compound-interest">
        <div class="tile-icon">&#x1F4B9;</div>
        <div class="tile-title">Compound Interest</div>
        <div class="tile-desc">See the power of compound interest on your savings.</div>
      </a>
      <a class="calc-tile" href="#debt-snowball">
        <div class="tile-icon">&#x2744;</div>
        <div class="tile-title">Debt Payoff</div>
        <div class="tile-desc">Plan your debt-free journey with snowball or avalanche strategies.</div>
      </a>
    </div>

    ${CrownUtils.adBanner()}
  `;
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  CrownChat.init();
  CrownRouter.init();
});
