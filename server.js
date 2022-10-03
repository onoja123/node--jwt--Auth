const { mongoose } = require("mongoose");

const dotenv = require("dotenv")
dotenv.config({path: './config.env'})


const app = require("./app")

process.on("uncaughtException", err =>{
    console.log(err)
        process.exit(1) 
   
})


const DB = process.env.DATABASE.replace(
    'password',
    process.env.DATABASE_PASSWORD
)

mongoose.connect(DB, {
    useNewUrlParser: true,
})
.then(()=>{
    console.log("Db connected sucessfully")
})

const port = process.env.PORT || 3000

const server = app.listen(port, () => {
    console.log(`server running on port ${port}...`);
});


process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
      process.exit(1);
 })
});