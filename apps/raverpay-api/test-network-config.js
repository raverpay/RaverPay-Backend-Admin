const https = require('https');

const url = new URL(
  'http://localhost:3001/api/alchemy/wallets/stablecoin/networks',
);

const req = https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    console.log('Network Config Response:', JSON.parse(data));
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
  console.log('Note: Make sure the API server is running on port 3001');
});
