const express = require('express')
const morgan = require('morgan')
const globalErrorHandler = require("./controllers/errorController")

const userRoute = require("./routes/user")
const authRoute = require("./routes/auth")
const AppError = require("./utils/AppError")

const app = express()

app.use(express.json())

app.use('/api/user', userRoute)
app.use('/api/auth', authRoute)

if(process.env.NODE_ENB === "production"){
  app.use(morgan('dev'))
}

app.use(globalErrorHandler)

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    console.log(req.headers)
    next();
  });
  
//check for routers that doesnt exist
app.use("*", (req, res, next) => {
    next (new AppError(`cannot find ${req.originalUrl} on the server `),404)
})


module.exports = app;