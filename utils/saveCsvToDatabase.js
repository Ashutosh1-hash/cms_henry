//IMPORT MODULES
const fastCSV = require('fast-csv');
const fs = require('fs');





function saveCsvToDatabase(fileName){
    let stream = fs.createReadStream(fileName);
    let csvData = [];
    let csvStream = fastCSV.parse()
                    .on("data", function(data){
                        csvData.push(data);
                    }).on("end", function () {
                        csvData.shift();
                        // console.log(csvData);
                    });
    stream.pipe(csvStream);
}