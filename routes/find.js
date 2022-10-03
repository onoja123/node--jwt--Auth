const express = require('express')

const userController = require('./../controllers/userController')
const authController = require('./../controllers/authController')
const router = express.Router()



router.route("/")
.get("/", authController.protect ,userController.getAllUsers)
.post(userController.createUser)

router.route("/:id")
.get(userController.getAllUsers)
.patch(userController.UpdateUser)
.delete(authController.protect,authController.restrict("admin", "lead-guide"),userController.deleteUser)


module.exports = router