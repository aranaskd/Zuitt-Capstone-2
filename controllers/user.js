const bcrypt = require('bcrypt');
const { errorHandler } = require('../auth');
const auth = require('../auth');

// [SECTION] IMPORT MODELS
const User = require('../models/User');

// [SECTION] REGISTER USER
module.exports.registerUser = (req, res) => {
    const { firstName, lastName, email, mobileNo, password } = req.body;

    if (!email.includes("@")) {
        return res.status(400).json({ error: 'Email invalid' });
    }
    if (mobileNo.length !== 11) {
        return res.status(400).json({ error: 'Mobile number invalid' });
    }
    if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    return User.findOne({ email })
        .then(user => {
            if (user) {
                return res.status(409).json({ message: 'User already exists' });
            }

            const hashedPassword = bcrypt.hashSync(password, 10);
            const newUser = new User({
                firstName,
                lastName,
                email,
                mobileNo,
                password: hashedPassword
            });

            return newUser.save();
        })
        .then(() => res.status(201).json({ message: 'Registered Successfully' }))
        .catch(err => errorHandler(err, req, res));
};

// [SECTION] LOGIN USER
module.exports.loginUser = (req, res) => {
    const { email, password } = req.body;

    if (!email.includes("@")) {
        return res.status(400).json({ error: 'Invalid Email' });
    }

    return User.findOne({ email })
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: 'No email found' });
            }

            const isPasswordCorrect = bcrypt.compareSync(password, user.password);

            if (isPasswordCorrect) {
                return res.status(200).json({ access: auth.createAccessToken(user) });
            } else {
                return res.status(401).json({ error: 'Email and password do not match' });
            }
        })
        .catch(err => errorHandler(err, req, res));
};

// [SECTION] GET USER DETAILS
module.exports.getProfile = (req, res) => {
    const userId = req.user.id;

    return User.findById(userId)
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            user.password = undefined; // Don't include password in response
            return res.status(200).json({ user });
        })
        .catch(err => {
            err.customError = 'Failed to fetch user profile';
            errorHandler(err, req, res);
        });
};

// [SECTION] SET USER AS ADMIN
module.exports.setUserAdmin = (req, res) => {
    const { id } = req.params;
    const updateUser = { isAdmin: true };

    return User.findByIdAndUpdate(id, updateUser, { new: true, runValidators: true })
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            return res.status(200).json({ updatedUser: user });
        })
        .catch(err => {
            err.customError = 'Failed to update user';
            errorHandler(err, req, res);
        });
};

// [SECTION] UPDATE PASSWORD
module.exports.resetPassword = (req, res) => {
    const { newPassword } = req.body;
    const userId = req.user.id;

    return bcrypt.hash(newPassword, 10)
        .then(hashedPassword => User.findByIdAndUpdate(userId, { password: hashedPassword }))
        .then(() => res.status(201).json({ message: 'Password reset successfully' }))
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        });
};
