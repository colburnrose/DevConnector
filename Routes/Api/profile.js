const express = require('express');
const router = express.Router();
const Profile = require('../../Models/Profile');
const User = require('../../Models/User');
const auth = require('../../Middleware/auth');
const {check,validationResult} = require('express-validator/check');
const mongoose = require('mongoose');

mongoose.set('useFindAndModify', false);


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


// @route   POST: api/profile
// @des     Create or Update a Users Profile.
// @access  Private
router.post('/', [auth, [check('status', 'Status is required.').not().isEmpty(), check('skills', 'Skills is required').not().isEmpty()]], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    const {company, website, location, bio, status, githubUserName, skills, youtube, facebook, twitter, instagram, linkedin}= req.body;

    // Create profile obj
    const profile = {};
    profile.user = req.user.id;
    if(company) profile.company = company;
    if(website) profile.website = website;
    if(location) profile.location = location;
    if(bio) profile.bio = bio;
    if(status) profile.status = status;
    if(githubUserName) profile.githubUserName = githubUserName;
    if(skills) {
        profile.skills = skills.split(',').map(skill => skill.trim())
    };

    // Create social obj
    profile.socialMedia = {};
    if(youtube) profile.socialMedia.youtube = youtube;
    if(twitter) profile.socialMedia.twitter = twitter;
    if(facebook) profile.socialMedia.facebook = facebook;
    if(linkedin) profile.socialMedia.linkedin = linkedin;
    if(instagram) profile.socialMedia.instagram = instagram;

    try {
        let user = await Profile.findOne({user: req.user.id});

        if(user) {
            // Update
            user = await Profile.findOneAndUpdate({user: req.user.id }, {$set: profile }, {new: true, useFindAndModify: false});
            return res.json({user});
        }

        // Create
        user = new Profile(profile);

        await user.save();
        res.json(user);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
module.exports = router;