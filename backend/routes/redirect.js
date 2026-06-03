const router = require('express').Router();
const URL = require('../models/URL');
const Click = require('../models/Click');

// Parse browser from user agent
const parseBrowser = (ua) => {
  if (!ua) return 'Unknown';
  if (/edg\//i.test(ua)) return 'Edge';
  if (/chrome/i.test(ua) && !/edg/i.test(ua)) return 'Chrome';
  if (/firefox/i.test(ua)) return 'Firefox';
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari';
  if (/opera|opr/i.test(ua)) return 'Opera';
  return 'Other';
};

// Parse device type from user agent
const parseDevice = (ua) => {
  if (!ua) return 'Desktop';
  if (/mobile/i.test(ua)) return 'Mobile';
  if (/tablet|ipad/i.test(ua)) return 'Tablet';
  return 'Desktop';
};

// Parse OS from user agent
const parseOS = (ua) => {
  if (!ua) return 'Unknown';
  if (/windows/i.test(ua)) return 'Windows';
  if (/mac/i.test(ua)) return 'macOS';
  if (/linux/i.test(ua)) return 'Linux';
  if (/android/i.test(ua)) return 'Android';
  if (/iphone|ios/i.test(ua)) return 'iOS';
  return 'Other';
};

const normalizeIp = (ip) => {
  if (!ip || typeof ip !== 'string') return '';
  const rawIp = ip.split(',')[0].trim();
  return rawIp.replace(/^::ffff:/i, '');
};

const isPrivateIp = (ip) => {
  if (!ip) return false;
  return /^127\.|^::1$|^10\.|^192\.168\.|^169\.254\.|^::ffff:127\.|^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip);
};

router.post('/track-click', async (req, res) => {
  try {
    const { shortCode, latitude, longitude } = req.body || {};
    const url = await URL.findOne({ shortCode });
    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    const ipSource = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket?.remoteAddress || req.connection?.remoteAddress || req.ip;
    const ip = normalizeIp(ipSource);
    const ua = req.headers['user-agent'];
    const referrer = req.headers['referer'] || req.headers['referrer'];

    let geo = { country: 'Unknown', city: 'Unknown', latitude: null, longitude: null };
    let lat = null;
    let lon = null;

    if (latitude != null && longitude != null && !Number.isNaN(parseFloat(latitude)) && !Number.isNaN(parseFloat(longitude))) {
      lat = parseFloat(latitude);
      lon = parseFloat(longitude);
      geo = await reverseGeocode(lat, lon);
    } else {
      geo = await getGeolocation(ip);
      lat = geo.latitude;
      lon = geo.longitude;
    }

    const clickData = {
      url: url._id,
      userAgent: ua,
      ipAddress: ip,
      referrer,
      country: geo.country,
      city: geo.city,
      latitude: lat,
      longitude: lon,
      browser: parseBrowser(ua),
      device: parseDevice(ua),
      os: parseOS(ua),
    };

    url.clickCount += 1;
    url.lastVisited = new Date();

    await Promise.all([
      url.save(),
      new Click(clickData).save(),
    ]);

    res.json({ redirectTo: url.originalUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get geolocation from IP (using free service)
const getGeolocation = async (ip) => {
  try {
    if (!ip) {
      return { country: 'Unknown', city: 'Unknown', latitude: null, longitude: null };
    }

    if (isPrivateIp(ip)) {
      try {
        const response = await fetch('http://ip-api.com/json/');
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success') {
            return {
              country: data.country || 'Unknown',
              city: data.city || data.regionName || 'Unknown',
              latitude: data.lat || null,
              longitude: data.lon || null,
            };
          }
        }
      } catch (e) {
        console.error('Private IP fallback (ip-api.com) geolocation error:', e.message);
      }

      try {
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
          const data = await response.json();
          return {
            country: data.country_name || data.country || 'Unknown',
            city: data.city || data.region || 'Unknown',
            latitude: data.latitude || null,
            longitude: data.longitude || null,
          };
        }
      } catch (e) {
        console.error('Private IP fallback (ipapi.co) geolocation error:', e.message);
      }

      return { country: 'Local', city: 'Private Network', latitude: null, longitude: null };
    }

    // Public IP check
    try {
      const response = await fetch(`http://ip-api.com/json/${ip}`);
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          return {
            country: data.country || 'Unknown',
            city: data.city || data.regionName || 'Unknown',
            latitude: data.lat || null,
            longitude: data.lon || null,
          };
        }
      }
    } catch (err) {
      console.error('ip-api.com public lookup error:', err.message);
    }

    // Fallback public lookup
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    if (!response.ok) throw new Error('Geolocation fallback fetch failed');
    const data = await response.json();

    const city = data.city || data.region || data.region_code || 'Unknown';
    const country = data.country_name || data.country || 'Unknown';

    return {
      country,
      city,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
    };
  } catch (err) {
    console.error('Geolocation error:', err.message);
    return { country: 'Unknown', city: 'Unknown', latitude: null, longitude: null };
  }
};

const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&zoom=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'URLShortener/1.0 (contact@example.com)',
        },
      }
    );
    if (!response.ok) throw new Error('Reverse geocode failed');
    const data = await response.json();
    const address = data.address || {};
    const city = address.city || address.town || address.village || address.hamlet || address.county || address.state || 'Unknown';
    const country = address.country || 'Unknown';
    return { country, city, latitude, longitude };
  } catch (err) {
    console.error('Reverse geocode error:', err.message);
    return { country: 'Unknown', city: 'Unknown', latitude, longitude };
  }
};

router.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const { pwd } = req.query;
    const url = await URL.findOne({ shortCode });

    if (!url) {
      return res.status(404).send('URL not found');
    }

    // Check expiry
    if (url.expiresAt && new Date() > url.expiresAt) {
      if (url.fallbackUrl) {
        return res.redirect(url.fallbackUrl);
      }
      return res.status(410).send('URL has expired');
    }

    // Check Password Protection
    if (url.password) {
      return res.send(renderPasswordPage(url.password, url.originalUrl, shortCode));
    }

    const originalUrl = url.originalUrl;
    const ipSource = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket?.remoteAddress || req.connection?.remoteAddress || req.ip;
    const ip = normalizeIp(ipSource);
    const ua = req.headers['user-agent'];
    const referrer = req.headers['referer'] || req.headers['referrer'];

    const geo = await getGeolocation(ip);

    const clickData = {
      url: url._id,
      userAgent: ua,
      ipAddress: ip,
      referrer,
      country: geo.country,
      city: geo.city,
      latitude: geo.latitude,
      longitude: geo.longitude,
      browser: parseBrowser(ua),
      device: parseDevice(ua),
      os: parseOS(ua),
    };

    url.clickCount += 1;
    url.lastVisited = new Date();

    await Promise.all([
      url.save(),
      new Click(clickData).save(),
    ]);

    return res.redirect(originalUrl);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Render the sleek glassmorphic password page
const renderPasswordPage = (correctPassword, redirectUrl, shortCode) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Secure Link Access | LinkPulse</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #04050c;
      color: #e2e8f0;
      font-family: 'Plus Jakarta Sans', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      overflow: hidden;
    }
    .dot-grid {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
      background-size: 24px 24px;
      pointer-events: none;
      z-index: 1;
    }
    .glow-orb {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 450px;
      height: 450px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, transparent 70%);
      pointer-events: none;
      z-index: 2;
    }
    .card {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 400px;
      padding: 2.5rem;
      background: rgba(12, 14, 22, 0.6);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.6);
      text-align: center;
    }
    .icon-wrapper {
      width: 56px;
      height: 56px;
      margin: 0 auto 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%);
      border: 1px solid rgba(124, 58, 237, 0.2);
      color: #a78bfa;
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 800;
      margin: 0 0 0.5rem;
      letter-spacing: -0.025em;
      background: linear-gradient(135deg, #ffffff 50%, #a78bfa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0 0 1.75rem;
      line-height: 1.5;
    }
    .input-group {
      margin-bottom: 1.25rem;
      text-align: left;
    }
    label {
      display: block;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #475569;
      margin-bottom: 0.5rem;
    }
    input[type="password"] {
      width: 100%;
      padding: 0.875rem 1rem;
      box-sizing: border-box;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      color: #f8fafc;
      font-size: 0.875rem;
      font-family: inherit;
      outline: none;
      transition: all 0.2s ease;
    }
    input[type="password"]:focus {
      border-color: rgba(124, 58, 237, 0.5);
      background: rgba(255, 255, 255, 0.06);
      box-shadow: 0 0 0 1px rgba(124, 58, 237, 0.2);
    }
    .btn {
      width: 100%;
      padding: 0.875rem 1rem;
      background: linear-gradient(90deg, #7c3aed 0%, #6366f1 100%);
      border: none;
      border-radius: 12px;
      color: #ffffff;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 8px 16px rgba(124, 58, 237, 0.25);
      transition: all 0.2s ease;
    }
    .btn:hover {
      opacity: 0.95;
      transform: translateY(-1px);
      box-shadow: 0 12px 20px rgba(124, 58, 237, 0.35);
    }
    .btn:active {
      transform: translateY(0);
    }
    .error-msg {
      margin-top: 1rem;
      font-size: 0.8125rem;
      color: #ef4444;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
    }
  </style>
</head>
<body>
  <div class="dot-grid"></div>
  <div class="glow-orb"></div>
  <div class="card">
    <div class="icon-wrapper">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
    </div>
    <h1>Password Protected</h1>
    <p>This link is encrypted. Enter the password to unlock and proceed.</p>
    <form id="pwdForm" onsubmit="event.preventDefault(); handleUnlock();">
      <div class="input-group">
        <label for="pwd">Security Password</label>
        <div style="position: relative; width: 100%;">
          <input type="password" id="pwd" placeholder="Enter link password..." required autofocus style="padding-right: 2.75rem;">
          <button type="button" onclick="togglePasswordVisibility()" style="position: absolute; right: 0.875rem; top: 50%; transform: translateY(-50%); background: none; border: none; padding: 0; cursor: pointer; color: #475569; display: flex; align-items: center; justify-content: center; outline: none; transition: color 0.2s;">
            <!-- Eye icon (open) -->
            <svg id="eye-open" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <!-- Eye icon (closed) -->
            <svg id="eye-closed" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          </button>
        </div>
      </div>
      <button type="submit" class="btn">Unlock & Redirect</button>
      <div id="error-msg" class="error-msg" style="display: none;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        Incorrect password. Please try again.
      </div>
    </form>
  </div>

  <script>
    function togglePasswordVisibility() {
      const pwdInput = document.getElementById('pwd');
      const eyeOpen = document.getElementById('eye-open');
      const eyeClosed = document.getElementById('eye-closed');
      
      if (pwdInput.type === 'password') {
        pwdInput.type = 'text';
        eyeOpen.style.display = 'none';
        eyeClosed.style.display = 'block';
      } else {
        pwdInput.type = 'password';
        eyeOpen.style.display = 'block';
        eyeClosed.style.display = 'none';
      }
    }

    async function handleUnlock() {
      const enteredPwd = document.getElementById('pwd').value;
      const correctPwd = ${JSON.stringify(correctPassword)};
      const redirectUrl = ${JSON.stringify(redirectUrl)};
      const shortCode = ${JSON.stringify(shortCode)};
      const errorEl = document.getElementById('error-msg');

      if (enteredPwd === correctPwd) {
        errorEl.style.display = 'none';
        
        // Track the click in the background
        try {
          await fetch('/track-click', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shortCode })
          });
        } catch (e) {
          console.error('Failed to track click:', e);
        }

        // Simple and protocol-safe redirection
        if (window.self !== window.top) {
          window.parent.postMessage({ type: 'unlock_redirect', url: redirectUrl }, '*');
          window.top.location.href = redirectUrl;
        } else {
          window.location.href = redirectUrl;
        }
      } else {
        errorEl.style.display = 'flex';
        document.getElementById('pwd').value = '';
      }
    }
  </script>
</body>
</html>`;
};

module.exports = router;
