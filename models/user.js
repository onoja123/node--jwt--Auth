const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")


const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "please put it a name"],

        },
        email : {
            type: String,
            required: [true, "please put in an email"]
        },
        role: {
            type: String,
            enum: ["user", "guide", "lead-guide", "admin"],
            default: "user"
        },
        password: {
            type: String,
            required: [true, "please put it an password"],
            select: false
        },
        passwordConfirm: {
            type: String,
            required: [true, "please confirm your [password"]
        },
        changedPasswordAt: Date

    }
)

userSchema.pre("save", async function(next){
    if(!this.isModified('password')) return next()

    this.password = await bcrypt.hash(this.password, 12)

    this.passwordConfirm = undefined
    next()
})

userSchema.methods.correctpassword = async function(candidatepassword, userpassword){
    return await bcrypt.compare(candidatepassword, userpassword)
};

userSchema.methods.changedpasswordAfter = function(JWTTimestamp){
    if(this.changedPasswordAt){
        const changedStamp = parseInt(this.changedPasswordAt.getTime() / 1000, 10)
        return JWTTimestamp < changedStamp
    }
    return false;
}

const User = mongoose.model("User", userSchema)

module.exports = User