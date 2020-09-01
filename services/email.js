const nodemailer = require('nodemailer');
const nodemailerSendgrid = require('nodemailer-sendgrid');

const transporter = nodemailer.createTransport(
    nodemailerSendgrid({
        apiKey: process.env.SENDGRID_API_KEY
    })
);

exports.sendAnEmail = (receiver, subject, msg)=>{
    transporter.sendMail({
        from: process.env.SEND_MAIL_FROM,
        to: receiver,
        subject: subject,
        html: msg
    }, (err, info) => {
        // console.log(info);
        if(!err){
            console.log("Mail sent successfully");
        }
    });
}