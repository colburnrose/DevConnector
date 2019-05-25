const express = require('express');
const router = express.Router();
const Profile = require('../../Models/Profile');
const User = require('../../Models/User');
const auth = require('../../Middleware/auth');


// @route   GET: api/profile/me endpoint
// @des     Get current users profile
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id}).populate('user', ['name', 'avatar'])
        // Check if profile exist..
        if(!profile){
            return res.status(400).json({msg: 'There is no profile for this user.'})
        } else {
            //Send the profile if user has one
            res.json(profile);
        }

    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server error');
    }
});


module.exports = router;