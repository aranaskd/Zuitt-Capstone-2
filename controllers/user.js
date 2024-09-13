const bcrypt = require('bcrypt');
const { errorHandler } = require('../auth');
const auth = require('../auth');

// [SECTION] IMPORT MODELS
const User = require('../models/User');

// [SECTION] REGISTER USER
module.exports.registerUser = (req, res) => {
    const { firstName, lastName, email, mobileNo, password } = req.body;
    
    if (!email.includes("@")) {
        return res.status(400).send({ error: 'Email invalid' });
    } else if (mobileNo.length !== 11) {
        return res.status(400).send({ error: 'Mobile number invalid' });
    } else if (password.length < 8) {
        return res.status(400).send({ error: 'Password must be at least 8 characters' });
    } else {
        return User.findOne({ email: email })
            .then(user => {
                if (user) {
                    return res.status(409).send({ message: 'User already exists' });
                } else {
                    let newUser = new User({
                        firstName: firstName,
                        lastName: lastName,
                        email: email,
                        mobileNo: mobileNo,
                        password: bcrypt.hashSync(password, 10)
                    });

                    return newUser.save()
                        .then(() => {
                            return res.status(201).send({ message: 'Registered Successfully' });
                        })
                        .catch(err => errorHandler(err, req, res));
                }
            })
            .catch(err => errorHandler(err, req, res));
    }
};

// [SECTION] LOGIN USER
module.exports.loginUser = (req, res) => {

	if(req.body.email.includes("@")){
		return User.findOne({ email : req.body.email })
		.then(result => {
			if(result == null) {
				return res.status(404).send({ error: 'No email found' });
	
			} else {
				const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);

				if (isPasswordCorrect)  {
					return res.status(200).send({ 
                        access : auth.createAccessToken(result)
                        })
				} else {
					return res.status(401).send({ error: 'Email and password do not match' });
				}
			}
		})
		.catch(error => errorHandler(error, req, res));
	} else{
		return res.status(400).send({ error: 'Invalid Email' });
	}
}

// [SECTION] GET USER DETAILS
module.exports.getProfile = (req, res) => {
    
    const userId = req.user.id;

    return User.findById(userId)
    .then(user => {
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        } else {
            user.password = undefined;
            return res.status(200).send({ user });
        }

    })
    .catch(err => {
        err.customError = 'Failed to fetch user profile',
        errorHandler(err, req, res)
    })

};

// [SECTION] SET USER AS ADMIN
module.exports.setUserAdmin = (req, res) => {

    let updateUser = {
        isAdmin: true
    };

    return User.findByIdAndUpdate(req.params.id, updateUser, { new: true, runValidators: true })
    .then(user => {
        if (user) {
            res.status(200).send({ 
                updatedUser: user
            });
        } else {
            res.status(404).send({ 
                error: 'User not found' 
            });
        }
    })
    .catch(err => {
        err.customError = 'Failed in Find';
        errorHandler(err, req, res);
    });
};

// [SECTION] UPDATE PASSWORD
module.exports.resetPassword = (req, res) => {

    const { newPassword } = req.body;
    const { id } = req.user; 

    // Hashing the new password
    bcrypt.hash(newPassword, 10)
        .then(hashedPassword => {
            return User.findByIdAndUpdate(id, { password: hashedPassword });
        })
        .then(() => {
            // Sending a success response
            res.status(201).json({ message: 'Password reset successfully' });
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        });

};
