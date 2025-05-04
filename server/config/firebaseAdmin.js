// config/firebaseAdmin.js
const admin = require("firebase-admin");

let app;

if (!admin.apps.length) {
  const serviceAccount = require("./serviceAccountKey.json");
  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  app = admin.app(); // Use existing initialized app
}

module.exports = admin;