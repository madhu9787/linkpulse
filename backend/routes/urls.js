const router = require('express').Router();
const URL = require('../models/URL');
const auth = require('../middleware/auth');
const { nanoid } = require('nanoid');

// Create a short URL
router.post('/shorten', auth, async (req, res) => {
  try {
    const { originalUrl, expiresAt, password, fallbackUrl } = req.body;
    const customAlias = String(req.body.customAlias || '').trim();

    if (!originalUrl) {
      return res.status(400).json({ message: 'Original URL is required' });
    }

    if (customAlias && !/^[A-Za-z0-9_-]+$/.test(customAlias)) {
      return res.status(400).json({ message: 'Custom alias may only contain letters, numbers, hyphens, and underscores' });
    }

    let formattedUrl = originalUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    try {
      new global.URL(formattedUrl);
    } catch (_) {
      return res.status(400).json({ message: 'Please enter a valid URL address' });
    }

    // Check if this URL already exists for this user
    const existingUrl = await URL.findOne({ 
      originalUrl: formattedUrl, 
      user: req.userId 
    });
    
    if (existingUrl) {
      return res.status(200).json({ 
        ...existingUrl.toObject(),
        isDuplicate: true,
        message: 'This URL already exists! Returning existing shortened link.'
      });
    }

    let shortCode;
    if (customAlias) {
      const existingAlias = await URL.findOne({ shortCode: customAlias });
      if (existingAlias) {
        return res.status(400).json({ message: 'Custom alias already in use' });
      }
      shortCode = customAlias;
    } else {
      shortCode = nanoid(7);
    }

    const newUrl = new URL({
      originalUrl: formattedUrl,
      shortCode,
      user: req.userId,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      password: password || null,
      fallbackUrl: fallbackUrl || null,
    });

    await newUrl.save();
    res.status(201).json(newUrl);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk create short URLs
router.post('/bulk', auth, async (req, res) => {
  try {
    const { urls } = req.body;
    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ message: 'An array of URLs is required' });
    }

    const results = [];
    const errors = [];
    const duplicates = [];

    for (const item of urls) {
      const { originalUrl, expiresAt } = item;
      const customAlias = String(item.customAlias || '').trim();
      if (!originalUrl) {
        errors.push({ originalUrl: '', error: 'URL is required' });
        continue;
      }

      if (customAlias && !/^[A-Za-z0-9_-]+$/.test(customAlias)) {
        errors.push({ originalUrl, error: `Alias '${item.customAlias}' is invalid. Use letters, numbers, hyphens, or underscores only.` });
        continue;
      }

      let formattedUrl = originalUrl.trim();
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = 'https://' + formattedUrl;
      }

      try {
        new global.URL(formattedUrl);
      } catch (_) {
        errors.push({ originalUrl, error: 'Invalid URL format' });
        continue;
      }

      // Check for duplicates
      const existingUrl = await URL.findOne({ 
        originalUrl: formattedUrl, 
        user: req.userId 
      });
      
      if (existingUrl) {
        duplicates.push({ originalUrl, shortCode: existingUrl.shortCode, message: 'Already exists' });
        continue;
      }

      let shortCode;
      if (customAlias) {
        const existingAlias = await URL.findOne({ shortCode: customAlias });
        if (existingAlias) {
          errors.push({ originalUrl, error: `Alias '${customAlias}' already in use` });
          continue;
        }
        shortCode = customAlias;
      } else {
        shortCode = nanoid(7);
      }

      const newUrl = new URL({
        originalUrl: formattedUrl,
        shortCode,
        user: req.userId,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      });

      await newUrl.save();
      results.push(newUrl);
    }

    res.status(201).json({ results, errors, duplicates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all URLs for a user
router.get('/my-urls', auth, async (req, res) => {
  try {
    const urls = await URL.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(urls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a URL (e.g., Change destination)
router.put('/:id', auth, async (req, res) => {
  try {
    const { originalUrl, expiresAt, password, fallbackUrl } = req.body;
    const url = await URL.findOne({ _id: req.params.id, user: req.userId });
    
    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    if (originalUrl) url.originalUrl = originalUrl;
    
    if (expiresAt !== undefined) {
      url.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }
    
    if (password !== undefined) {
      url.password = password || null;
    }
    
    if (fallbackUrl !== undefined) {
      url.fallbackUrl = fallbackUrl || null;
    }

    await url.save();
    res.json(url);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle favorite status
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const url = await URL.findOne({ _id: req.params.id, user: req.userId });
    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }
    url.isFavorite = !url.isFavorite;
    await url.save();
    res.json(url);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a URL
router.delete('/:id', auth, async (req, res) => {
  try {
    const url = await URL.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }
    res.json({ message: 'URL deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get total counts (Public Stats) - place this route before module.exports
router.get('/public-stats-totals', async (req, res) => {
  try {
    const urlsCount = await URL.countDocuments();
    const clicksAggregate = await URL.aggregate([
      { $group: { _id: null, totalClicks: { $sum: '$clickCount' } } }
    ]);
    const clicksCount = clicksAggregate.length > 0 ? clicksAggregate[0].totalClicks : 0;
    res.json({ totalUrls: urlsCount, totalClicks: clicksCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
