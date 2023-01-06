const express=require('express');
const bodyParser=require('body-parser');
const fileUpload = require('express-fileupload');
const cors=require('cors');
const path = require("path");
const xlsx = require("xlsx");
const mongodb=require('mongodb');
const async=require('async');
const app=express();
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(fileUpload());
app.use(cors());

app.post('/upload', async(req, res) => {

    if (!req.files) {
        return res.status(500).send({ msg: "file is not found" })
    }
    const myFile = req.files.file;
    await myFile.mv(`${__dirname}/public/${myFile.name}`, function (err) {
        if (err) {
            console.log(err)
            return res.status(500).send({ msg: "Error occured" });
        }
        return res.status(200).send();
    });
});
app.post('/submit', async(req, res) => {
    const myFile = req.files.file;
    const filePath = path.resolve(`${__dirname}/public/${myFile.name}`);
    const workbook = xlsx.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    let data=[]
    for(let i=0;i<sheetNames.length;i++){
        const temp = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNames[i]])
        temp.forEach((obj)=>{
            data.push(obj)
        })
    }
    async.eachSeries(data,async function(file){
        const posts=await loadPostsCollection()
        const present=await posts.find({"Email":file.Email}).toArray()
        if(present.length < 1){
            await posts.insertOne({
                ...file
            })
        }
    },function(err){
        if(err){
            console.log(err)
            return res.status(500).send();
        }   
        return res.status(200).send({msg:"Done"});
    })
})

async function loadPostsCollection(){
    const client=await mongodb.MongoClient.connect(
        //Add your mango location here,{
            useNewUrlParser:true
    });
    return client.db('Cluster0').collection('profile');
}
const port = 4500;


app.listen(port,()=>console.log(`Server on port ${port}`));