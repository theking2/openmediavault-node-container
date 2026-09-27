const express = require('express');
const os = require('os');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const APP_NAME = process.env.APP_NAME || 'app-one';

app.use(express.json());

// Request logger — proves the container is handling live traffic
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root — human-readable status page
app.get('/', (req, res) => {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
  );

  res.json({
    app: APP_NAME,
    version: pkg.version,
    message: `Hello from ${APP_NAME} running in Docker on OMV!`,
    hostname: os.hostname(),
    nodeVersion: process.version,
    env: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Health check — used by the compose healthcheck / manual curl
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', app: APP_NAME });
});

// Tiny counter stored in memory — useful to confirm you're hitting THIS container
let hits = 0;
app.get('/hits', (req, res) => {
  hits++;
  res.json({ app: APP_NAME, hits });
});

// Echo endpoint to sanity-check POST bodies
app.post('/echo', (req, res) => {
  res.json({ app: APP_NAME, received: req.body });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ ${APP_NAME} listening on port ${PORT}`);
  console.log(`   Hostname: ${os.hostname()}`);
  console.log(`   Node:     ${process.version}`);
});
