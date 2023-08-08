const User = require("../models/user")
const catchAsync = require("../utils/catchAsync")
const AppError = require('../utils/appError');
/**
 * @author Okpe Onoja <okpeonoja18@gmail.com>
 * @description Get All Users Controller
 * @route `/api/user/users`
 * @access Private (Only accessible by authorized users)
 * @type GET
 */
exports.getAll = catchAsync(async (req, res, next) => {
    try {
      const users = await User.find()
  
      // Check if users exist
      if (!users || users.length === 0) {
        return next(new AppError('Users not found', 404));
      }
  
      // Return data of all users
      res.status(200).json({
        success: true,
        len: users.length,
        data: users,
      });
    } catch (error) {
      next(new AppError('An error occurred. Please try again.', 500));
    }
});

/**
 * @author Okpe Onoja <okpeonoja18@gmail.com>
 * @description Get profile Controller
 * @route `/api/user/profile/:id`
 * @access Private (Only accessible by authorized users)
 * @type GET
 */
exports.getProfile = catchAsync(async (req, res, next) => {
    try {
      const userId = req.user._id;
  
      const user = await User.findById(userId)
  
      // Check if the user exists
      if (!user) {
        return next(new AppError('Profile not found', 404));
      }
  
      // Return the user profile data
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(new AppError('An error occurred. Please try again.', 500));
    }
  });
  

/**
 * @author Okpe Onoja <okpeonoja18@gmail.com>
 * @description Delete User Controller
 * @route `/api/user/delete/:id`
 * @access Private (Only accessible by authorized users)
 * @type DELETE
 */
exports.deleteUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: null,
    },
  });
});
