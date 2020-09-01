const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const { ensureAuthentication } = require('../authentication/auth');

//Register Page - GET
router.get('/', userController.getRegisterPage);
router.get('/register', userController.getRegisterPage);

//Register a User - POST
router.post('/register', userController.registerAUser);

//Login Page - GET
router.get('/login', userController.getLoginPage);

//Login Handle - POST
router.post('/login', userController.userLoginHandle);

//Logout Handle - GET
router.get('/logout', userController.userLogOutHandle);

//Verify Email - GET
router.get('/verifyemail/:token', userController.verifyUserEmail);

//Get account recovery page - GET
router.get('/account-recovery', userController.getAccRecoveryPage);

//Send reset password link to email - POST
router.post('/account-recovery', userController.sendResetLink);

//Get reset password link
router.get('/reset-password/:token', userController.getSetPasswordPage);

//Save new Password
router.post('/reset-password/:token', userController.saveResetPassword);

//Go to DashBoard - GET
router.get('/dashboard', ensureAuthentication, userController.getUserDashboard);


module.exports = router;