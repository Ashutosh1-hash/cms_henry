//IMPORT MODULES
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const hbs = require('handlebars');


//DEFINITION OF COMPILE FUNCTION
const compile = async function(frame,details){
  var filePath=path.join(process.cwd(),'views',`${frame}.hbs`);
  var html=fs.readFileSync(filePath,'utf-8', function(err, result) {
    if (err) console.log("File read error", err);
  });
  return hbs.compile(html)(details);
};


//CERTIFICATE GENERATE FUNCTION
function generateCertificate(certificate){
  return new Promise(async function(resolve, reject){
    try{
      var browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        headless: true
      });
      var page = await browser.newPage();
      var content = await compile('certificate-frame',certificate);
      await page.setContent(content);
      await page.setViewport({
        width: 1024,
        height: 730,
        deviceScaleFactor: 3
      });
      await page.emulateMedia('screen');
      await page.screenshot({
        path:'./output/'+Date.now()+'.png',
        fullpage:true
      });
      resolve(true);
      await browser.close();
    }
    catch(e){
      reject(e);
    }
  });
}


//EXPORT FUNCTION
module.exports = generateCertificate





