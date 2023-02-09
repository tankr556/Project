const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
    fname: {
        type: String
    },
    lname: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    phno: {
        type: String
    },
    gender: {
        type: String
    },
    Tokens: [{
        token: {
            type: String
        }
    }]
})

userSchema.methods.generateToken = async function () {
    try {
        const token = await jwt.sign({ _id: this._id }, process.env.UKEY)
        this.Tokens = this.Tokens.concat({ token })
        this.save()
        return token;
    } catch (error) {

    }
}
userSchema.pre("save", async function (next) {
    try {
        if (this.isModified("password")) {
            this.password = await bcrypt.hash(this.password, 10);
            next();
        }
    } catch (error) {
        console.log(error);
    }
})

module.exports = new mongoose.model("User", userSchema)