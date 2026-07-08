import { Character, CharacterType, FinancialEvent } from "../types";

export const CHARACTERS: Character[] = [
  {
    id: "tshepo",
    type: CharacterType.STUDENT,
    name: "Mali",
    role: "The Student Meerkat",
    avatar: "/src/assets/images/mali_meerkat_1783490207362.jpg",
    description: "A vigilant student meerkat starting out in the grassy university burrows. Juggling classes, tutoring gigs, and small allowances while avoiding high-interest credit traps.",
    startingBalance: 800,
    startingSavings: 200,
    startingDebt: 0,
    baseIncome: 1800, // Allowance + tutoring
    baseRent: 400, // Subsidized campus res
    baseGroceries: 300,
    baseBills: 150, // Mobile data, laundry
    goals: [
      "Graduate with R1,500+ in savings buffer",
      "Avoid credit cards and predatory retail loans",
      "Maintain physical & academic resilience"
    ]
  },
  {
    id: "lindiwe",
    type: CharacterType.YOUNG_PROFESSIONAL,
    name: "Mali",
    role: "The Corporate Meerkat",
    avatar: "/src/assets/images/mali_meerkat_1783490207362.jpg",
    description: "Now a young professional meerkat with an entry-level corporate burrow desk. Balancing lifestyle inflation, high rent, and compound student debt under the savannah sun.",
    startingBalance: 4000,
    startingSavings: 2000,
    startingDebt: 12000, // Student loans
    baseIncome: 18000,
    baseRent: 6000, // Modern apartment close to work
    baseGroceries: 1800,
    baseBills: 1200, // Fiber internet, gym, power
    goals: [
      "Repay the R12,000 student loan curse",
      "Amass an Emergency Savings Buffer of R15,000",
      "Secure at least R5,000 in high-yield compounding assets"
    ]
  },
  {
    id: "kofi",
    type: CharacterType.ENTREPRENEUR,
    name: "Mali",
    role: "The Entrepreneur Meerkat",
    avatar: "/src/assets/images/mali_meerkat_1783490207362.jpg",
    description: "A bold entrepreneur meerkat running a local trade and logistics fleet. Income fluctuates, machinery cracks under pressure, but huge scaling payoffs are possible.",
    startingBalance: 2500,
    startingSavings: 500,
    startingDebt: 3000, // Small business equipment loan
    baseIncome: 11000, // Variable sales revenue
    baseRent: 3500, // Shared workshop/studio
    baseGroceries: 1100,
    baseBills: 1400, // Fuel, workspace utilities, SaaS
    goals: [
      "Clear equipment loan of R3,000",
      "Upgrade delivery fleet equipment (invest R4,000)",
      "Grow net worth to R25,000 through high sales margins"
    ]
  }
];

export const MONTHS = [
  { name: "January", theme: "Back-to-School & Fresh Start" },
  { name: "February", theme: "Valentine temptations & Commute plans" },
  { name: "March", theme: "Autumn transitions & Tax Planning" },
  { name: "April", theme: "Easter holidays & Technology upgrades" },
  { name: "May", theme: "Winter chills & Health needs" },
  { name: "June", theme: "Mid-year break & Side-gig ventures" },
  { name: "July", theme: "Extreme weather & Clothing sales" },
  { name: "August", theme: "Investment opportunities & Savings push" },
  { name: "September", theme: "Spring Day social & Home spruce-up" },
  { name: "October", theme: "Exam/Quarter-end crunch & Data overload" },
  { name: "November", theme: "Black Friday bait & Holiday gifts" },
  { name: "December", theme: "Festive season & Long-term rewards" }
];

// Generates 5 tailored decision events for a given character and month index
export function getScenariosForMonth(charType: CharacterType, monthIndex: number): FinancialEvent[] {
  const monthName = MONTHS[monthIndex].name;

  if (charType === CharacterType.STUDENT) {
    return [
      {
        id: `student_rent_${monthIndex}`,
        title: "Monthly Rent & Utility Day",
        description: `It's the beginning of ${monthName}. Your subsidized campus residence fee of R400 and laundry charge of R100 are due.`,
        category: "rent",
        icon: "Home",
        options: [
          {
            text: "Pay standard res fees (R500)",
            description: "Keep your comfortable campus room safe.",
            balanceChange: -500,
            savingsChange: 0,
            debtChange: 0,
            stressChange: -5
          },
          {
            text: "Become a dorm assistant (Save R250, +15 Stress)",
            description: "Work 5 hours a week cleaning/monitoring the floor to get a half-price rent discount.",
            balanceChange: -250,
            savingsChange: 0,
            debtChange: 0,
            stressChange: 15
          }
        ]
      },
      {
        id: `student_grocery_${monthIndex}`,
        title: "Monthly Grocery Run",
        description: "Your cupboard is bare. You need to stock up on food and toiletries for the weeks ahead.",
        category: "grocery",
        icon: "ShoppingCart",
        options: [
          {
            text: "Bulk raw staples & store brand (R300)",
            description: "Buy large bags of maize meal, rice, beans, frozen veggies, and house brands.",
            balanceChange: -300,
            savingsChange: 0,
            debtChange: 0,
            stressChange: 5
          },
          {
            text: "Premium ready-meals & snacks (R650)",
            description: "Buy microwavable dinners, soft drinks, branded chips, and luxury hygiene brands.",
            balanceChange: -650,
            savingsChange: 0,
            debtChange: 0,
            stressChange: -15
          },
          {
            text: "Extreme budget: instant noodles only (R120)",
            description: "Live purely on cheap instant noodles. Cheap, but very low nutritional value.",
            balanceChange: -120,
            savingsChange: 0,
            debtChange: 0,
            stressChange: 25
          }
        ]
      },
      ...getStudentSpecificMiddleEvents(monthIndex),
      {
        id: `student_savings_${monthIndex}`,
        title: "Monthly Savings Decision",
        description: `You have completed most tasks for ${monthName}. Your R1,800 allowance/tutoring revenue cleared. Do you want to set aside money?`,
        category: "investment",
        icon: "PiggyBank",
        options: [
          {
            text: "Save R400 into Student Savings (7% interest)",
            description: "Secure a portion of your money immediately. Teaches pay-yourself-first habit.",
            balanceChange: -400,
            savingsChange: 400,
            debtChange: 0,
            stressChange: -5,
            longTermBenefit: "Your savings will compound month-over-month, building an emergency buffer."
          },
          {
            text: "Save R150 and keep cash flexible",
            description: "Keep more cash in your wallet for emergencies, but save a little.",
            balanceChange: -150,
            savingsChange: 150,
            debtChange: 0,
            stressChange: 0
          },
          {
            text: "Save R0: Live in the moment!",
            description: "Spend everything left on dynamic campus events and snacks.",
            balanceChange: 0,
            savingsChange: 0,
            debtChange: 0,
            stressChange: -10
          }
        ]
      }
    ];
  } else if (charType === CharacterType.YOUNG_PROFESSIONAL) {
    return [
      {
        id: `pro_rent_${monthIndex}`,
        title: "Apartment Rent & Bills",
        description: `It's the 1st of ${monthName}. Your stylish urban flat lease is R6,000, and your shared water/electricity bill is R800.`,
        category: "rent",
        icon: "Home",
        options: [
          {
            text: "Pay rent and bills in full (R6,800)",
            description: "Enjoy your secure and beautiful living environment.",
            balanceChange: -6800,
            savingsChange: 0,
            debtChange: 0,
            stressChange: -10
          },
          {
            text: "Sublet a room to a roommate (Save R2,500, +15 Stress)",
            description: "Rent out your lounge/spare bedroom to a quiet roommate. Less privacy, but huge rent relief.",
            balanceChange: -4300,
            savingsChange: 0,
            debtChange: 0,
            stressChange: 15
          }
        ]
      },
      {
        id: `pro_grocery_${monthIndex}`,
        title: "Organic Groceries vs Discount Outlet",
        description: "Time to buy groceries. Do you visit the high-end organic supermarket or the discount suburban warehouse?",
        category: "grocery",
        icon: "ShoppingCart",
        options: [
          {
            text: "Discount suburban warehouse (R1,400)",
            description: "Buy house brands and staples in bulk. Solid quality, low prices.",
            balanceChange: -1400,
            savingsChange: 0,
            debtChange: 0,
            stressChange: 0
          },
          {
            text: "High-end organic market + delivery (R2,800)",
            description: "Fresh premium avocados, free-range chicken, pre-cut veggies, and direct delivery.",
            balanceChange: -2800,
            savingsChange: 0,
            debtChange: 0,
            stressChange: -15
          },
          {
            text: "Meal prep box delivery service (R2,000)",
            description: "Pre-portioned ingredients and recipe cards. Balanced price and high convenience.",
            balanceChange: -2000,
            savingsChange: 0,
            debtChange: 0,
            stressChange: -5
          }
        ]
      },
      ...getProSpecificMiddleEvents(monthIndex),
      {
        id: `pro_savings_${monthIndex}`,
        title: "Compounding Growth Choice",
        description: `You received your monthly salary (R18,000). How much will you allocate to investments or paying off student loans?`,
        category: "investment",
        icon: "TrendingUp",
        options: [
          {
            text: "Aggressively repay Student Loan (Pay R4,000)",
            description: "Tackle high-interest debt directly. Every Rand repaid avoids future compounding interest.",
            balanceChange: -4000,
            savingsChange: 0,
            debtChange: -4000,
            stressChange: -10,
            longTermBenefit: "Decreases debt rapidly, reducing interest payments in subsequent months."
          },
          {
            text: "Invest R3,000 in Tax-Free Savings Account (TFSA) (11% return)",
            description: "Buy diversified index funds. Highly tax-efficient, high growth over time.",
            balanceChange: -3000,
            savingsChange: 3000,
            debtChange: 0,
            stressChange: -5,
            longTermBenefit: "Earns high compound interest, boosting your net worth each month."
          },
          {
            text: "Minimum loan payment only (R1,000), spend the rest",
            description: "Pay the required minimum R1,000 on your loan and spend leftover cash on weekend trips.",
            balanceChange: -1000,
            savingsChange: 0,
            debtChange: -1000,
            stressChange: 5
          }
        ]
      }
    ];
  } else {
    // Entrepreneur (KOFI)
    return [
      {
        id: `ent_rent_${monthIndex}`,
        title: "Workshop Lease & Operations",
        description: `Your logistics and retail workshop rent is R3,500. Internet and scheduling SaaS tools cost R800.`,
        category: "rent",
        icon: "Home",
        options: [
          {
            text: "Pay standard business costs (R4,300)",
            description: "Ensure your tools and workspace are kept fully functional.",
            balanceChange: -4300,
            savingsChange: 0,
            debtChange: 0,
            stressChange: -5
          },
          {
            text: "Negotiate shared workshop co-op (Save R1,500, +10 Stress)",
            description: "Share the space with another local designer. Slightly noisier and cramped but cheaper.",
            balanceChange: -2800,
            savingsChange: 0,
            debtChange: 0,
            stressChange: 10
          }
        ]
      },
      {
        id: `ent_grocery_${monthIndex}`,
        title: "Personal Groceries & Business Snacks",
        description: "Feeding yourself and keeping quick snacks in the shop for clients/helpers.",
        category: "grocery",
        icon: "ShoppingCart",
        options: [
          {
            text: "Cook at home and pack lunchbox (R900)",
            description: "Healthy meals cooked in bulk on Sunday night. Saves enormous cash.",
            balanceChange: -900,
            savingsChange: 0,
            debtChange: 0,
            stressChange: -2
          },
          {
            text: "Dine out with clients & takeaway (R2,200)",
            description: "Frequent takeaway, premium coffee shops, and footing the bill for a prospective client.",
            balanceChange: -2200,
            savingsChange: 0,
            debtChange: 0,
            stressChange: -10
          }
        ]
      },
      ...getEntSpecificMiddleEvents(monthIndex),
      {
        id: `ent_savings_${monthIndex}`,
        title: "Reinvestment vs Cash Buffer",
        description: "Your month-end sales revenue of R11,000 has cleared. How will you split the net surplus?",
        category: "investment",
        icon: "Coins",
        options: [
          {
            text: "Reinvest R3,000 in Marketing & Stock",
            description: "Purchase higher inventory and run targeted social ads. Compounds business growth.",
            balanceChange: -3000,
            savingsChange: 1500, // Part cash reserve, part high equity
            debtChange: 0,
            stressChange: -8,
            longTermBenefit: "Boosts future monthly sales revenue! Your business expands its customer base."
          },
          {
            text: "Save R2,000 Cash Buffer in Business Savings (6% interest)",
            description: "Build a rock-solid security fund for slow business seasons.",
            balanceChange: -2000,
            savingsChange: 2000,
            debtChange: 0,
            stressChange: -12
          },
          {
            text: "Take R4,000 out as personal dividend and spend it",
            description: "Treat yourself to a luxury weekend away. Fun but leaves little cash inside the business.",
            balanceChange: -4000,
            savingsChange: 0,
            debtChange: 0,
            stressChange: -15
          }
        ]
      }
    ];
  }
}

// Student Specific Middle Events (2 per month, tailored to monthIndex)
function getStudentSpecificMiddleEvents(monthIndex: number): FinancialEvent[] {
  switch (monthIndex) {
    case 0: // Jan
      return [
        {
          id: "student_textbooks_jan",
          title: "The Textbook Dilemma",
          description: "Your classes require three heavy reference textbooks.",
          category: "emergency",
          icon: "BookOpen",
          options: [
            {
              text: "Buy brand new textbooks (R800)",
              description: "Pristine condition, includes online test portals.",
              balanceChange: -800,
              savingsChange: 0,
              debtChange: 0,
              stressChange: -15
            },
            {
              text: "Buy secondhand from senior students (R300)",
              description: "Drawn-in pages, but contains all necessary chapters.",
              balanceChange: -300,
              savingsChange: 0,
              debtChange: 0,
              stressChange: -5
            },
            {
              text: "Find sketchy free PDFs online (R0, +15 Stress)",
              description: "Saves R800, but some pages are missing and you risk virus warnings.",
              balanceChange: 0,
              savingsChange: 0,
              debtChange: 0,
              stressChange: 15
            }
          ]
        },
        {
          id: "student_social_jan",
          title: "Freshers Welcome Party",
          description: "A huge concert on the campus lawns. All your friends are going VIP.",
          category: "social",
          icon: "PartyPopper",
          options: [
            {
              text: "Go VIP (R400)",
              description: "Front row access, free soft drinks, huge FOMO avoided.",
              balanceChange: -400,
              savingsChange: 0,
              debtChange: 0,
              stressChange: -20
            },
            {
              text: "Get General Entry (R150)",
              description: "Standard entry. Good fun but further back.",
              balanceChange: -150,
              savingsChange: 0,
              debtChange: 0,
              stressChange: -5
            },
            {
              text: "Skip party, play boardgames (R0)",
              description: "Stay in res, study, and save money.",
              balanceChange: 0,
              savingsChange: 0,
              debtChange: 0,
              stressChange: 10
            }
          ]
        }
      ];
    case 1: // Feb
      return [
        {
          id: "student_commute_feb",
          title: "Daily Transport Choice",
          description: "Class schedule is intense. How do you plan to commute to campus this month?",
          category: "emergency",
          icon: "Bus",
          options: [
            {
              text: "Buy Unlimited Monthly Train/Bus Card (R350)",
              description: "Safe, reliable, fixed cost. High upfront, zero worries later.",
              balanceChange: -350,
              savingsChange: 0,
              debtChange: 0,
              stressChange: -10
            },
            {
              text: "Pay cash taxi daily (R500 total estimated)",
              description: "Flexible but you are at the mercy of driver strikes and fare increases.",
              balanceChange: -500,
              savingsChange: 0,
              debtChange: 0,
              stressChange: 5
            },
            {
              text: "Walk/ride a bicycle (R0, +20 Stress)",
              description: "Sweaty, tiring, and slow. But absolutely free.",
              balanceChange: 0,
              savingsChange: 0,
              debtChange: 0,
              stressChange: 20
            }
          ]
        },
        {
          id: "student_valentine_feb",
          title: "Valentine's Day Date",
          description: "Your crush hints at wanting to eat at a nice Italian restaurant.",
          category: "social",
          icon: "Heart",
          options: [
            {
              text: "Book fine Italian restaurant (R500)",
              description: "Impressive, romantic, but very expensive for a student.",
              balanceChange: -500,
              savingsChange: 0,
              debtChange: 0,
              stressChange: -15
            },
            {
              text: "Make handmade picnic on campus (R100)",
              description: "Highly thoughtful, sweet, budget-friendly.",
              balanceChange: -100,
              savingsChange: 0,
              debtChange: 0,
              stressChange: -5
            },
            {
              text: "Pretend you don't celebrate (R0, +25 Stress)",
              description: "Create massive awkwardness, but save cash.",
              balanceChange: 0,
              savingsChange: 0,
              debtChange: 0,
              stressChange: 25
            }
          ]
        }
      ];
    default:
      // Generic monthly events for other months
      return [
        {
          id: `student_generic_mid1_${monthIndex}`,
          title: "Tech Crisis: Slow Mobile Data",
          description: "Your project requires heavy online research. Your monthly data cap is finished.",
          category: "emergency",
          icon: "Wifi",
          options: [
            {
              text: "Buy premium high-speed bundle (R180)",
              description: "Instant access, complete convenience.",
              balanceChange: -180,
              savingsChange: 0,
              debtChange: 0,
              stressChange: -10
            },
            {
              text: "Use slow library campus WiFi (R0, +15 Stress)",
              description: "Walk to library in freezing wind, wait in queues, but save R180.",
              balanceChange: 0,
              savingsChange: 0,
              debtChange: 0,
              stressChange: 15
            }
          ]
        },
        {
          id: `student_generic_mid2_${monthIndex}`,
          title: "Tutoring Side Hustle Opportunity",
          description: "A high-school parent offers you a gig tutoring mathematics. It takes 6 hours, but requires transport costs.",
          category: "luxury", // treat as opportunity
          icon: "Sparkles",
          options: [
            {
              text: "Accept: Spend R80 transport (+R450 Income)",
              description: "Increase your balance, though it cuts into study time (+10 Stress).",
              balanceChange: 370,
              savingsChange: 0,
              debtChange: 0,
              stressChange: 10
            },
            {
              text: "Decline: Focus on exams",
              description: "Keep stress low and study hard.",
              balanceChange: 0,
              savingsChange: 0,
              debtChange: 0,
              stressChange: -10
            }
          ]
        }
      ];
  }
}

// Young Professional Specific Middle Events (2 per month, tailored to monthIndex)
function getProSpecificMiddleEvents(monthIndex: number): FinancialEvent[] {
  switch (monthIndex) {
    case 0: // Jan
      return [
        {
          id: "pro_lifestyle_jan",
          title: "Gym Membership Upgrade",
          description: "A trendy boutique fitness center opens right next to your apartment. Everyone at work signed up.",
          category: "luxury",
          icon: "Dumbbell",
          options: [
            {
              text: "Join Elite Boutique Gym (R800/month commitment)",
              description: "Includes steam room, personal classes, and social networking with colleagues.",
              balanceChange: -800,
              savingsChange: 0,
              debtChange: 0,
              stressChange: -15
            },
            {
              text: "Stick to local municipal park & run (R0)",
              description: "Free and healthy, though requires discipline and cold morning runs.",
              balanceChange: 0,
              savingsChange: 0,
              debtChange: 0,
              stressChange: 5
            }
          ]
        },
        {
          id: "pro_commute_jan",
          title: "The Commuting Grind",
          description: "Your old hatchback needs high maintenance. You are tempted to upgrade to a sleek sedan on vehicle finance.",
          category: "emergency",
          icon: "Car",
          options: [
            {
              text: "Fix old hatchback (R3,500 once-off)",
              description: "Unspectacular but paid off. Keeps you debt-free.",
              balanceChange: -3500,
              savingsChange: 0,
              debtChange: 0,
              stressChange: -5
            },
            {
              text: "Buy new Sedan on car loan (R4,500/month + R10,000 deposit)",
              description: "Incurs R10,000 cash charge immediately, plus adds persistent monthly car debt.",
              balanceChange: -10000,
              savingsChange: 0,
              debtChange: 10000, // add to debt
              stressChange: -15
            },
            {
              text: "Use e-hailing/Uber daily (R2,000 total)",
              description: "No maintenance, but highly expensive and at the mercy of peak pricing.",
              balanceChange: -2000,
              savingsChange: 0,
              debtChange: 0,
              stressChange: 5
            }
          ]
        }
      ];
    default:
      return [
        {
          id: `pro_generic_mid1_${monthIndex}`,
          title: "Weekend Getaway with Colleagues",
          description: "Colleagues are booking a luxury coastal Airbnb cabin for the weekend.",
          category: "social",
          icon: "Palmtree",
          options: [
            {
              text: "Go: Luxury Cabin & dining (R3,000)",
              description: "Spectacular ocean views, premium food, incredible networking.",
              balanceChange: -3000,
              savingsChange: 0,
              debtChange: 0,
              stressChange: -20
            },
            {
              text: "Suggest local day-hike instead (R200)",
              description: "Healthy, scenic, highly cost-effective, and still social.",
              balanceChange: -200,
              savingsChange: 0,
              debtChange: 0,
              stressChange: -5
            },
            {
              text: "Skip and stay home to rest (R0)",
              description: "Saves R3,000, but feels lonely (+10 Stress).",
              balanceChange: 0,
              savingsChange: 0,
              debtChange: 0,
              stressChange: 10
            }
          ]
        },
        {
          id: `pro_generic_mid2_${monthIndex}`,
          title: "Dental Emergency",
          description: "You develop a sudden, excruciating wisdom tooth pain. It requires urgent dental extraction.",
          category: "emergency",
          icon: "Activity",
          options: [
            {
              text: "Pay private dentist cash (R2,500)",
              description: "Immediate relief, professional treatment.",
              balanceChange: -2500,
              savingsChange: 0,
              debtChange: 0,
              stressChange: -15
            },
            {
              text: "Dip into Savings Buffer (Use Savings R2,500)",
              description: "Protects your active current balance, but drains your savings reservoir.",
              balanceChange: 0,
              savingsChange: -2500,
              debtChange: 0,
              stressChange: -10
            },
            {
              text: "Go to public hospital queue (R200, +25 Stress)",
              description: "Wait 8 hours in pain, high stress, but saves R2,300.",
              balanceChange: -200,
              savingsChange: 0,
              debtChange: 0,
              stressChange: 25
            }
          ]
        }
      ];
  }
}

// Entrepreneur Specific Middle Events (2 per month)
function getEntSpecificMiddleEvents(monthIndex: number): FinancialEvent[] {
  switch (monthIndex) {
    case 0: // Jan
      return [
        {
          id: "ent_scooter_jan",
          title: "Delivery Scooter Breakdown",
          description: "Your logistics delivery scooter engine seizes up. You cannot deliver stock without it.",
          category: "emergency",
          icon: "ShieldAlert",
          options: [
            {
              text: "Pay professional repair cash (R2,000)",
              description: "Gets the scooter running instantly. Solid warranty.",
              balanceChange: -2000,
              savingsChange: 0,
              debtChange: 0,
              stressChange: -15
            },
            {
              text: "Take a high-interest cash loan (R0 upfront, +R2,500 Debt)",
              description: "Repair is handled, but you incur a R2,500 high-interest debt payload.",
              balanceChange: 0,
              savingsChange: 0,
              debtChange: 2500,
              stressChange: 10
            },
            {
              text: "Rent a bicycle & deliver slowly (R400, +25 Stress)",
              description: "Very exhausting and slow, deliveries are late (-R1,000 sales later).",
              balanceChange: -1400,
              savingsChange: 0,
              debtChange: 0,
              stressChange: 25
            }
          ]
        },
        {
          id: "ent_supplies_jan",
          title: "Bulk Inventory Opportunity",
          description: "A wholesaler offers a 40% discount if you purchase 3 months of inventory packaging in advance.",
          category: "luxury",
          icon: "Package",
          options: [
            {
              text: "Buy bulk packaging (R2,500)",
              description: "Locks in low material costs. Long-term business margin boost.",
              balanceChange: -2500,
              savingsChange: 0,
              debtChange: 0,
              stressChange: -5,
              longTermBenefit: "Saves material expense, boosting sales margins by +R500 in future months!"
            },
            {
              text: "Stick to small pay-as-you-go boxes (R600)",
              description: "Keeps cash flexible, though long term cost is higher.",
              balanceChange: -600,
              savingsChange: 0,
              debtChange: 0,
              stressChange: 0
            }
          ]
        }
      ];
    default:
      return [
        {
          id: `ent_generic_mid1_${monthIndex}`,
          title: "SaaS Tools Annual Subscriptions",
          description: "Your inventory tracking and customer scheduling SaaS tool is offering a 30% discount on an annual lock-in.",
          category: "investment",
          icon: "Globe",
          options: [
            {
              text: "Buy annual license (R1,800 once-off)",
              description: "Avoids monthly subscription fee. Great business discount.",
              balanceChange: -1800,
              savingsChange: 0,
              debtChange: 0,
              stressChange: -5,
              longTermBenefit: "Reduces future monthly expenses by R200 every month."
            },
            {
              text: "Stick to monthly subscription (R250/month)",
              description: "Low upfront cost, but higher cost over the year.",
              balanceChange: -250,
              savingsChange: 0,
              debtChange: 0,
              stressChange: 5
            }
          ]
        },
        {
          id: `ent_generic_mid2_${monthIndex}`,
          title: "Bulk Order Rush Job",
          description: "A corporate client wants 200 priority deliveries. You must hire casual workers and pay fuel upfront.",
          category: "social",
          icon: "Users",
          options: [
            {
              text: "Accept: Spend R2,000 upfront (+R4,500 Profit)",
              description: "High profit payout (+R2,500 net), but high coordination stress (+15 Stress).",
              balanceChange: 2500,
              savingsChange: 0,
              debtChange: 0,
              stressChange: 15
            },
            {
              text: "Decline: Protect your energy",
              description: "Stay rested, skip the high-stress rush job.",
              balanceChange: 0,
              savingsChange: 0,
              debtChange: 0,
              stressChange: -10
            }
          ]
        }
      ];
  }
}
