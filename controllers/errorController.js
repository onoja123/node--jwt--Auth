const AppError = require("./../utils/AppError")



const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
  
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
  };

  const handleJwtError = () => new AppError('Invalid token, please login again', 401) 
  const ExpiredTokenError = () =>{
    new AppError("token expired, try again", 401)
  }

  
const sendDev = (err, res) =>{
    res.status(err.statusCode)
    .json({
        status: err.status,
        message: err.message
    })
}

const sendProd = (err, res) =>{
    if(err.isOperational){
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    
    }else{
        console.log("Error", err)
    }
    res.status(statusCode).json({
        status: err.status,
        message: err.message
    })
}

module.exports = (err, req, res, next)=>{
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';


    if(process.env.NODE_ENV === 'production'){
        sendProd(err, res)
    }else if(process.env.NODE_ENV === 'development'){
        sendDev(err, res)
    }
    let error = {...err}

    if(error.name ==='jsonwebtokenerror')error = handleJwtError()
    error = handleValidationErrorDB(error)
    if(error.name ==='TokenExpiredError') error = ExpiredTokenError()
    sendProd(err, res)
}

