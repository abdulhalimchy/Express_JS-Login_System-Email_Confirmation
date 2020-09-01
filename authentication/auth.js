module.exports = {
    ensureAuthentication: (req, res, next)=>{
        if(req.isAuthenticated()){
            return next();
        }
        req.flash('error_msg', 'Please login to continue');
        res.redirect('/login');
    },

    forwardAuthentication: function (req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        }
        res.redirect('/dashboard');
    }
}