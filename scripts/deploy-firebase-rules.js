/**
 * Deploy Firebase Realtime Database Rules
 * 
 * This script uses the service account key to deploy database rules.
 * Run: node scripts/deploy-firebase-rules.js
 * 
 * Note: Service account keys should NEVER be committed to git or included in the app bundle.
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load service account key
const serviceAccountPath = path.join(__dirname, '..', 'ServiceAccountKeys.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ ServiceAccountKeys.json not found!');
  console.error('   Please ensure the service account key file is in the project root.');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase Admin
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: serviceAccount.project_id ? `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com` : undefined,
  });
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
  process.exit(1);
}

// Load database rules from file
const rulesPath = path.join(__dirname, '..', 'FIREBASE_DATABASE_RULES.json');
if (!fs.existsSync(rulesPath)) {
  console.error('❌ FIREBASE_DATABASE_RULES.json not found!');
  console.error('   Please ensure the rules file is in the project root.');
  process.exit(1);
}

const rules = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));

// Deploy rules using REST API (Admin SDK doesn't have direct rule deployment)
async function deployRules() {
  try {
    // Get access token
    const accessToken = await admin.credential.cert(serviceAccount).getAccessToken();
    
    const databaseURL = `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`;
    const rulesURL = `${databaseURL}/.settings/rules.json?access_token=${accessToken.access_token}`;
    
    // Use Node.js https to deploy rules
    const https = require('https');
    const url = require('url');
    
    const parsedUrl = url.parse(rulesURL);
    const rulesJson = JSON.stringify(rules, null, 2);
    
    return new Promise((resolve, reject) => {
      const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.path,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(rulesJson),
        },
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log('✅ Database rules deployed successfully!');
            console.log('');
            console.log('📋 Rules Summary:');
            console.log('   - Rooms: Read/Write enabled');
            console.log('   - Games: Read/Write enabled');
            console.log('   - Validation: Structure validation enabled');
            console.log('');
            console.log('⚠️  Note: These rules allow public read/write for multiplayer.');
            console.log('   For production, consider adding authentication-based rules.');
            resolve();
          } else {
            reject(new Error(`Failed to deploy rules: HTTP ${res.statusCode} - ${data}`));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.write(rulesJson);
      req.end();
    });
  } catch (error) {
    console.error('❌ Failed to deploy rules:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('   1. Check that Realtime Database is enabled in Firebase Console');
    console.error('   2. Verify service account has "Firebase Realtime Database Admin" role');
    console.error('   3. Check database URL matches your Firebase project');
    console.error('   4. Try deploying rules manually via Firebase Console');
    throw error;
  }
}

deployRules();

