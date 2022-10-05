const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")


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
        changedPasswordAt: Date,
        createPasswordResetToken: String,
        passwordResetExpires: Date

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
        const timestamp = parseInt(this.changedPasswordAt.getTime() / 1000, 10)
   return timestamp < this.changedPasswordAt
    }
    return false;
}

userSchema.methods.createtokenreset = function(){
    const token = crypto.randomBytes(32).toString('hex');

    this.createPasswordResetToken = crypto.createHash('sha256').update(token).digest('hex')

    this.passwordResetExpires = Date.now() + 10 * 60 *1000;

    return token
}
const User = mongoose.model("User", userSchema)

module.exports = User