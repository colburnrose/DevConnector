const express = require('express');
const router = express.Router();
const config = require('config');
const {check,validationResult} = require('express-validator/check');

const User = require('../../Models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const token = require('jsonwebtoken');


// @route   POST: api/users
// @des     Register route
// @access  Public
router.post('/', [
    check('name', 'Name is required.').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 8 or more charactors').isLength({
        min: 8
    })
], async (req, res) => {
    const errors = await validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    const {
        name,
        email,
        password
    } = req.body;

    try {
        let user = await User.findOne({
            email
        });
        // Check if User exist
        if (user) {
            return res.status(400).json({
                errors: [{
                    msg: 'User already exists'
                }]
            });
        }
        // Get Users gravatar 
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        });

        // Create the User.
        user = new User({
            name,
            email,
            avatar,
            password
        });

        // Encrypt the password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt); // hashes the users password.
        await user.save(); // Save User to DB.

        // Return user payload & jsonwebtoken
        const payload = {
            user: {
                id: user.id
            }
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