const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/sendEmail');
const  {createSendToken}  = require('../middleware/token')

/**
 * @author Okpe Onoja <okpeonoja18@gmail.com>
 * @description Ping Server Controller
 * @route `/api/auth/`
 * @access Public
 * @type POST
 */
exports.ping = catchAsync(async (req, res, next) => {
  res.status(200).json({
    success: true,
    status: 'success',
    message: 'Hello from Auth',
  });
});

/**
 * @author Okpe Onoja <okpeonoja18@gmail.com>
 * @description Signup Controller
 * @route `/api/auth/signup`
 * @access Public
 * @type POST
 */
exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    // Check for required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all the required fields',
      });
    }

    // Check if email exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'The email address is already taken',
      });
    }

    // Generate OTP
    const otp = otpGenerator.generate(4, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });

    // Create user and set OTP
    const newUser = await User.create({
      name,
      email,
      password,
      otp,
    });

    // Send OTP email
    const message = `
      Hi ${name}, Welcome 🚀
      Here is your otp verification code ${otp}`;
    await sendEmail({
      to: newUser.email,
      subject: 'Welcome to Health Meeting 🚀',
      message,
    });

    // Create and send token
    createSendToken(newUser, 201, res);
  } catch (err) {
    console.error(err); // Log the error for debugging

    return res.status(500).json({
      success: false,
      message: "Couldn't create the user",
    });
  }
});

/**
 * @author Okpe Onoja <okpeonoja18@gmail.com>
 * @description Verify Users Email Controller
 * @route `/api/auth/verify`
 * @access Public
 * @type POST
 */
exports.verify = catchAsync(async (req, res, next) => {
  const { otpCode } = req.body;

  if (!otpCode) {
    return next(
      new AppError(
        'Please provide an otp code', 
        401
      )
    );
  }
  const user = await User.findOne({ otp: otpCode });
  
  if (!user) {
    return next(
      new AppError(
        'This otp code has expired or is invalid',
        401
      )
    );
  }

  if (user.isActive === true) {
    user.otp = null;
    return next(
      new AppError(
        'Your account has already been verified..', 
        400
      )
    );
  }

  //then change the user's status to active
  user.isActive = true;

  user.otp = null;

  await user.save({ validateBeforeSave: false });

  createSendToken(user, 200, res);
});

/**
 * @author Okpe Onoja <okpeonoja18@gmail.com>
 * @description Login in User Controller
 * @route `/api/auth/login`
 * @access Public
 * @type POST
 */
exports.login = catchAsync(async (req, res, next) => {
  // Check if user and password exist
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(
      new AppError(
        'Please provide email and password!', 
        400
      )
    );
  }

  // Check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User does not exist',
    });
  }

  if (user.isActive === false) {
    return next(
      new AppError('Please verify your email and try again.', 400)
    );
  }

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(
      new AppError(
        'Incorrect email or password', 
        401
      )
    );
  }

  createSendToken(user, 200, res);
});

/**
 * @author Okpe Onoja <okpeonoja18@gmail.com>
 * @description Resend verification otp to users email Controller
 * @route `/api/auth/resendverification`
 * @access Public
 * @type POST
 */
exports.resendVerification = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.isActive) {
      return res.status(400).json({
        status: false,
        message: 'Account has already been verified',
      });
    }

    const otp = otpGenerator.generate(4, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
    
    user.otp = otp;
    await user.save({ validateBeforeSave: false });

    const message = `
      Hi ${user.name}!
      Here's a new code to verify your account: ${otp}`;

    await sendEmail({
      to: user.email,
      subject: 'Verification Code 🚀!',
      message,
    });

    res.status(200).json({
      success: true,
      message: 'Verification code sent successfully!',
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Couldn't send the verification code",
    });
  }
});

/**
 * @author Okpe Onoja <okpeonoja18@gmail.com>
 * @description Forogot Password Controller
 * @route `/api/auth/forgotPassword`
 * @access Public
 * @type POST
 */
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError('There is no user with this email address', 404));
    }

    const otp = otpGenerator.generate(4, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });

    user.otp = otp;
    await user.save({ validateBeforeSave: false });

    const message = `
      Hi ${user.name},
      We heard you're having problems with your password.
      Here is your OTP verification code: ${otp}
      OTP expires in 10 minutes.`;

    await sendEmail({
      to: user.email,
      subject: 'Forgot Password',
      message,
    });

    res.status(200).json({
      success: true,
      message: 'Email sent successfully 🚀!',
    });
  } catch (err) {
    return next(new AppError('There was an error sending the email. Try again later!', 500));
  }
});


/**
 * @author Okpe Onoja <okpeonoja18@gmail.com>
 * @description Reset Password Controller
 * @route `/api/auth/resetpassword`
 * @access Public
 * @type POST
 */
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { otpCode, password, passwordConfirm } = req.body;

  // Check if OTP code is provided
  if (!otpCode) {
    return next(
      new AppError(
        'Please provide an otp code', 
        401
      )
    );
  }

  // Find user based on OTP code
  const user = await User.findOne({ otp: otpCode });

  if (!user) {
    return next(
      new AppError(
        'This otp code has expired or is invalid', 
        401
      )
    );
  }

  // Reset password
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.otp = null;
  await user.save();

  console.log(user.otp); // Log the OTP for debugging (optional)

  // Create and send new token
  createSendToken(user, 200, res);
});

/**
 * @description Protect Route Middleware
 * @param {...string} allowedUserTypes - Array of user types allowed to access the route
 * @returns {Function} Middleware function
 */
exports.restrict = (...allowedUserTypes) => {
  return (req, res, next) => {
    const user = req.user;
    
    if (!allowedUserTypes.includes(user.userType)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    
    next();
  };
};

/**
 * @author Okpe Onoja <okpeonoja18@gmail.com>
 * @description Controller for updating password
 * @route `/api/auth/updatepassword`
 * @access Private
 * @type PATCH
 */
exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Check if all required fields are provided
  if (!currentPassword || !newPassword || !confirmPassword) {
    return next(
      new AppError(
        'Please provide current password, new password, and confirm password',
        400
      )
    );
  }

  // Get the user from the database
  const user = await User.findById(req.user.id).select('+password');

  // Check if the current password is correct
  if (!(await user.correctPassword(currentPassword, user.password))) {
    return next(
      new AppError(
        'Current password is incorrect', 
        401
      )
    );
  }

  // Check if the new password and confirm password match
  // Check if the new password and confirm password match
  if (newPassword !== confirmPassword) {
    return next(
      new AppError(
        "New password and confirm password don't match", 
        400
      )
    );
  }

  // Update the user's password
  user.password = newPassword;
  user.passwordConfirm = confirmPassword;
  await user.save();

  // Sign and send the updated token along with the user data
  createSendToken(user, 200, res);
});

/**
 * @author Okpe Onoja <okpeonoja18@gmail.com>
 * @description Logout Controller
 * @route `/api/auth/logout`
 * @access Public
 * @type POST
 */
exports.logout = catchAsync(async (req, res, next) => {
  // Expire the JWT cookie immediately by setting it to 'loggedout'
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Successfully logged out',
  });
});

/**
 * @description Protect Route Middleware
 * Checks if the user is authenticated and authorized to access the route
 */
exports.protect = catchAsync(async(req, res, next)=>{
  let token;

  if (
      req.headers.authorization 
      && 
      req.headers.authorization.startsWith('Bearer')
      ){
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError(
        'You are not logged in! please log in to get access.', 
        401
      )
    );
  }

  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY);

    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return next(
        new AppError(
          'The user belonging to this token does no longer exist.', 
          401
        )
      );
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          'Password recently changed. Please log in again!', 
          401
        )
      );
    }

    req.user = currentUser;
    next();
  } catch (error) {
    return next(new AppError('Invalid token. Please log in again.', 401));
  }
})

