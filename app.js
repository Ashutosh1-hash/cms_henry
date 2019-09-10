//IMPORT MODULES
const express = require("express");
const path = require("path");
const fs = require('fs');
const bodyParser = require("body-parser");
const hbs = require('handlebars');
const puppeteer = require('puppeteer');
const fileUpload = require('express-fileupload');
const csv = require('fast-csv');
const app = express();
const pdfFolder = './output';
app.use(express.static('templates2'));
app.use(express.static('output'));
var mysql = require('mysql');
var db = require('./db');
const fsExtra = require('fs-extra')


//DEFINE PORT 
const port = process.env.PORT || 3306;


//IMPORT QUERY FUNCTIONS
const {getBatches, getStudentsByBatch} = require('./utils/queries');


//IMPORT CERTIFICATE GENERATOR FUNCTION
const generateCertificate = require('./utils/generate-certificate');


//IMPORT TODAY DATE
const todayDate = require('./utils/getTodayDate');


//SET OUTPUT FOLDER FOR GENERATED CERTIFICATE
const output = './output';
const upl='./upload';


//USE BODY PARSER MIDDLEWARE
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//USE TEMPLATE ENGINE
app.set("view engine", "hbs");


//USE FILE UPLOAD MIDDLEWARE
app.use(fileUpload());



//DEFINE ROUTES

//HOMEPAGE ROUTE
app.get('/',(req,res)=>{
  res.render('homepage');
});


//CRM ROUTE
app.get('/batches',(req,res)=>{
    getBatches((batches)=>{
      res.render('batches',{batches:batches});
    })
})


//GET BATCH STUDENTS ROUTES
app.get('/batch/:id',(req,res)=>{
    getStudentsByBatch(req.params.id,(students)=>{
      res.render('batch',{students:students});
    })
});


//GENERATE CERTIFICATE ROUTE
app.post('/generate-certificate', (req,res)=>{
  const id = req.body.id;
  const name = req.body.name;
  const course = req.body.course;
  const certificate = {
    id: id,
    name: name,
    course: course,
    date: todayDate
  };
  generateCertificate(certificate).then(status=>{
    if(status==true){
      res.json({status: 200, message: 'Certificate generated', success: true, error: false});
    }else{
      res.json({status: 500, message: 'Certificate generation failed', success: false, error: true});
    }
  }).catch(err=>{
    res.json({status: 500, message: 'Certificate generation failed', success: false, error: true, err: err});
  })
});


//UPLOAD CSV ROUTE
app.get('/upload-csv',(req,res)=>{
  res.render('upload-csv');
});

/* WORKED TILL HERE*/





var as='';
var ad='';

var token='';
var batch_date='';
  var course='';
  var length='';
  var csk=[];

/*app.post('/upload', function(req, res){
  if (req.files.length == 0) {
    return res.status(400).send('No files were uploaded.');
  }

  var csvFile = req.files.csvFile;
  var file2 = csvFile.name;
  ad=file2;
  as=file2.replace(/\.[^/.]+$/, "");
  var fileName = Date.now() + '.csv';

  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv('./utils/'+ fileName, function(err) {
    if (err) return res.status(500).send(err);
    //Call Function to convert to json from file
  });
  
});*/


app.post('/upload', function(req, res) {

fsExtra.emptyDirSync(upl);

  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.');
  }

  
  let sampleFile = req.files.sampleFile;
  
  
var file2=sampleFile.name;
ad=file2;
  as=file2.replace(/\.[^/.]+$/, "");

  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv('./upload/'+sampleFile.name, function(err) {
    if (err) return res.status(500).send(err);
    importCsvData2MySQL('./upload/'+as+'.csv');


function importCsvData2MySQL(filename){
    let stream = fs.createReadStream(filename);
    let csvData = [];
    let csvStream = csv
        .parse()
        .on("data", function (data) {
            csvData.push(data);
        })
        .on("end", function () {
            // Remove Header ROW
            csvData.shift();
            token= csvData[1][6];
            batch_date=csvData[1][4];
            course=csvData[1][2];
            length=csvData.length;
            
              /*csk.push(length);*/
              csk.push(course);
              csk.push(batch_date);
              csk.push(token);
console.log(csk);
            
            
           

            const connection = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: 'root',
                database: 'anp2'
            });

            // Open the MySQL connection
            connection.connect((error) => {
                if (error) {
                    console.error(error);
                } else {
                    let query = 'REPLACE INTO excel(s_no, name,course,certificate_no,batch_date,email,token) VALUES ?';
                    connection.query(query, [csvData], (error, response) => {
                      if(error) throw error;

                       
                      

                        console.log("done");
                 
                        
                    });
                    
                }
            });
        });

    stream.pipe(csvStream);
                               }


     
  });
  
});


app.get("/db1",(req,resp)=>{



  
  
  var sql = 'SELECT * FROM excel WHERE token = ?';
  db.query(sql,token, (err,results,fields)=>{
    if(err) throw err;
    queryResult=results;
    console.log(queryResult);
    var students;
resp.render('excel_table',{students:results});
  


   });

});

app.get("/db2",(req,resp)=>{


                    let que = `REPLACE INTO records(length,course,batch_date,token) VALUES ('${length}', '${course}', '${batch_date}','${token}');`
                    db.query(que, (error, response) => {
                       
                     if(error) throw error;

                        console.log("records updated");
                        
                    });
});

app.get("/db3",(req,resp)=>{

var sql = 'SELECT * FROM records';
  db.query(sql, (err,results,fields)=>{
    if(err) throw err;
   
    var jo;
resp.render('excel_table2',{jo:results});
  });
});




app.get('/explorer',(req,res)=>{
  var fileArray = [];

  fs.readdir(pdfFolder, (err, files) => {
    files.forEach(file => {
      fileArray.push(file);

    });
    
    res.render('explorer2.hbs',{files:fileArray});
  });

  

  

});



   

app.get('/certificate_no',(req,res)=>{
  res.render('base.hbs');
});




app.get('/show-certificates',(req,res)=>{
  var fileArray = [];
  fs.readdir(output, (err, files) => {
    files.forEach(file => {
      fileArray.push(file);
    });
    res.render('explorer2',{files:fileArray});
  });
});


//RE-EDIT
app.get("/redit",function(req,res){
  console.log(queryResult);
  res.render('students2',{students2:queryResult});
});


app.get('/generate',(req,res)=>{
  fsExtra.emptyDirSync(pdfFolder);

      var compile=async function(templateName,queryResult){
  var filePath=path.join(process.cwd(),'templates2',`${templateName}.hbs`);
  //console.log(filePath)
  var html=fs.readFileSync(filePath,'utf-8', function(err, result) {
    if (err) console.log("readFile error", err);
  });

 
  return hbs.compile(html)(queryResult);

};


(async function(){

  try{
    var browser= await puppeteer.launch({
    args: ['--no-sandbox'],
    headless: true
  });

    for (var i = 0; i < queryResult.length; i++) {
    
    var page=await browser.newPage();
    if(queryResult[i].course=='GST'){
    
        var content= await compile('test11',queryResult[i]);
      }
    else if(queryResult[i].course=='CDCW'){
          var content= await compile('test12',queryResult[i]);
        }
    else if(queryResult[i].course=='CBAP'){

         var content= await compile('test13',queryResult[i]);

    } 

    else if(queryResult[i].course=='CSGB'){
      var content= await compile('test14',queryResult[i]);

    }  
    else{

      var content= await compile('test15',queryResult[i]);
    }
    await page.setContent(content);
    await page.setViewport({
        width: 1024,
        height: 730,
        deviceScaleFactor: 3
    });
    await page.emulateMedia('screen');



   
    await page.screenshot({
      path:'./output/'+`${queryResult[i].name}`+(i+1)+'.png',
      /*width: '950px',
        height: '650px',
        pageRanges: '1-1',
      printbackground:true*/
      fullpage:true
      
    });}
    
    //alert(' All Certificates Generated!!');
    console.log('done');
    
  
  
  }
  catch(e){
    console.log('our  error',e);

  }
})();


      //res.send("Hello");
     
});











//START APP ON GIVEN PORT
app.listen(port, ()=>{
  console.log(`My app started at port ${port}`);
});

