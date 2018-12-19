const express = require('express');

const router = express.Router();

/**
 * Serves homepage.
 * @name GET/
 */
router.get('/', (req, res) => {
  res.render('index', { title: 'uwu' });
});

router.get('*', (req, res) => {
  res.redirect('/');
});

module.exports = router;
