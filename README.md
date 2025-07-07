



# <svg className="w-8 h-8 text-gray-700" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <title>deepin</title>
              <path d="M16.104.696c-1.724-.63-3.49-.8-5.205-.64-1.988.157-2.958.772-2.9.661-3.251 1.16-6 3.657-7.272 7.157-2.266 6.234.944 13.128 7.168 15.398 6.228 2.27 13.111-.945 15.378-7.179C25.54 9.86 22.33 2.966 16.104.696zM8.305 22.145a10.767 10.767 0 0 1-1.867-.904c2.9.223 6.686-.445 9.239-2.834 0 0 4.866-3.888 1.345-10.269 0 0 .568 2.572-.156 4.687 0 0-.69 2.877-3.757 3.712-4.517 1.231-9.664-1.93-11.816-3.463-.162-1.574-.018-3.2.56-4.788.855-2.352 2.463-4.188 4.427-5.42-.49 3.436-.102 6.6.456 7.925.749 1.777 2.05 3.85 4.59 4.115 2.54.267 3.94-2.11 3.94-2.11 1.304-1.98 1.508-4.823 1.488-4.892-.02-.07-.347-.257-.347-.257-.877 3.549-2.323 4.734-2.323 4.734-2.28 2.201-3.895.675-3.895.675-1.736-1.865-.52-4.895-.52-4.895.68-2.064 2.66-5.084 4.905-6.62.374.092.75.15 1.12.284a10.712 10.712 0 0 1 3.554 2.16c-1.641.599-4.291 1.865-4.291 1.865-4.201 1.77-4.485 4.446-4.485 4.446-.435 2.758 1.754 1.59 1.754 1.59 2.252-1.097 3.359-4.516 3.359-4.516-.703-.134-1.257.08-1.257.08-.899 2.22-2.733 3.132-2.733 3.132-.722.382-.89-.293-.89-.293-.122-.506.522-.592.522-.592 1-.389 1.639-1.439 1.784-1.868.144-.43.412-.464.412-.464a12.998 12.998 0 0 1 2.619-.535c1.7-.209 4.303.602 4.303.602.584.235 1.144.41 1.641.551.954 2.384 1.105 5.098.16 7.7-2.039 5.61-8.236 8.504-13.841 6.462z" />
            </svg> ThreatLens AI – MindFort Technical Take-Home Submission

Welcome to **ThreatLens AI**, an autonomous system designed to visualize and reason over vulnerabilities using a **Vulnerability Knowledge Graph** and **Multi-Agent Chat System**. Built with Next.js, TypeScript, Litellm, and `react-force-graph-2d`, the solution offers both analytical insight and intuitive UX.

 **Live Deployment**:
**Main app**: [https://threatlensai.vercel.app/](https://threatlensai.vercel.app/)
**Knowledge graph**: [https://threatlensai.vercel.app/graph](https://threatlensai.vercel.app/graph)
**Graph API JSON**: [https://threatlensai.vercel.app/api/graph](https://threatlensai.vercel.app/api/graph)

---

## Project Objective

> Build a full-stack **Vulnerability Knowledge Graph & Multi-Agent Reasoning Chat System** that can ingest security findings, form relational insights between entities, and allow users to query risks or attack paths in natural language.

---

##  Features

### Vulnerability Knowledge Graph (`/graph`)

* Graph visualization of findings using:

  * Nodes for entities: Vulnerability, OWASP, CVE, CWE, Severity, Services, Packages
  * Edges for relationships: Shared libraries, cause-effect links, co-occurrence
* Severity-based node sizing (Critical > High > Medium > Low)
* Color-coded nodes by entity type
* Interactive zoom and labels

![Graph Screenshot](Images/graph.png)

---

###  RESTful Graph API (`/api/graph`)

* Returns nodes and edges from ingested findings
* Pre-processed to include:

  * Severity
  * Degree centrality
  * Explicit and inferred relationships

![Graph API Output](Images/graphapi.png)

---

### Multi-Agent Reasoning Chat Interface (`/`)

* Users can ask questions like:

  * “Are there any composite risks?”
  * “Which services share components?”
  * “Could an attacker chain vulnerabilities?”
* Behind the scenes:

  * Prompts are routed to agents (via Litellm) simulating multi-perspective reasoning
  * Responses contain explanatory insight, not just answers

![Chat Screenshot 1](Images/page1.png)
![Chat Screenshot 2](Images/page2.png)

---

## Tech Stack

| Layer         | Technology                                                               |
| ------------- | ------------------------------------------------------------------------ |
| Frontend      | Next.js (App Router), Tailwind CSS                                       |
| Visualization | `react-force-graph-2d`                                                   |
| Backend       | TypeScript API Routes                                                    |
| LLM Routing   | [LiteLLM](https://docs.litellm.ai/docs/) – GPT-4.1, o4-mini, Grok-3-mini |
| Deployment    | Vercel                                                                   |
| Data Source   | Findings JSON (provided in assignment)                                   |

---

## Knowledge Graph Schema

Entities (`nodes`):

* `finding`, `OWASP`, `severity`, `CWE`, `CVE`, `service`, `package`

Relationships (`edges`):

* `finding -> CWE`
* `finding -> service`
* `service -> package`
* `finding -> severity`
* `CWE -> CVE`
* Inferred: shared vulnerable libraries, misconfig lineage

Node sizes vary by severity:

* Critical: largest
* High, Medium, Low: scaled down

---

## Project Structure

```
mindfort-assignment/
├── .next/                      # Next.js build output
├── images/                     # Screenshots
├── node_modules/
├── public/                     # Static assets
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/           # API route for chat agent
│   │   │   └── graph/          # API route for graph data
│   │   ├── graph/              # Force-directed graph page
│   │   └── page.tsx            # Home page with chat UI
│   └── lib/
│       ├── enrichment.ts       # Data enrichment logic
│       ├── findings.ts         # Parsed JSON data
│       └── types.ts            # Shared types
├── .gitignore
├── eslint.config.mjs
├── next.config.mjs
├── package.json
├── tsconfig.json
├── postcss.config.js
├── tailwind.config.ts
└── README.md                   # This file
```

---

## Reasoning Capability

The system identifies **composite risks** automatically. For example:

> “spring-web\@5.3.20 is used by both `order-svc` and `auth-svc`. If one service is compromised, it can lead to lateral movement into the other.”

This type of multi-stage inference is powered by simple graph traversals and LLM-assisted rules in the agent prompt.

---

## Deployment Notes

* Hosted on Vercel (fully SSR-compliant)
* `react-force-graph-2d` is dynamically imported to avoid `window is not defined` errors
* Works across browsers and devices

---

## Environment Variables (sample)

```bash
LITELLM_API_KEY=sk-...
LITELLM_BASE_URL=https://...
```

These are securely stored in Vercel's dashboard and not hardcoded.

---

## Getting Started Locally

```bash
git clone https://github.com/yourusername/mindfort-assignment
cd mindfort-assignment
npm install
cp .env.example .env.local
# add your Litellm credentials

npm run dev
```

Then visit [localhost:3000](http://localhost:3000)

---

## Improvements & Next Steps

* Add editable graph interface to simulate changes
* Add export as PDF or report
* Extend agent memory for multi-turn reasoning
* Integrate Neo4j if scale increases
* RAG + semantic memory for findings ingestion

---

## Submission Instructions

* ✅ Code hosted on GitHub
* ✅ Deployed on Vercel: [https://threatlensai.vercel.app/](https://threatlensai.vercel.app/)
* ✅ All routes functional: `/`, `/graph`, `/api/graph`
* ✅ Screenshots and README included

---

## Author

Built with ❤️ by Shubham Vyas
[GitHub](https://github.com/shhubhxm) • [LinkedIn](https://www.linkedin.com/in/shubham-vyas-2594a2152/)

---