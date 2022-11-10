const catchAsync = require("./catchAsync");

const sendEmail = catchAsync(async options =>{
    var transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  
    const mailOption = {
      from: "tester <tester@gmail.com>",
      to: options.email,
      subject: options.subject,
      text: options.text
    }
  
    await transport.sendMail(mailOption)
  
  }
)

module.exports = sendEmail;