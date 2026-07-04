import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not defined. AI Coach will run in fallback mode.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Helper: Perform math-based trajectory simulation fallback
function getMathSimulation(
  character: any,
  currentBalance: any,
  currentSavings: any,
  currentDebt: any,
  monthsToProject: number,
  monthlySavingsInput: any,
  monthlyDebtRepayment: any
) {
  let annualSavingsRate = 0.07;
  if (character.type === "YOUNG_PROFESSIONAL") {
    annualSavingsRate = 0.11;
  } else if (character.type === "ENTREPRENEUR") {
    annualSavingsRate = 0.06;
  }

  let tempBalance = Number(currentBalance);
  let tempSavings = Number(currentSavings);
  let tempDebt = Number(currentDebt);
  const trajectory: any[] = [];
  const milestones: any[] = [];
  const monthlySavingsRate = annualSavingsRate / 12;
  const monthlyDebtInterestRate = 0.025;

  // Push initial starting state (month 0)
  trajectory.push({
    month: 0,
    balance: Math.round(tempBalance),
    savings: Math.round(tempSavings),
    debt: Math.round(tempDebt),
    netWorth: Math.round(tempBalance + tempSavings - tempDebt),
    eventText: "Entered the Time-Warp Chrono-Mirror."
  });

  // Custom life events for the fallback
  const fallbackEvents: { [key: number]: { title: string; desc: string; cashImpact: number } } = {};
  if (monthsToProject >= 12) {
    fallbackEvents[3] = {
      title: "Minor Emergency Expense",
      desc: character.type === "STUDENT" ? "Emergency transport costs to university campus." : "Emergency smartphone repair for work communication.",
      cashImpact: -1200
    };
    fallbackEvents[6] = {
      title: "Bonus Side-Hustle Income",
      desc: "Simulated freelance / consulting gig completed over the weekend.",
      cashImpact: 1800
    };
    fallbackEvents[10] = {
      title: "Stokvel / Savings Group payout",
      desc: "A rotational community savings payout boosts your liquidity.",
      cashImpact: 2500
    };
  }
  if (monthsToProject >= 24) {
    fallbackEvents[15] = {
      title: "Medical Co-Payment",
      desc: "Unforeseen dentist visit required an out-of-pocket medical co-payment.",
      cashImpact: -1500
    };
    fallbackEvents[20] = {
      title: "Annual Tech upgrade",
      desc: "Upgrading core laptop/battery equipment to maintain high freelance productivity.",
      cashImpact: -2000
    };
  }

  // Populate milestones from fallbackEvents
  Object.keys(fallbackEvents).forEach((mStr) => {
    const m = Number(mStr);
    milestones.push({
      month: m,
      title: fallbackEvents[m].title,
      desc: fallbackEvents[m].desc
    });
  });

  for (let m = 1; m <= monthsToProject; m++) {
    const baseOutflow = Number(character.baseRent) + Number(character.baseGroceries) + Number(character.baseBills);
    let surplus = Number(character.baseIncome) - baseOutflow;

    let eventText = "Regular compounding month";
    if (fallbackEvents[m]) {
      const ev = fallbackEvents[m];
      surplus += ev.cashImpact;
      eventText = `🚨 Event: ${ev.title} (${ev.cashImpact > 0 ? "+" : ""}R${ev.cashImpact}) - ${ev.desc}`;
    }

    let actualSaved = Number(monthlySavingsInput);
    let actualRepaid = Number(monthlyDebtRepayment);

    if (surplus < actualSaved + actualRepaid) {
      const totalTarget = actualSaved + actualRepaid;
      if (totalTarget > 0) {
        const ratio = Math.max(0, surplus) / totalTarget;
        actualSaved = Math.round(actualSaved * ratio);
        actualRepaid = Math.round(actualRepaid * ratio);
      } else {
        actualSaved = 0;
        actualRepaid = 0;
      }
    }

    tempSavings += actualSaved;
    tempBalance += (surplus - actualSaved - actualRepaid);

    const debtPaid = Math.min(tempDebt, actualRepaid);
    tempDebt -= debtPaid;

    const monthlyEarned = tempSavings * monthlySavingsRate;
    tempSavings += monthlyEarned;

    const monthlyDebtCost = tempDebt * monthlyDebtInterestRate;
    tempDebt += monthlyDebtCost;

    if (tempBalance < 0) {
      if (tempSavings >= Math.abs(tempBalance)) {
        tempSavings += tempBalance;
        tempBalance = 0;
      } else {
        tempDebt += (Math.abs(tempBalance) - tempSavings);
        tempSavings = 0;
        tempBalance = 0;
      }
    }

    trajectory.push({
      month: m,
      balance: Math.round(tempBalance),
      savings: Math.round(tempSavings),
      debt: Math.round(tempDebt),
      netWorth: Math.round(tempBalance + tempSavings - tempDebt),
      eventText
    });
  }

  // Strategic report generator
  const endState = trajectory[trajectory.length - 1];
  const initialNetWorth = Number(currentBalance) + Number(currentSavings) - Number(currentDebt);
  const finalNetWorth = endState.netWorth;
  const netWorthGrowth = finalNetWorth - initialNetWorth;
  const savingsRatio = Number(monthlySavingsInput) / Number(character.baseIncome);

  let finalGrade = "Labyrinth Squire [B]";
  if (netWorthGrowth > 20000 && tempDebt === 0) finalGrade = "Grand Archivist [A+]";
  else if (netWorthGrowth > 10000 && tempDebt < 1000) finalGrade = "Wealth Guardian [A]";
  else if (netWorthGrowth > 0) finalGrade = "Labyrinth Squire [B]";
  else if (tempDebt > Number(currentDebt) * 1.5) finalGrade = "Debt-Chained Wanderer [D]";
  else finalGrade = "Impulsive Explorer [C]";

  const strategicReport = `### 📜 Labyrinth Oracle Scroll of Destiny
The Labyrinth Chrono-Mirror has peered into the ${monthsToProject}-month horizon for **${character.name}**. Based on your automated routing spells, the Oracle awards you the Guardian Rank of **${finalGrade}**.

Here are the visions of your future path:
* **The Shard Compounding Flow**: You automated **R${Number(monthlySavingsInput).toLocaleString()}** per cycle into the compound vault. Earning a continuous interest rate of **${(annualSavingsRate * 100).toFixed(0)}%**, your savings buffer swelled to **R${Math.round(tempSavings).toLocaleString()}** Wealth Shards! This includes bonus community stokvel payouts.
* **The Shadow Debt Trap**: By routing **R${Number(monthlyDebtRepayment).toLocaleString()}** extra to the Debt Trap, you ended with **R${Math.round(tempDebt).toLocaleString()}** in outstanding debt. Beware! Retail and card debt compounds at **2.5% per cycle** (over 30% a year!), a dark curse that quickly drains your life essence.

### 🔍 Long-Term Labyrinth Lessons
1. **Pay Yourself First (Secure Shards First)**: By sweeping R${Number(monthlySavingsInput).toLocaleString()} (approx. **${(savingsRatio * 100).toFixed(0)}%** of your monthly custom income) the moment you earn salary, you build an ironclad shield before spending temptation drains it.
2. **Compound Interest is a Double-Edged Sword**: While your compounding shards grew your wealth, any unresolved debt multiplied against you. Prioritize erasing high-rate liabilities.
3. **The Emergency Life Buffer**: Volatility spikes (like medical fees or broken equipment) are inevitable. Your ending buffer of **R${Math.round(tempSavings).toLocaleString()}** Shards serves as an airtight shield against unexpected emergency borrowing.`;

  return {
    trajectory,
    milestones,
    strategicReport,
    finalGrade
  };
}

// Helper: Financial Coach Assessment Fallback
function getCoachFallback(
  character: any,
  monthIndex: number,
  balance: number,
  savings: number,
  debt: number,
  stress: number
): string {
  return `### 📜 Oracle's Assessment
Greetings, ${character.name}! You navigated the treacherous curves of Month #${monthIndex + 1} with great bravery! By keeping R${balance} cash active and reinforcing your buffer with R${savings} Wealth Shards, you are building an invincible fortress of financial resilience.

### 🔍 Choice & Spell Breakdown
* **Smart Buffers**: By prioritizing savings of R${savings} Wealth Shards, you've built an emergency cushion. In real life, having a 3-to-6 month expense buffer prevents you from relying on high-interest credit cards when unpredictable emergencies strike.
* **The Debt Trap Curse**: Your outstanding debt of R${debt} shows you are balancing leverage. Remember that high-interest retail store cards or personal loans compound against you, while investing in compound interest vehicles compounds for you.

### 💡 Labyrinth Lessons (For Real Life)
* **Automate Payday Savings**: Set up an automated recurring transfer to your savings account the day you receive your allowance or salary.
* **Slay High-Interest Debt**: Target any debt charging over 10% interest rate with the "debt avalanche" method to stop interest eating your cash flow.
* **Track the Micro-Expenses**: Small daily convenience purchases (like premium meals or takeaway coffee) represent "lifestyle inflation" that can drain your budget silently.`;
}

// API: MaliGo AI Speedrunner Projections Engine endpoint
app.post("/api/simulate", async (req, res) => {
  const {
    character,
    currentBalance,
    currentSavings,
    currentDebt,
    monthsToProject,
    monthlySavingsInput,
    monthlyDebtRepayment
  } = req.body;

  if (!character) {
    return res.status(400).json({ error: "Missing required character data" });
  }

  // Savings rates for fallback & interest rates validation
  let annualSavingsRate = 0.07;
  if (character.type === "YOUNG_PROFESSIONAL") {
    annualSavingsRate = 0.11;
  } else if (character.type === "ENTREPRENEUR") {
    annualSavingsRate = 0.06;
  }

  // If no apiKey, run mathematical fallback immediately
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    const fallbackData = getMathSimulation(
      character,
      currentBalance,
      currentSavings,
      currentDebt,
      monthsToProject,
      monthlySavingsInput,
      monthlyDebtRepayment
    );
    return res.json(fallbackData);
  }

  // Otherwise, attempt the Gemini model, but fallback gracefully on error
  const prompt = `
You are the "MaliGo Labyrinth Chrono-Mirror Oracle".
Your job is to simulate a realistic month-by-month financial trajectory inside the Wealth Labyrinth for ${character.name} over the next ${monthsToProject} months, based on their chosen monthly allocation strategy.

Character Profile:
- Name: ${character.name}
- Role: ${character.role}
- Monthly Income: R${character.baseIncome}
- Monthly Fixed Outflows (Rent + Bills + Groceries): R${character.baseRent + character.baseGroceries + character.baseBills}

Current Balances:
- Cash Balance: R${currentBalance}
- Savings Buffer (Wealth Shards): R${currentSavings}
- Debt Trap (Liabilities): R${currentDebt}

Player's Automated Strategy:
- Automate Monthly Savings Sweep (Wealth Shards): R${monthlySavingsInput}
- Extra Monthly Debt Payment (Debt Trap Shield): R${monthlyDebtRepayment}

Rules for the Simulation:
1. Simulate exactly ${monthsToProject} months (from month 1 to ${monthsToProject}). Month 0 is the starting state.
2. For each month, calculate the updated cash balance, savings (Wealth Shards), and debt (Debt Trap).
3. Incorporate realistic, profile-specific life events (3 to 5 events total across the timeline) that affect their cash flow (e.g., unexpected medical emergency, laptop repair, a small freelance bonus, transport costs, community stokvel payout).
4. Apply compound interest calculations:
   - Savings interest earns an annual rate of: ${annualSavingsRate * 12 * 100}% (compounded monthly).
   - Unpaid debt compounds at 2.5% monthly.
5. Respect the automated savings and debt payments. If a month's surplus does not cover the custom targets, adjust them proportionally.
6. Calculate Net Worth as Cash Balance + Savings - Debt.
7. Return a detailed strategicReport (the "Scroll of Financial Destiny") written in an ancient, engaging, mysterious, yet educational Labyrinth Oracle format. Avoid boring financial jargon where possible; instead, refer to savings as "Wealth Shards", debt as "Debt Trap curse", and lives/stress.
8. Assign a finalGrade as a Labyrinth Guardian Rank (e.g., "Grand Archivist [A+]", "Wealth Guardian [A]", "Labyrinth Squire [B]", "Debt-Chained Wanderer [D]").

Generate a complete JSON response containing:
1. "trajectory": An array of objects for months 0 to ${monthsToProject}. Each month object must contain:
   - "month": integer (0 to ${monthsToProject})
   - "balance": integer
   - "savings": integer
   - "debt": integer
   - "netWorth": integer
   - "eventText": string (describe any event that happened, or "Regular compounding month" if nothing special occurred)
2. "milestones": An array of key milestone objects. Each milestone must contain:
   - "month": integer
   - "title": string
   - "desc": string
3. "strategicReport": string (high-quality Markdown in Oracle style advising on their performance, compounding effects, and real-life takeaways)
4. "finalGrade": string (e.g., "Grand Archivist [A+]", "Wealth Guardian [A]", "Labyrinth Squire [B]", "Debt-Chained Wanderer [D]")
`;

  try {
    const client = getAiClient();
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.75,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trajectory: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  month: { type: Type.INTEGER },
                  balance: { type: Type.INTEGER },
                  savings: { type: Type.INTEGER },
                  debt: { type: Type.INTEGER },
                  netWorth: { type: Type.INTEGER },
                  eventText: { type: Type.STRING }
                },
                required: ["month", "balance", "savings", "debt", "netWorth", "eventText"]
              }
            },
            milestones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  month: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  desc: { type: Type.STRING }
                },
                required: ["month", "title", "desc"]
              }
            },
            strategicReport: { type: Type.STRING },
            finalGrade: { type: Type.STRING }
          },
          required: ["trajectory", "milestones", "strategicReport", "finalGrade"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (err: any) {
    console.warn("Gemini API Error in /api/simulate, falling back to math simulation:", err.message || err);
    try {
      const fallbackResult = getMathSimulation(
        character,
        currentBalance,
        currentSavings,
        currentDebt,
        monthsToProject,
        monthlySavingsInput,
        monthlyDebtRepayment
      );
      res.json(fallbackResult);
    } catch (fallbackErr: any) {
      console.error("Critical simulation fallback error:", fallbackErr);
      res.status(500).json({ error: "Failed to run simulation" });
    }
  }
});

// API: MaliGo AI Financial Coach endpoint
app.post("/api/coach", async (req, res) => {
  const { character, monthIndex, balance, savings, debt, stress, choices } = req.body;

  if (!character || !choices) {
    return res.status(400).json({ error: "Missing required character data or choices" });
  }

  // If no apiKey, run mathematical fallback immediately
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    const feedback = getCoachFallback(character, monthIndex, balance, savings, debt, stress);
    return res.json({ feedback });
  }

  const prompt = `
You are the "MaliGo Labyrinth Mentor", a wise, ancient financial guardian of the Wealth Labyrinth.
Your job is to evaluate a adventurer's financial choices in MaliGo, a game designed to teach young Africans and global users financial literacy. Use terms like 'Wealth Shards', 'Debt Trap curses', 'Guardian Ranks', and 'Resilience Lives' instead of dry corporate terms.

Character Profile:
- Name: ${character.name}
- Role: ${character.role}
- Monthly Income: R${character.baseIncome}
- Monthly Fixed Rent: R${character.baseRent}

Month Completed: Month #${monthIndex + 1}
Current Financial Standing at End of Month:
- Available Cash Balance: R${balance}
- Savings (Wealth Shards): R${savings}
- Accumulated Debt (Debt Trap): R${debt}
- Stress Level: ${stress}%

Choices Made by Player:
${choices.map((c: any, idx: number) => `Event ${idx + 1}: "${c.eventTitle}" -> Selected: "${c.choiceText}" (Impact: ${c.financialImpact})`).join("\n")}

Please provide a highly polished, constructive, and action-oriented financial review of their performance in game-lore style.
Structure your response strictly in 3 distinct sections using standard Markdown:

### 📜 Oracle's Assessment
A 2-3 sentence engaging game-styled summary of how well they managed lifestyle pressures, handled the Debt Trap curse, and balanced stress. Address them directly by their character name. Use encouraging yet honest tones.

### 🔍 Choice & Spell Breakdown
Analyze 1 or 2 specific choices they made. Explain the financial consequences of those choices in real life (e.g. why bulk buying raw foods saves massive cash, why high-interest retail debt or vehicle loans on entry salary is a wealth killer, or the benefits of tax-free compound savings accounts).

### 💡 Labyrinth Lessons (For Real Life)
Provide 3 bullet points with realistic, practical, and highly actionable wealth-building advice that matches their character's situation and can be applied in real life (e.g. setting up a debit order for savings on payday, paying down highest interest loans first, building an emergency fund, or negotiating shared expenses).

Keep your response engaging, concise, and focused on empowering them to build real wealth. Do not use boring corporate jargon.
`;

  try {
    const client = getAiClient();
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    res.json({ feedback: response.text });
  } catch (err: any) {
    console.warn("Gemini API Error in /api/coach, falling back to coach fallback:", err.message || err);
    try {
      const feedback = getCoachFallback(character, monthIndex, balance, savings, debt, stress);
      res.json({ feedback });
    } catch (fallbackErr: any) {
      console.error("Critical coach fallback error:", fallbackErr);
      res.status(500).json({ error: "Failed to generate coach feedback" });
    }
  }
});

// Serve Vite client app
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MaliGo Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
