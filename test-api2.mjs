const BASE_URL = 'http://localhost:3000';
const SESSION_TOKEN = 'baa848f0-0bbd-4dfb-8b3a-32fff59219cd';
const USER_ID = 'fcf1f18f-c3a8-43e3-8517-e022cc2e716b';
const HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SESSION_TOKEN}`
};

async function run() {
  console.log("--- 1. Testing Missing Goal / Profile ---");
  const recRes1 = await fetch(`${BASE_URL}/api/recommendations/generate`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ goalId: '00000000-0000-0000-0000-000000000000' })
  });
  console.log(`Generate Status: ${recRes1.status}`);
  console.log(await recRes1.json());
}
run();
