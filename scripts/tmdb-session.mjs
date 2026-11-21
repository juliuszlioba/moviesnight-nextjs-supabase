// One-time helper: creates a TMDB session id so the app can write ratings and
// watchlist changes to your TMDB account.
//
//   pnpm tmdb:session
//
// Then put the printed TMDB_SESSION_ID into .env (and your hosting env vars).
import { createInterface } from "node:readline/promises";

const API = "https://api.themoviedb.org/3";
const apiKey = process.env.TMDB_API_KEY;

if (!apiKey) {
  console.error("TMDB_API_KEY is missing. Add it to .env first.");
  process.exit(1);
}

async function tmdb(path, init) {
  const res = await fetch(`${API}${path}?api_key=${apiKey}`, {
    ...init,
    headers: { "Content-Type": "application/json;charset=utf-8" },
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(`${path}: ${data.status_message ?? res.status}`);
  }
  return data;
}

const { request_token } = await tmdb("/authentication/token/new");

console.log("\n1. Open this link and click Approve:\n");
console.log(`   https://www.themoviedb.org/authenticate/${request_token}\n`);

const rl = createInterface({ input: process.stdin, output: process.stdout });
await rl.question("2. Press Enter here once approved... ");
rl.close();

const { session_id } = await tmdb("/authentication/session/new", {
  method: "POST",
  body: JSON.stringify({ request_token }),
});

console.log("\nAdd this to .env:\n");
console.log(`TMDB_SESSION_ID=${session_id}\n`);
