/* =====================================================================
   SITE CONTENT
   This is the only file you need to edit to change the words on the site.
   - Anything in [square brackets] is a placeholder waiting for your info.
   - Plain text only (no HTML). Keep the quotes and commas as they are.
   - Links must start with https:// to become clickable.
   - Each section's `label` is what's printed on its package and price tag;
     `short` is the one-word name shown on the shelf.
   ===================================================================== */
window.SITE_CONTENT = {

  owner: {
    name: "Sara",
    fullName: "Sara Patwardhan",
    facts: ["Stony Brook University", "Class of 2028", "Open to Summer 2027 internships"],
    headline: "I'm a junior at Stony Brook who loves working with data, especially the moment a pattern shows up that nobody expected. Pick something from the machine: each item holds a different part of the story.",
    location: "Stony Brook, NY",
    email: "sarapatwardhan1306@gmail.com",
    links: [
      { label: "LinkedIn", url: "https://www.linkedin.com/in/sara-patwardhan1306" },
      { label: "GitHub", url: "https://github.com/SARA130606" },
      { label: "Résumé (PDF)", url: "[link to your résumé]" }
    ]
  },

  machine: {
    signEnglish: "VENDING",
    signSide: "SNACKS"
  },

  /* Optional artwork. Put image files in the images/ folder and write the path,
     e.g. "images/soda.webp". Leave a value empty ("") to use the built-in drawing.
     Items work best as transparent PNG or WebP, about 400px wide. */
  images: {
    background: "",   // full street scene, 16:9, replaces the drawn street
    about: "", education: "", skills: "",
    experience: "", projects: "", leadership: "",
    honors: "", contact: ""
  },

  /* ---------- A1 · Sara Milk (about me) ---------- */
  about: {
    label: { name: "Sara Milk", price: "₩1,000", short: "About me" },
    title: "About me",
    intro: "Hi, I'm Sara. I'm a junior at Stony Brook University, and I'm happiest when I'm working with data.",
    paragraphs: [
      "Math has been part of my life for as long as I can remember, but what I love most is the patterns: the number that doesn't fit, or the category that's somehow far bigger than it should be. After finishing school in Abu Dhabi, I came to Stony Brook to study Applied Math & Statistics and Information Systems. That habit of noticing things is how I caught an old job at GoodWord dropping two thirds of all contacts into one catch-all bucket, and fixing it took job-title coverage from 30% to 84%. These days I build AI pipelines and then check them, because an answer that sounds right isn't always right. I'm looking for a Summer 2027 internship in data, AI engineering or quantitative finance, and I'd love to hear from you."
    ],
    facts: [
      { k: "Based in", v: "Stony Brook, NY" },
      { k: "Studying", v: "AMS + ISM (Finance), CS minor" },
      { k: "Graduating", v: "May 2028" },
      { k: "Off the clock", v: "Painting, photography, badminton, card games, and organizing things that probably didn't need organizing" }
    ]
  },

  /* ---------- A2 · Edu-Soda (can) ---------- */
  education: {
    label: { name: "Edu-Soda", price: "₩1,200", short: "Education" },
    title: "Education",
    intro: "Two majors, a minor, and a CFA exam in progress, all pointing at the same place: where math, data and finance meet.",
    entries: [
      {
        school: "Stony Brook University",
        degree: "B.S. Applied Mathematics & Statistics · B.S. Information Systems Management (Finance)",
        dates: "2024 – May 2028 (expected)",
        location: "Stony Brook, NY",
        details: "Minor in Computer Science. George C. Warner Scholarship and Global Scholarship. Dean's List every semester since 2024. Currently a CFA Level I candidate.",
        listLabel: "On campus",
        courses: ["Teaching Assistant, AMS 310: Probability & Statistics", "Founder, FinTech VIP research course"]
      },
      {
        school: "Cranleigh Abu Dhabi",
        degree: "A-levels: Mathematics, Further Mathematics, Physics, Computer Science",
        dates: "Graduated June 2024",
        location: "Abu Dhabi, UAE",
        details: "Where the math started in earnest. STEM, Academic and Sixth Form Scholarships, the Pearson Award of Excellence, and a 1530 on the SAT.",
        listLabel: "",
        courses: []
      }
    ]
  },

  /* ---------- B2 · Skill 500 (vitamin bottle) ---------- */
  skills: {
    label: { name: "Skill 500", price: "₩900", short: "Skills" },
    title: "Skills",
    intro: "The tools I reach for, sorted by the kind of problem they solve.",
    groups: [
      { group: "AI & LLMs", items: ["Agentic system design", "Multi-agent orchestration (LangChain, LlamaIndex)", "MCP tool integration", "RAG", "LLM output evaluation", "Human-in-the-loop review", "Prompt engineering", "Guardrail design"] },
      { group: "Programming", items: ["Python", "SQL", "Java", "R"] },
      { group: "Data & analytics", items: ["Snowflake", "Data warehousing", "Pipeline building", "Metabase", "Tableau", "Data validation", "Excel (VBA, pivot tables)"] },
      { group: "Quant & modeling", items: ["Statistical modeling", "Derivatives pricing (Greeks, VaR)", "Scenario analysis", "Back-testing"] }
    ]
  },

  /* ---------- A3 · Experience Chips (bag) ---------- */
  experience: {
    label: { name: "Experience Chips", price: "₩1,800", short: "Experience" },
    title: "Experience",
    intro: "From a Brooklyn startup to a university finance office to an energy agency in Abu Dhabi, one question sits under all of my work: is this data telling the truth?",
    entries: [
      {
        role: "Data Engineering Intern",
        org: "GoodWord",
        dates: "Jun 2026 – Present",
        location: "DUMBO, NY",
        summary: "GoodWord needed to know who its subscribers actually were. I built the pipeline that sorts them by role and seniority, and found out why the old one wasn't working.",
        bullets: [
          "Combined rule-based SQL, Snowflake queries, Crust Data enrichment and first-pass LLM labels into a single classification pipeline.",
          "Hand-labeled several thousand profiles as a reference set, then designed a human-in-the-loop review queue so low-confidence labels get a person's eyes before anyone relies on them.",
          "Traced a legacy job that was putting 67% of contacts into one catch-all segment. Joining an enrichment table nobody was using raised job-title coverage from 30% to 84%, at no extra data cost.",
          "Rebuilt the Metabase dashboard with weekly reporting and a new-subscriber view for the growth team."
        ],
        tags: ["SQL", "Snowflake", "LLMs", "Metabase"]
      },
      {
        role: "Data & Audit Assistant, International Finance Relations Office",
        org: "Stony Brook University",
        dates: "Sep 2026 – Present",
        location: "Stony Brook, NY",
        summary: "Checking the math behind international student recruitment: what each agency is owed, and whether the numbers agree.",
        bullets: [
          "Audited 500+ commission data points across 50+ recruitment agencies for Fall 2026, comparing them with the internal team's evaluations to catch discrepancies.",
          "Applied tiered commission rules to net tuition after scholarships, screening for visa type, Title IV status and study-abroad programs.",
          "Built funding and data verification reports in Excel that flag edge cases for a second look."
        ],
        tags: ["Excel", "Auditing", "Finance"]
      },
      {
        role: "AI Growth Intern",
        org: "WolfWorks",
        dates: "May 2026 – Aug 2026",
        location: "Brooklyn, NY",
        summary: "My job was to find where the AI broke. I evaluated a growth team's LLM features and connected the tools its agents relied on.",
        bullets: [
          "Scored an embedded lead-qualification chat on accuracy, reliability and failure modes, and wrote up the edge cases and guardrail gaps I found.",
          "Integrated MCP connectors to automate credential and AI persona management across agent workflows.",
          "Built the timesheet and invoicing tool the intern team used."
        ],
        tags: ["LLM evaluation", "MCP", "Agents"]
      },
      {
        role: "Office Assistant",
        org: "Stony Brook University",
        dates: "Jun 2025 – Present",
        location: "Stony Brook, NY",
        summary: "Reporting, finance and automation work that keeps a university office running smoothly.",
        bullets: [
          "Piloted an AI-assisted résumé review process that matches candidate profiles to role requirements.",
          "Automated monthly reporting in Excel with pivot tables, VLOOKUP and macros, cutting revision time by 20%.",
          "Prepared monthly P&L statements that reconcile department spending and revenue against budget forecasts.",
          "Migrated and validated 200+ records into a central database."
        ],
        tags: ["Excel", "Automation"]
      },
      {
        role: "Student Assistant",
        org: "SQUIRREL Education",
        dates: "Mar 2023 – Nov 2023",
        location: "Abu Dhabi, UAE",
        summary: "Surveys, data cleaning and bug hunting for an education startup in Abu Dhabi.",
        bullets: [
          "Designed and ran quantitative surveys that collected 1,000+ responses, then cleaned the data of duplicates and outliers before analysis.",
          "Beta-tested a cross-platform mobile game and logged bugs and UI/UX issues for the developers.",
          "Researched potential partners to support the company's market expansion."
        ],
        tags: ["Surveys", "QA testing"]
      },
      {
        role: "Intern",
        org: "International Renewable Energy Agency (IRENA)",
        dates: "Oct 2022 – May 2023",
        location: "Abu Dhabi, UAE",
        summary: "Supported the research and policy team at the International Renewable Energy Agency while I was still in high school.",
        bullets: [
          "Tracked distributed generation trends and clean-energy investment flows across member states.",
          "Turned technical energy data into clear briefing materials for analysts and senior advisors.",
          "Kept structured databases of energy statistics organized for the wider team."
        ],
        tags: ["Research", "Energy policy"]
      }
    ]
  },

  /* ---------- B1 · Project Ade (ice cup + pouch) ---------- */
  projects: {
    label: { name: "Project Ade", price: "₩2,500", short: "Projects" },
    title: "Projects",
    intro: "Things I've built with LLMs, data and statistics, and the question behind each one.",
    entries: [
      {
        title: "Multi-Agent Financial Planning Assistant",
        year: "",
        role: "LangChain · LlamaIndex · RAG",
        summary: "What if your spending, your taxes and your savings each had their own assistant? Specialized agents read personal financial documents with RAG, work in parallel, and hand results to each other through structured JSON.",
        stack: ["LangChain", "LlamaIndex", "RAG", "Python"],
        links: [{ label: "Source", url: "[link]" }],
        image: ""
      },
      {
        title: "AI Resume Optimizer & Job Matcher",
        year: "",
        role: "Python · spaCy · Flask",
        summary: "How well does a résumé really match a job? This tool parses both, scores the overlap with cosine similarity, flags the missing skills, and returns a ranked match report in a Flask app.",
        stack: ["Python", "spaCy", "Flask"],
        links: [{ label: "Source", url: "[link]" }],
        image: ""
      },
      {
        title: "Adaptive Learning Bot",
        year: "",
        role: "Claude API · Prompt engineering",
        summary: "People learn differently, so why should a chatbot explain everything the same way? This one remembers each user across sessions, works out how they like to learn, and switches between step-by-step, analogy-based and concise answers.",
        stack: ["Claude API", "Prompt engineering", "Python"],
        links: [{ label: "Source", url: "[link]" }],
        image: ""
      },
      {
        title: "Benford's Law & the Nifty-50",
        year: "",
        role: "Published research",
        summary: "In many real-world datasets, about 30% of numbers start with a 1. This paper tests whether Nifty-50 stock data follows that pattern, known as Benford's Law, and what it could mean for fraud detection when it doesn't.",
        stack: ["Statistics", "R", "Fraud detection"],
        links: [{ label: "Paper", url: "[link]" }],
        image: ""
      },
      {
        title: "Midnight CVS Portfolio",
        year: "2026",
        role: "Design · front end",
        summary: "This site. A late-night Seoul vending machine where every snack opens a different part of my portfolio, built in plain HTML, CSS and JavaScript with a hand-written physics loop and synthesized sound.",
        stack: ["HTML", "CSS", "JavaScript", "Web Audio"],
        links: [{ label: "Source", url: "[link to the GitHub repository]" }],
        image: ""
      }
    ]
  },

  /* ---------- B3 · Leader Ramyeon (cup noodle) ---------- */
  leadership: {
    label: { name: "Leader Ramyeon", price: "₩1,500", short: "Leadership" },
    title: "Leadership",
    intro: "The things I've started, organized and taught.",
    entries: [
      { role: "Founder", org: "FinTech VIP, Stony Brook University", dates: "Present",
        summary: "Building a FinTech research and development course at Stony Brook from the ground up: getting faculty on board, shaping what it covers, and enrolling the first students." },
      { role: "Teaching Assistant, AMS 310", org: "Stony Brook University", dates: "Present",
        summary: "Grading assignments and leading tutoring sessions for Survey of Probability and Statistics, and helping students get comfortable with the core ideas." },
      { role: "Student Intern", org: "COP28, Abu Dhabi", dates: "2023",
        summary: "Scheduled 20+ delegate sessions at the UN climate conference, ran on-site logistics, and coordinated speaker travel and stakeholder communications." },
      { role: "Head of Environmental Committee", org: "Cranleigh Abu Dhabi", dates: "High school",
        summary: "Worked with companies to bring sustainability projects into the school." },
      { role: "HSC Committee member", org: "Cranleigh Abu Dhabi", dates: "High school",
        summary: "Planned large cultural events and handled everything that came up on the day." }
    ]
  },

  /* ---------- C1 · Honor Stix (biscuit stick box) ---------- */
  honors: {
    label: { name: "Honor Stix", price: "₩1,700", short: "Honors" },
    title: "Honors & research",
    intro: "Scholarships, scores and a published paper.",
    entries: [
      { name: "Published research: Benford's Law & the Nifty-50", note: "Tested whether Nifty-50 stock data follows Benford's Law, and what the deviations could mean for fraud detection." },
      { name: "George C. Warner Scholarship", note: "Stony Brook University" },
      { name: "Global Scholarship", note: "Stony Brook University" },
      { name: "Dean's List", note: "Every semester, 2024 – present" },
      { name: "CFA Level I candidate", note: "Chartered Financial Analyst program" },
      { name: "STEM, Academic and Sixth Form Scholarships", note: "Cranleigh Abu Dhabi" },
      { name: "Pearson Award of Excellence", note: "A-levels" },
      { name: "SAT 1530", note: "" }
    ]
  },

  /* ---------- C2 · Hello Kimbap (triangle kimbap) ---------- */
  contact: {
    label: { name: "Hello Kimbap", price: "₩1,300", short: "Contact" },
    title: "Say hello",
    intro: "Email is the fastest way to reach me, and I read everything.",
    note: "Hiring for Summer 2027? I'd love to hear about your team and what you're working on."
  },

  /* ---------- C3 · the empty slot (always "out of stock") ---------- */
  wanted: {
    code: "C3",
    name: "Summer 2027 Internship",
    sign: "Your team here?",
    readout: "INSERT COIN TO RESERVE",
    // the popup that opens when someone picks C3
    popupTitle: "Sold out, for now",
    popupText: "I'm looking for a Summer 2027 internship. Insert a coin to reserve this slot and leave me a note about your team.",
    noteIntro: "Tell me about the role and your team, and how I can reach you."
  },

  /* ---------- Coin slot · guestbook ---------- */
  guestbook: {
    title: "Leave a note",
    intro: "Say hi, or tell me about a role you think I'd fit.",
    storageNote: "Notes stay in this browser for now."
  }
};
