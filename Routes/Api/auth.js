const express = require('express');
const router = express.Router();
const auth = require('../../Middleware/auth');

const User = require('../../Models/User');


// @route   GET: api/auth
// @des     Test route
// @access  Public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); // leaves off the password.
        res.json(user);
    } catch (err) {
        console.error(err.message)
        res.status(501).send('Server error');
    }
});

module.exports = router;