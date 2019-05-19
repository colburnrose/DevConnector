const express = require('express');
const router = express.Router();
const {
    check,
    validationResult
} = require('express-validator/check');


// @route   POST: api/users
// @des     Register route
// @access  Public
router.post('/', [
    check('name', 'Name is required.').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 8 or more charactors').isLength({
        min: 8
    })
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    res.send('User route');
}); //test route

module.exports = router;