const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const { ensureAuthentication, forwardAuthentication } = require('../authentication/auth');

//Register Page - GET
router.get('/', forwardAuthentication, userController.getRegisterPage);
router.get('/register', forwardAuthentication, userController.getRegisterPage);

//Register a User - POST
router.post('/register', forwardAuthentication, userController.registerAUser);

//Login Page - GET
router.get('/login', forwardAuthentication, userController.getLoginPage);

//Login Handle - POST
router.post('/login', forwardAuthentication, userController.userLoginHandle);

//Logout Handle - GET
router.get('/logout', ensureAuthentication, userController.userLogOutHandle);

//Verify Email - GET
router.get('/verifyemail/:token', forwardAuthentication, userController.verifyUserEmail);

//Get account recovery page - GET
router.get('/account-recovery', forwardAuthentication, userController.getAccRecoveryPage);

//Send reset password link to email - POST
router.post('/account-recovery', forwardAuthentication, userController.sendResetLink);

//Get reset password link
router.get('/reset-password/:token', forwardAuthentication, userController.getSetPasswordPage);

//Save new Password
router.post('/reset-password/:token', forwardAuthentication, userController.saveResetPassword);

//Go to DashBoard - GET
router.get('/dashboard', ensureAuthentication, userController.getUserDashboard);


module.exports = router;