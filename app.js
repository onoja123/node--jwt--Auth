const express = require('express')

const userRoute = require("./routes/user")
const findRoute = require("./routes/find")
const AppError = require("./utils/AppError")

const app = express()

app.use(express.json())

app.use('/api/users', userRoute)
app.use('/api/users', findRoute)


app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    console.log(req.headers)
    next();
  });
  
//check for routers that dont exist
app.use("*", (req, res, next) => {
    next (new AppError(`cannot find ${req.originalUrl}on the server `),404)
})


module.exports = app;