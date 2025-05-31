const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID; // ✅ from Firebase > Project Settings > Web
const client = new OAuth2Client(); // You can also pass your client ID

exports.googleLogin = async (req, res) => {
  const { idToken, fcmToken } = req.body;

  try {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: CLIENT_ID,
      });
      
      const payload = ticket.getPayload();
      const email = payload.email;
      
      let user = await User.findOne({ email });
      
      if (!user) {
        return res.status(403).json({ error: 'User not registered' });
      }
      
       //Update fcmToken if it's different
        if (fcmToken && user.fcmToken !== fcmToken) {
            user.fcmToken = fcmToken;
            await user.save();
        }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(401).json({ error: 'Invalid ID token' });
  }
};