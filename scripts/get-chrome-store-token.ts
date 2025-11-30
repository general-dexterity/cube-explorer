#!/usr/bin/env bun
// biome-ignore-all lint/suspicious/noConsole: CLI script requires console output
/**
 * Chrome Web Store API Token Generator
 *
 * This script guides you through the OAuth flow to obtain a refresh token
 * for the Chrome Web Store API.
 *
 * Prerequisites:
 *   1. A Google Cloud project with Chrome Web Store API enabled
 *   2. OAuth 2.0 credentials (Web application type - NOT Desktop)
 *   3. http://localhost:8085 added as authorized redirect URI
 *
 * Usage: bun scripts/get-chrome-store-token.ts
 */

const REDIRECT_URI = 'http://localhost:8085';
const SCOPE = 'https://www.googleapis.com/auth/chromewebstore';
const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const PORT = 8085;

// ANSI colors
const colors = {
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  blue: (s: string) => `\x1b[34m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
};

// HTML templates
const successHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Authorization Successful</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 3rem;
      background: rgba(255,255,255,0.1);
      border-radius: 1rem;
      backdrop-filter: blur(10px);
      max-width: 500px;
    }
    .icon { font-size: 4rem; margin-bottom: 1rem; }
    h1 { font-size: 1.75rem; margin-bottom: 0.5rem; }
    p { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">✓</div>
    <h1>Authorization Successful!</h1>
    <p>You can close this window and return to the terminal.</p>
  </div>
</body>
</html>
`;

const errorHtml = (error: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Authorization Failed</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #eb4747 0%, #a23b3b 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 3rem;
      background: rgba(255,255,255,0.1);
      border-radius: 1rem;
      backdrop-filter: blur(10px);
      max-width: 500px;
    }
    .icon { font-size: 4rem; margin-bottom: 1rem; }
    h1 { font-size: 1.75rem; margin-bottom: 0.5rem; }
    p { opacity: 0.9; }
    .error {
      margin-top: 1rem;
      padding: 1rem;
      background: rgba(0,0,0,0.2);
      border-radius: 0.5rem;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">✗</div>
    <h1>Authorization Failed</h1>
    <p>Something went wrong during authorization.</p>
    <div class="error">${error}</div>
  </div>
</body>
</html>
`;

const waitingHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Waiting for Authorization</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 3rem;
      background: rgba(255,255,255,0.1);
      border-radius: 1rem;
      backdrop-filter: blur(10px);
      max-width: 500px;
    }
    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    h1 { font-size: 1.75rem; margin-bottom: 0.5rem; }
    p { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <h1>Waiting for Authorization</h1>
    <p>Please complete the authorization in the popup window.</p>
  </div>
</body>
</html>
`;

async function prompt(question: string): Promise<string> {
  process.stdout.write(question);
  for await (const line of console) {
    return line.trim();
  }
  return '';
}

async function promptSecret(question: string): Promise<string> {
  process.stdout.write(question);

  // Try to disable echo for password input
  const { stdin } = process;
  if (stdin.isTTY) {
    stdin.setRawMode(true);
  }

  let input = '';
  for await (const chunk of stdin) {
    const char = chunk.toString();
    if (char === '\n' || char === '\r') {
      console.log();
      break;
    }
    if (char === '\x03') {
      // Ctrl+C
      process.exit(1);
    }
    if (char === '\x7f' || char === '\b') {
      // Backspace
      input = input.slice(0, -1);
    } else {
      input += char;
    }
  }

  if (stdin.isTTY) {
    stdin.setRawMode(false);
  }

  return input.trim();
}

function buildAuthUrl(clientId: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPE,
    access_type: 'offline',
    prompt: 'consent',
  });
  return `${AUTH_ENDPOINT}?${params}`;
}

async function exchangeCodeForTokens(
  code: string,
  clientId: string,
  clientSecret: string,
): Promise<{ refreshToken: string; accessToken: string }> {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
    }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error_description || data.error);
  }

  return {
    refreshToken: data.refresh_token,
    accessToken: data.access_token,
  };
}

async function openBrowser(url: string) {
  const { platform } = process;
  const command =
    platform === 'darwin'
      ? 'open'
      : platform === 'win32'
        ? 'start'
        : 'xdg-open';

  Bun.spawn([command, url], { stdout: 'ignore', stderr: 'ignore' });
}

function loadEnv(): Record<string, string> {
  try {
    const fs = require('node:fs');
    const envPath = new URL('../.env', import.meta.url).pathname;
    return Object.fromEntries(
      fs
        .readFileSync(envPath, 'utf8')
        .trim()
        .split('\n')
        .map((line: string) => {
          const idx = line.indexOf('=');
          return [line.slice(0, idx), line.slice(idx + 1)];
        }),
    );
  } catch {
    return {};
  }
}

async function main() {
  const env = loadEnv();

  console.log(colors.blue('========================================'));
  console.log(colors.blue('Chrome Web Store API Token Generator'));
  console.log(colors.blue('========================================'));
  console.log();

  let clientId = env.CHROME_CLIENT_ID;
  let clientSecret = env.CHROME_CLIENT_SECRET;

  if (clientId && clientSecret) {
    console.log(colors.green('Found credentials in .env file'));
    console.log(`Client ID: ${clientId.slice(0, 20)}...`);
    console.log();
  } else {
    console.log(colors.yellow('Prerequisites:'));
    console.log('1. Go to https://console.cloud.google.com/');
    console.log('2. Create or select a project');
    console.log("3. Enable the 'Chrome Web Store API'");
    console.log('4. Go to APIs & Services > Credentials');
    console.log('5. Create OAuth 2.0 Client ID (Web application type)');
    console.log(`6. Add '${REDIRECT_URI}' as an Authorized redirect URI`);
    console.log();

    clientId = await prompt('Enter your Google Client ID: ');
    if (!clientId) {
      console.error(colors.red('Error: Client ID is required'));
      process.exit(1);
    }

    clientSecret = await promptSecret('Enter your Google Client Secret: ');
    if (!clientSecret) {
      console.error(colors.red('Error: Client Secret is required'));
      process.exit(1);
    }
  }

  console.log();
  console.log(colors.green('Step 1: Starting local server...'));

  // Create a promise that resolves when we receive the auth code
  let resolveAuthCode: (code: string) => void;
  let rejectAuthCode: (error: Error) => void;
  const authCodePromise = new Promise<string>((resolve, reject) => {
    resolveAuthCode = resolve;
    rejectAuthCode = reject;
  });

  // Start the server
  const server = Bun.serve({
    port: PORT,
    fetch(req) {
      const url = new URL(req.url);

      // Handle the OAuth callback
      if (url.pathname === '/') {
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');

        if (code) {
          resolveAuthCode(code);
          return new Response(successHtml, {
            headers: { 'Content-Type': 'text/html' },
          });
        }

        if (error) {
          rejectAuthCode(new Error(error));
          return new Response(errorHtml(error), {
            status: 400,
            headers: { 'Content-Type': 'text/html' },
          });
        }

        // No code or error yet, show waiting page
        return new Response(waitingHtml, {
          headers: { 'Content-Type': 'text/html' },
        });
      }

      return new Response('Not Found', { status: 404 });
    },
  });

  console.log(`Server listening on ${REDIRECT_URI}`);
  console.log();
  console.log(colors.green('Step 2: Opening browser for authorization...'));

  const authUrl = buildAuthUrl(clientId);
  await openBrowser(authUrl);

  console.log();
  console.log('If the browser did not open, visit this URL manually:');
  console.log(colors.blue(authUrl));
  console.log();
  console.log('Waiting for authorization...');

  try {
    const code = await authCodePromise;
    console.log();
    console.log(colors.green('Authorization code received!'));
    console.log();
    console.log(colors.green('Step 3: Exchanging code for tokens...'));

    const { refreshToken, accessToken } = await exchangeCodeForTokens(
      code,
      clientId,
      clientSecret,
    );

    console.log();
    console.log(colors.green('========================================'));
    console.log(colors.green('Success! Here are your tokens:'));
    console.log(colors.green('========================================'));
    console.log();
    console.log(colors.yellow('CHROME_REFRESH_TOKEN:'));
    console.log(refreshToken);
    console.log();
    console.log(colors.yellow('Access Token (expires in 1 hour):'));
    console.log(accessToken);
    console.log();
    console.log(colors.blue('========================================'));
    console.log(colors.blue('GitHub Repository Secrets Setup'));
    console.log(colors.blue('========================================'));
    console.log();
    console.log('Add these secrets to your GitHub repository:');
    console.log(
      '(Settings > Secrets and variables > Actions > New repository secret)',
    );
    console.log();
    console.log(`  CHROME_CLIENT_ID      = ${clientId}`);
    console.log(`  CHROME_CLIENT_SECRET  = ${clientSecret}`);
    console.log(`  CHROME_REFRESH_TOKEN  = ${refreshToken}`);
    console.log(
      '  CHROME_EXTENSION_ID   = <your extension ID from Chrome Web Store>',
    );
    console.log();
    console.log(
      colors.yellow(
        'Note: The extension ID can be found in the Chrome Web Store URL',
      ),
    );
    console.log(
      colors.yellow("after you've uploaded the extension at least once."),
    );
  } catch (error) {
    console.error();
    console.error(
      colors.red(`Error: ${error instanceof Error ? error.message : error}`),
    );
    process.exit(1);
  } finally {
    server.stop();
  }
}

main();
