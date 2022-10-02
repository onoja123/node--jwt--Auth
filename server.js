const { default: mongoose } = require("mongoose");
const app = require("./app")

process.on("uncaughtException", err =>{
    console.log(err)
        process.exit(1) 
   
})


// const db = process.env.DATABASE_NAME.replace(
//     'PASSWORD',
//     process.env.DATABASE_PASSOWRD
// )

// mongoose.connect(db, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     userFindAndModify: true
// })
// .then(()=>{
//     console.log("Db connected sucessfully")
// })

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