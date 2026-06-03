const router = require('express').Router();
const URL = require('../models/URL');
const Click = require('../models/Click');
const auth = require('../middleware/auth');

// Get global stats for a specific URL
router.get('/:urlId', auth, async (req, res) => {
  try {
    const { urlId } = req.params;
    
    // Verify ownership
    const url = await URL.findOne({ _id: urlId, user: req.userId });
    if (!url) {
      return res.status(404).json({ message: 'URL not found or unauthorized' });
    }

    // Get recent clicks
    const recentClicks = await Click.find({ url: urlId })
      .sort({ timestamp: -1 })
      .limit(50);

    // Get daily click stats for chart (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const chartData = await Click.aggregate([
      {
        $match: {
          url: url._id,
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          clicks: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      url,
      recentClicks,
      chartData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get public analytics stats for a specific shortCode (No authentication required)
router.get('/public/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;

    const url = await URL.findOne({ shortCode });
    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Get recent clicks
    const recentClicks = await Click.find({ url: url._id })
      .sort({ timestamp: -1 })
      .limit(20);

    // Get daily click stats for chart (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const chartData = await Click.aggregate([
      {
        $match: {
          url: url._id,
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          clicks: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      url: {
        shortCode: url.shortCode,
        originalUrl: url.originalUrl,
        clickCount: url.clickCount,
        lastVisited: url.lastVisited,
        createdAt: url.createdAt,
        expiresAt: url.expiresAt
      },
      recentClicks,
      chartData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
