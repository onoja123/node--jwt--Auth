const {promisify} = require('util')
const User = require("./../models/user")
const AppError = require("./../utils/AppError")
const catchAsync = require("./../utils/catchAsync")
const jwt = require("jsonwebtoken")

// token 

const signToken = id =>{
    return jwt.sign({id: id}, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES
    })
}

//create user

exports.singup = catchAsync(async(req, res, next)=>{
    const newuser = await User.create(req.body)
    res.status(200).json({
        status: "success",
        data: {
            new: newuser
        }
    })
})

//login users

exports.login = catchAsync(async(req, res, next)=>{
    //check if user and password exist
const token = signToken(User._id)
    const {email, password} = req.body

    if(!email || !password){
        return next(new AppError("email and password doesnt exit"), 402)
    }

    //check if email and password is correct

    const user = User.findOne({email}).select('+password')

    if(!user && !(await user.correctpassword(password, user.password))){
        return next(new AppError("i think you need to check your email and password"), 402)
    }

    res.status(200).json({
        status: 'ok',
        token

    })
})


//protecting authorization


exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check of it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
  
    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }
  
    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  
    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          'The user belonging to this token does no longer exist.',
          401
        )
      );
    }
  
    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError('User recently changed password! Please log in again.', 401)
      );
    }

    //Grant access to the protected router

    req.user = currentUser();
    next();
})

exports.restrict = (...roles)=>{
    return (req, res, next)=>{
        if(!roles.includes(req.user.roles)){
            return next(new AppError("you arent authenticated"), 402)
        }
    }
    next()
}