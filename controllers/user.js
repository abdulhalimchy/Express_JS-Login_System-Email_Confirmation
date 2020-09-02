const User = require('../models/User');
const myValidator = require('../validators/myValidator');
const stringFormat = require('../validators/stringFormat');
const bcrypt = require('bcrypt');
const { sendAnEmail } = require('../services/email');
const { verifyEmailTemplate, passResetEmailTemplate } = require('../services/email_template');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const router = require('../routes/user');


//-------------GET REGISTER PAGE-----------------
exports.getRegisterPage = (req, res) => {
    res.render('register');
}


//----------------REGISTER A USER AND SAVE INTO DATABASE---------------------
exports.registerAUser = (req, res) => {
    let { name, email, username, password, confirmpassword } = req.body;

    //Formating and removing extra white space
    name = stringFormat.removeExtraWhiteSpace(name).toUpperCase();
    email = email.trim().toLowerCase();
    username = username.trim().toLowerCase();

    let errors = [];

    //Check require fields
    if (!name || !email || !username || !password || !confirmpassword) {
        errors.push({ message: "Please fill in all fields" });
    }

    //Name contains letters only
    if (!myValidator.isLetterAndSpace(name)) {
        errors.push({ message: "Name can contain letters only" });
    }

    //Is email
    if (!myValidator.isEmail(email)) {
        errors.push({ message: "Invalid email" });
    }

    //Username start with letter and contain letter and numbers only
    if (!myValidator.isLetterAndNumber(username)) {
        errors.push({ message: "Username should start with a letter & can contain letters and numbers" });
    }

    //Username at 3 char
    if (username.length < 3) {
        errors.push({ message: "Username should be at least 3 characters" });
    }

    //Username at most 32 char
    if (username.length > 32) {
        errors.push({ message: "Username should be at most 32 characters" });
    }

    //Check password match
    if (password !== confirmpassword) {
        errors.push({ message: "Passwords do not match" });
    }

    //Check pass length
    if (password.length < 6) {
        errors.push({ message: "Password should be at least 6 characters" });
    }

    //If have any error
    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            username,
            password,
            confirmpassword
        });
    } else {
        //Validation passed
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    //Already user exists
                    errors.push({ message: "This Email is already registered" });
                    res.render('register', {
                        errors,
                        name,
                        email,
                        username,
                        password,
                        confirmpassword
                    });
                }
                else {

                    //Check username
                    User.findOne({ username: username })
                        .then(async userRes => {
                            if (userRes) {
                                //This username is not avaiable
                                errors.push({ message: "This username is not available" });
                                res.render('register', {
                                    errors,
                                    name,
                                    email,
                                    username,
                                    password,
                                    confirmpassword
                                });
                            } else {
                                //No user exits, so allow this email to regiser
                                await bcrypt.hash(password, 10, (err, hash) => {
                                    if (err) {
                                        res.json({
                                            error: err
                                        });
                                    }
                                    const newUser = new User({
                                        name,
                                        email,
                                        username,
                                        password: hash
                                    });


                                    // save the user to database
                                    newUser.save()
                                        .then(async user => {

                                            //Creating a token
                                            let token = await jwt.sign({ email: newUser.email, _id: newUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: '24h' });
                                            let verifyUrl = `${process.env.BASE_URL}/verifyemail/${token}`;

                                            //send verification email
                                            await sendAnEmail(email, 'Verify your email', verifyEmailTemplate(verifyUrl));

                                            req.flash('success_msg', 'Registration Successful, Please verify email to login');
                                            res.redirect('/login');
                                        })
                                        .catch(err => console.log('err'));
                                });
                            }
                        })
                        .catch(err => console.log(err));

                }
            })
            .catch(err => console.log(err));
    }
}


//-------------------------GET LOGIN PAGE-------------------------------------
exports.getLoginPage = (req, res) => {
    res.render('login');
}

//-----------------------LOGIN HANDLE----------------------------
exports.userLoginHandle = (req, res, next) => {
    if (!req.body.email || !req.body.password) {
        res.render('login', { error_msg: "Please fill in all fields", email: req.body.email, password: req.body.password });
    }
    else if (!myValidator.isEmail(req.body.email)) {
        res.render('login', { error_msg: "Invalid email" });
    } else {
        passport.authenticate('local', {
            successRedirect: '/dashboard',
            failureRedirect: '/login',
            failureFlash: true
        })(req, res, next);
    }
}


//-----------------------------LOGOUT HANDLE------------------------
exports.userLogOutHandle = (req, res) => {
    req.logOut();
    req.flash('success_msg', 'Logged out successfully');
    res.redirect('/login');
}

// -----------------------------------VERIFIY USER EMAIL--------------------------------
exports.verifyUserEmail = async (req, res) => {
    const token = req.params.token;

    try {
        const decode = await jwt.verify(token, process.env.JWT_SECRET_KEY);

        //Token is valid, so search is it verified alreadly?
        await User.findOne({ email: decode.email }).select('emailVerified')
            .then(async user => {
                if (user.emailVerified) {
                    //Alreadly email is verified.
                    console.log('ALREADY VERIFIED.....');
                    req.flash('error_msg', 'Invalid request');
                } else {
                    //Update the emailVerified status to True
                    await User.findOneAndUpdate({ _id: user._id }, { emailVerified: true })
                        .then(res => {
                            req.flash('success_msg', 'Email verified successfully');
                        })
                        .catch(err => {
                            req.flash('error_msg', 'Invalid request');
                        });
                }

            })
            .catch(err => {
                req.flash('error_msg', 'Invalid request');
            });

    } catch (error) {
        console.log("I am error");
        req.flash('error_msg', 'Invalid request');
    }

    res.redirect('/login');
}

//-------------------------GET ACCOUNT RECOVERY PAGE----------------------
exports.getAccRecoveryPage = (req, res) => {
    res.render('account_recovery');
}


//-------------------------SEND PASSWORD RESET LINK TO EMAIL----------------------
exports.sendResetLink = (req, res) => {
    const email = req.body.email;
    if (!email) {
        res.render('account_recovery', { error_msg: "Please input an email", email });
    }
    else if (!myValidator.isEmail(email)) {
        res.render('account_recovery', { error_msg: "Invalid email" });
    } else {
        User.findOne({ email: email })
            .then(async user => {
                if (!user) {
                    //No user exists in this email
                    res.render('account_recovery', { error_msg: "Email not found" });
                } else {
                    //Creating a token
                    let token = await jwt.sign({ email: user.email, _id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '10m' });
                    let url = `${process.env.BASE_URL}/reset-password/${token}`;

                    //Send password reset link to email
                    await sendAnEmail(email, 'Password reset', passResetEmailTemplate(url));

                    res.render('account_recovery', { success_msg: "Reset link has sent to your email" });
                }
            })
            .catch(err => console.log(err));
    }
}

//-----------------------------GET NEW PASSWORD PAGE----------------------
exports.getSetPasswordPage = async (req, res) => {
    const token = req.params.token;
    try {
        const decode = await jwt.verify(token, process.env.JWT_SECRET_KEY);
        res.render('reset_password', { resetkey: token });
    } catch (error) {
        req.flash('error_msg', 'Invalid request');
        res.redirect('/login');
    }
}

//--------------------------SAVE RESET PASSWORD---------------------------
exports.saveResetPassword = async (req, res) => {
    const token = req.params.token;
    try {
        const decode = await jwt.verify(token, process.env.JWT_SECRET_KEY);
        const { password, confirmpassword } = req.body;
        let errors = [];

        //Form validation
        //check empty value
        if (!password || !confirmpassword) {
            errors.push({ message: "Please fill all the fields" });
        }
        //Check password match
        if (password !== confirmpassword) {
            errors.push({ message: "Passwords do not match" });
        }

        //Check pass length
        if (password.length < 6) {
            errors.push({ message: "Password should be at least 6 characters" });
        }

        // if have errors
        if (errors.length > 0) {
            res.render('reset_password', { resetkey: token, errors });
        } else {
            //encrypting password
            await bcrypt.hash(password, 10, (err, hash) => {
                if (err) {
                    res.json({
                        error: err
                    });
                }
                
                console.log("I am going to save password");
                //update the password
                User.findOneAndUpdate({ email: decode.email }, { password: hash })
                    .then(user => {
                        req.flash('success_msg', 'Password changed successfully');
                        res.redirect('/login');
                    })
                    .catch(err => {
                        req.flash('error_msg', 'Invalid request');
                        res.redirect('/login');
                    });
            });
        }
    } catch (error) {
        console.log("I am error to save password");
        req.flash('error_msg', 'Invalid request');
        res.redirect('/login');
    }
}

//-------------------------GET USER DASHBOARD-----------------------------
exports.getUserDashboard = (req, res) => {
    console.log(req.user);
    res.render('dashboard', { user_name: req.user.name });
}