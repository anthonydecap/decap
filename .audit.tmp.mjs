import { chromium } from "@playwright/test";
const routes = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 820 } });
for (const r of routes) {
  const name = r.replace(/\//g, "_").replace(/^_/, "") || "root";
  try {
    await p.goto("http://localhost:3100" + r, { waitUntil: "networkidle", timeout: 120000 });
    await p.waitForTimeout(800);
    await p.screenshot({ path: "/private/tmp/claude-501/-Users-anthonydecap-Desktop-projectx-decap/e05ed80a-1a2d-42e4-b00c-0c2338ea49ed/scratchpad/audit/" + name + "-top.png" });
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); } window.scrollTo(0, document.body.scrollHeight); });
    await p.waitForTimeout(800);
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await p.waitForTimeout(400);
    await p.screenshot({ path: "/private/tmp/claude-501/-Users-anthonydecap-Desktop-projectx-decap/e05ed80a-1a2d-42e4-b00c-0c2338ea49ed/scratchpad/audit/" + name + "-bottom.png" });
    console.log("ok", r);
  } catch (e) { console.log("ERR", r, e.message.slice(0, 80)); }
}
await b.close();
