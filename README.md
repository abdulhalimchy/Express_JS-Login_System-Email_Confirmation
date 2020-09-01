# Express JS - Login System | Email Confirmation | Reset Password
This is project about Login Sytem in Express JS - Node JS. This project covers form validation from server side, email confirmation on registration, reset password through a link that is sent to email, protecting route from unauthorized access etc.

## Dependencies
Check package.json file to view the dependencies that are used in this project.

## Authentication Strategy
Used 'Passport-local' strategy for authentication

## Email Service
Used SendGrid email service. NPM packages - 'nodemailer' and 'nodemailer-sendgrid' 

Before working with this project, install all dependencies that are mentioned in package.json
To install all dependencies, use the following command -
##Install Dependencies

    npm install

## Setup .env file
Setup your KEY's, PORT and Base url in .env file
```
MONGO_DB_URI=mongodb://localhost:27017/userAuthEmailVerifyDB
SENDGRID_API_KEY=<Your SendGrid API_KEY>
SEND_MAIL_FROM=<Your Email Address>
JWT_SECRET_KEY=<Anything you can use as SECRET_KEY>
PORT=3000
BASE_URL=http://localhost:3000
```
## Run
```
npm start
	or
npm run dev
```