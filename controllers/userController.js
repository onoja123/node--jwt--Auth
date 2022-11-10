const User = require("./../models/user")
const catchAsync = require("../utils/catchAsync")


//Getting all the users in the database
exports.getAllUsers = catchAsync(async (req, res, next) =>{
    const user = await User.find()

    res.status(200).json({
        status: "sucess",
        result: user.length, 
        data : {
            user
        }
    })
})


//Getting a particular user
exports.getUsers = catchAsync(async  (req, res, next) =>{
    const user = User.findById(req.params.id)

    res.status(200).json({
        status: "sucess",
        data : {
            user
        }
    })
})


//Creating a user
exports.createUser = catchAsync(async  (req, res, next) =>{
    const user = User.create(req.body)

    res.status(200).json({
        status: "sucess",
        data : {
            user
        }
    })
})

//Updateing a user to the database
exports.UpdateUser = catchAsync(async  (req, res, next) =>{
    const user = User.findByIdAndUpdate(req.params.id, req.body, {
        new: true
    })


    res.status(200).json({
        status: "sucess",
        data : {
            user
        }
    })
})


//deleting a user from the database
exports.deleteUser =  catchAsync(async (req, res, next) =>{
    const user = User.findByIdAndDelete(req.params.id, req.body)

    res.status(200).json({
        status: "sucess",
        data : {
            user: null
        }
    })
})