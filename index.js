require('dotenv').config()
const express= require("express")
const mongoose = require('mongoose')
const cors = require("cors")
mongoose.set('strictQuery', true);

//App config
const app = express()
app.use(express.json())
app.use(express.urlencoded())
app.use(cors())

app.use(express.static("build"))
//DB config
mongoose.connect("mongodb://127.0.0.1:27017/reminderAppDB" ,{useNewUrlParser :true , useUnifiedTopology : false
}).then(() => console.log("Connection Successfully"))
  .catch((error) => console.log("Not connection " , error))

// create Schema

const reminderSchema = new mongoose.Schema({
    reminderMsg : String , 
    remindAt : String,
    isReminded : Boolean
})

const Reminder = new mongoose.model("reminder",reminderSchema)

// Whatapp reminding functionality
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

    setInterval(() => {
        Reminder.find({}, (err, reminderList) => {
            if(err) {
                console.log(err)
            }
            if(reminderList){
                reminderList.forEach(reminder => {
                    if(!reminder.isReminded){
                        const now = new Date()
                        if((new Date(reminder.remindAt) - now) < 0) {
                            Reminder.findByIdAndUpdate(reminder._id, {isReminded: true}, (err, remindObj)=>{
                                if(err){
                                    console.log(err)
                                }
                                const accountSid = process.env.ACCOUNT_SID 
                                const authToken = process.env.AUTH_TOKEN
                                const client = require('twilio')(accountSid, authToken); 
                                client.messages 
                                    .create({ 
                                        body: reminder.reminderMsg, 
                                        from: 'whatsapp:+14155238886',       
                                        to: 'whatsapp:+918449253151' //YOUR PHONE NUMBER INSTEAD OF 8888888888
                                    }) 
                                     .then(message => console.log(message.sid)) 
                                    // .done()
                            })
                        }
                    }
                })
            }
        })
    },1000)
    ;

// Specify Backend route  ---- API routes
app.get("/getAllReminder", (req , res)=>{
    // .find() will find in that list and after then we use callback function to check if error come or not
    Reminder.find({},(err , reminderList)=>{
        if(err){
            console.log(err);
        }
        if(reminderList){
            res.send(reminderList)
        }
    })
})

// In app.get(addReminder) whatever your reminder create we add your reminder in database 
// then after then we serach form your dataBase and add in frontend part of that particular reminder    
// req.body - send reminder data to html part inside body 

app.post("/addReminder", (req , res)=>{
    const {reminderMsg , remindAt} = req.body
    const reminder = new Reminder({
        reminderMsg,
        remindAt,
        isReminded:false
    })
    reminder.save(err =>{
        if(err){
            console.log(err);
        }  
        Reminder.find({} , (err , reminderList)=>{
            if(err){
                console.log(err);
            }
            if(reminderList){
                res.send(reminderList)
            }
        })
    })


})
app.post("/deleteReminder", (req , res)=>{
    Reminder.deleteOne({_id:req.body.id} , ()=>{
        Reminder.find({} , (err , reminderList)=>{
        if(err){
            console.log(err);
        }
        if(reminderList){
            res.send(reminderList)
        }
    })
})
})

app.listen(4000, ()=>console.log("Let started"))
