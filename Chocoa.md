{
      "slug": "chocoa-pos",
      "number": "01",
      "tab": "systems",
      "category": "Point of Sale",
      "status": "In Production",
      "title": "Chocoa — Point of Sale",
      "subtitle": "A desktop POS and back-of-house system running daily across 55+ bakery outlets, handling sales, production, inventory, and cash from one offline-first app.",
      "tags": ["Tauri", "SvelteKit", "TypeScript", "Offline-First"],
      "miniImage": "/images/mini-chocoa-pos.svg",
      "meta": {
          "team": "Me, 3 engineers, a designer, and an outlet support team",
          "role": "Team Lead & Developer",
          "tools": "Tauri, SvelteKit, TypeScript",
          "status": "In Production"
      },
      "sections": [
          {
              "label": "01 Problem",
              "heading": "The Situation",
              "type": "text",
              "body": "A bakery chain was running 55+ outlets on paper and spreadsheets. Counter sales, production orders, stock movements, and the daily cash count were each tracked by hand, then 
  reconciled later — if at all. Counters sat on shaky internet, so anything web-based would stall mid-transaction during a rush. Owners had no reliable, same-day picture of what each outlet sold, produced,
  or banked."
          },
          {
              "label": "02 Thinking",
              "heading": "Key Decisions",
              "type": "cards",
              "cards": [
                  {
                      "title": "Native desktop over web app",
                      "description": "Counters needed to keep selling even when the network dropped. A Tauri desktop build runs locally on cheap outlet hardware, starts instantly, and never blocks a sale 
  on a server round-trip — something a hosted web app couldn't promise."
                  },
                  {
                      "title": "Offline-first by default",
                      "description": "Instead of treating offline as an edge case, the app assumes the network is unreliable. Transactions are captured locally and reconciled afterward, so a dropped 
  connection during a busy hour costs nothing."
                  },
                  {
                      "title": "One app for the whole outlet lifecycle",
                      "description": "Rather than separate tools for sales, kitchen, stock, and accounting, the full loop — production to stock to sale to cash close — lives in one app. Staff stop 
  re-keying the same numbers across systems, which is where most of the old errors came from."
                  },
                  {
                      "title": "Push data out, don't rebuild dashboards",
                      "description": "Heavy analytics don't belong on a POS terminal. The app feeds clean data to Grafana, Looker Studio, and messaging bots instead of carrying its own reporting weight — 
  owners watch the business from tools built for it."
                  }
              ]
          },
          {
              "label": "03 Solution",
              "heading": "What We Built",
              "type": "cards",
              "cards": [
                  {
                      "title": "🛒 Counter sales",
                      "description": "Staff ring up retail, custom orders, and credit (piutang) from one checkout flow that keeps working whether or not the internet does."
                  },
                  {
                      "title": "👨‍🍳 Kitchen & production orders",
                      "description": "Outlets place and track production orders, drafts, forecasts, and rejects, so the kitchen makes to actual demand instead of guesswork."
                  },
                  {
                      "title": "📦 Inventory control",
                      "description": "Stock adjustments, transfers between outlets, conversions, and opname keep every item accounted for as it moves through the day."
                  },
                  {
                      "title": "💵 Cash sessions & daily close",
                      "description": "Each shift opens a cash session, logs money in and out, and closes out with setoran and reconciliation — replacing the old end-of-day paper count."
                  },
                  {
                      "title": "📊 Reporting & CSV exports",
                      "description": "Per-item sales, purchasing, ledgers, cash variance, and more export cleanly for finance, no manual tallying required."
                  },
                  {
                      "title": "🔗 Dashboards & messaging",
                      "description": "Data flows out to Grafana and Looker Studio for owners, plus Telegram and WhatsApp microservices that push alerts and summaries where the team already works."
                  }
              ]
          },
          {
              "label": "04 Impact",
              "heading": "Results After Launch",
              "type": "metrics",
              "metrics": [
                  { "value": "55+", "label": "Outlets running it daily" },
                  { "value": "2×", "label": "Faster daily cash close" },
                  { "value": "0", "label": "Sales lost when the network drops" },
                  { "value": "Paper", "label": "Manual logs and counts retired" }
              ]
          }
      ]
  }