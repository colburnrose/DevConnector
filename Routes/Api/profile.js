const express = require('express');
const router = express.Router();
const Profile = require('../../Models/Profile');
const User = require('../../Models/User');
const auth = require('../../Middleware/auth');
const {check,validationResult} = require('express-validator/check');
const ObjectId = require('mongoose').Types.ObjectId;



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
            user = await Profile.findOneAndUpdate({user: req.user.id }, {$set: profile }, {new: true});
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

// @route   GET: api/profile
// @des     Get all profiles
// @access  Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET: api/profile/user/:user_id
// @des     Get profile by userid
// @access  Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findById({user: req.params.user_id}).populate('user', ['name', 'avatar']);
        if(!profile)return res.status(400).json({msg: 'Profile not found.'});

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if(err.kind == 'ObjectId'){
            res.status(400).json({msg: 'Profile not found.'});
        }
        res.status(500).send('Server Error');
    }
});


// @route   DELETE: api/profile
// @des     Delete profile, user & posts
// @access  Private
router.delete('/', auth, async (req, res) => {
    try {
        // @todo - remove users posts
        // Remove profile
        await Profile.findOneAndRemove({user: req.user.id});
        // Remove user
        await User.findOneAndRemove({_id: req.user.id});
        res.json({msg: 'User removed.'});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   PUT: api/profile/experience
// @des     Add Profile experience
// @access  Private
router.put('/experience', [auth, [check('title', 'Title is required').not().isEmpty(),
check('company', 'Company is required').not().isEmpty(), check('from', 'From date is required.').not().isEmpty()]], async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }

    const {title, company, location, from, to, current, description} = req.body;
    const newExp = {title, company, location, from, to, current, description}

    try {
        const profile = await Profile.findOne({user: req.user.id}); //fetch the profile
        profile.experience.unshift(newExp); // push experience to the beginning
        await profile.save();

        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});


// @route   DELETE: api/profile/experience/:exp_id
// @des     Delete profile experience
// @access  Private
router.delete('/experience/:exp_id', auth, async (req,res) => {
    try {
        const profile = await Profile.findById({ user: req.user.id }); // fetch profile by userid

        // Get remove index
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
        if(removeIndex === -1) return res.status(400).json({msg: 'No such entity.'});

        profile.experience.splice(removeIndex, 1); // take out one.

        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
      res.status(500).send ('Server error.');
    }
});


// @route   PUT: api/profile/education
// @des     Add Profile education
// @access  Private
router.put('/education', [auth, [check('school', 'School is required').not().isEmpty(),
check('degree', 'Degree is required').not().isEmpty(),
check('fieldOfStudy', 'Field of study is required.').not().isEmpty(), check('from', 'From is required').not().isEmpty()]], async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }

    const {school, degree, fieldOfStudy, description, from, to, current} = req.body;
    const newEducation = {school, degree, fieldOfStudy, description, from, to, current};

    try {
        const profile = await Profile.findOne({user: req.user.id});
        
        profile.education.unshift(newEducation); // push to the front.
        await profile.save().then(profile => res.json(profile));

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE: api/profile/education/:edu_id
// @des     Delete profile education
// @access  Private
router.delete('/education/:edu_id', auth, async (req,res) => {
    try {
        const profile = await Profile.findById({ user: req.user.id }); // fetch profile by userid

        // Get remove index
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
        if(removeIndex === -1) return res.status(400).json({msg: 'No such entity.'});

        profile.education.splice(removeIndex, 1); // take out one.

        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
      res.status(500).send ('Server error.');
    }
});
module.exports = router;