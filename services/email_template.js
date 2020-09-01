
//Verification email html template
exports.verifyEmailTemplate = (url)=>{
    let template = `<h1>Please verify your email to continue</h1>
<h3><a href="${url}">Click To Verify</a></h3>
<p>Note: This link is valid for 24 hours.</p>
`;
    return template
}

//Reset password email html template
exports.passResetEmailTemplate = (url)=>{
    let template = `<h1>Reset Your Password</h1>
<h3><a href="${url}">Reset Now</a></h3>
<p>Note: This link is valid for 10 minutes.</p>
`;
    return template
}