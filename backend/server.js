import dns from 'dns';
// Force Node.js to use Google and Cloudflare DNS to resolve MongoDB Atlas SRV records.
// This programmatically bypasses local ISP and Windows IPv6 DNS resolution issues (querySrv ECONNREFUSED).
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

import dotenv from "dotenv";

dotenv.config();

import app from './src/app.js';
import connectDB from './src/config/db.js';


// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});