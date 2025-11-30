#!/usr/bin/env bun
// biome-ignore-all lint/suspicious/noConsole: CLI script requires console output

import { readFileSync } from 'node:fs';

// Read .env file
const envPath = new URL('../.env', import.meta.url).pathname;
const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .trim()
    .split('\n')
    .map((line) => {
      const idx = line.indexOf('=');
      return [line.slice(0, idx), line.slice(idx + 1)];
    }),
);

const {
  CHROME_CLIENT_ID,
  CHROME_CLIENT_SECRET,
  CHROME_REFRESH_TOKEN,
  CHROME_EXTENSION_ID,
} = env;

// Validate env vars
const missing = [];
if (!CHROME_CLIENT_ID) missing.push('CHROME_CLIENT_ID');
if (!CHROME_CLIENT_SECRET) missing.push('CHROME_CLIENT_SECRET');
if (!CHROME_REFRESH_TOKEN) missing.push('CHROME_REFRESH_TOKEN');
if (!CHROME_EXTENSION_ID) missing.push('CHROME_EXTENSION_ID');

if (missing.length > 0) {
  console.error('❌ Missing environment variables:', missing.join(', '));
  process.exit(1);
}

console.log('🔐 Testing Chrome Web Store API credentials...\n');
console.log('Extension ID:', CHROME_EXTENSION_ID);
console.log('Client ID:', `${CHROME_CLIENT_ID.slice(0, 20)}...`);

// Step 1: Get access token
console.log('\n📡 Step 1: Getting access token...');
const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    client_id: CHROME_CLIENT_ID,
    client_secret: CHROME_CLIENT_SECRET,
    refresh_token: CHROME_REFRESH_TOKEN,
    grant_type: 'refresh_token',
  }),
});

const tokenData = await tokenRes.json();

if (tokenData.error) {
  console.error('❌ Failed to get access token:');
  console.error('   Error:', tokenData.error);
  console.error('   Description:', tokenData.error_description);
  process.exit(1);
}

console.log(
  '✅ Access token obtained (expires in',
  tokenData.expires_in,
  'seconds)',
);

// Step 2: Fetch extension info
console.log('\n📡 Step 2: Fetching extension info...');
const infoRes = await fetch(
  `https://www.googleapis.com/chromewebstore/v1.1/items/${CHROME_EXTENSION_ID}?projection=DRAFT`,
  {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  },
);

const infoData = await infoRes.json();

if (infoData.error) {
  console.error('❌ Failed to fetch extension info:');
  console.error('   Status:', infoRes.status);
  console.error('   Error:', JSON.stringify(infoData.error, null, 2));

  if (infoRes.status === 403) {
    console.error('\n   💡 Possible causes:');
    console.error('   1. Chrome Web Store API not enabled in the GCP project');
    console.error(
      "   2. The authenticated user doesn't have access to this extension",
    );
    console.error('   3. Extension ownership not properly set up');
  }
  process.exit(1);
}

console.log('✅ Extension info retrieved:');
console.log('   ID:', infoData.id);
console.log('   Upload State:', infoData.uploadState);
console.log('   Current Version:', infoData.crxVersion || 'N/A');

// Step 3: Summary
console.log(`\n${'='.repeat(50)}`);
if (
  infoData.uploadState === 'SUCCESS' ||
  infoData.uploadState === 'NOT_FOUND'
) {
  console.log('✅ All checks passed! Chrome Web Store publishing should work.');
  console.log('\n   You can now update the GitHub secrets:');
  console.log('   gh secret set CHROME_CLIENT_ID');
  console.log('   gh secret set CHROME_CLIENT_SECRET');
  console.log('   gh secret set CHROME_REFRESH_TOKEN');
} else if (infoData.uploadState === 'IN_PROGRESS') {
  console.log('⚠️  Extension has an upload in progress.');
} else if (infoData.uploadState === 'FAILURE') {
  console.log(
    '⚠️  Extension has a failed upload. Check the developer dashboard.',
  );
}
