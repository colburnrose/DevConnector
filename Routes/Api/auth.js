const express = require('express');
const router = express.Router();
const auth = require('../../Middleware/auth');

const User = require('../../Models/User');
const bcrypt = require('bcryptjs');
const token = require('jsonwebtoken');
const config = require('config');
const {check,validationResult} = require('express-validator/check');


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

// @route   POST: api/auth
// @des     Authenticate user and token
// @access  Public
router.post('/', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 8 or more charactors').exists()
], async (req, res) => {
    const errors = await validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    const {email,password} = req.body;

    try {
        let user = await User.findOne({ email }); // Request to DB to get the user.
        // Check if User exist
        if (!user) {
            return res.status(400).json({errors: [{ msg: 'Invalid Credentials.' }]});
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        // Check if password don't match
        if(!passwordMatch){
            return res.status(400).json({errors: [{ msg: 'Invalid Credentials' }]}); 
        }

        // Return user payload & jsonwebtoken
        const payload = {
            user: { id: user.id }
        }

        // Here we sign the token: pass in the payload, the secret, and expiration (optional).
        // Call back we either get the error or the token.
        token.sign(payload, config.get('jwtSecret'), {
            expiresIn: 360000
        }, (err, token) => {
            if (err) throw err;
            res.json({
                token
            });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }



});

module.exports = router;