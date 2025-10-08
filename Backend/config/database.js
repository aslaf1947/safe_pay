var mongoose=require('mongoose')

function database(){
    mongoose.connect("mongodb://0.0.0.0:27017/safepay")
    .then(()=>{
        console.log("successfull");})
    .catch(err=>{
        console.log(err);   
    })
}
module.exports=database