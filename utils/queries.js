//IMPORT MODULE
const request = require('request');


//IMPORT GLOBAL VARIABLES
const {TOKEN, API_URL} = require('./../config/config');


//EXPORT FUNCTIONS
module.exports = {

    getBatches: function(func){
        const options = {
            method: 'GET',
            url: API_URL,
            qs: { 
                batches: 'all',
                token: TOKEN
            }
        };
        request(options, (error, response, body)=>{
            if(error) throw new Error(error);
            batches = JSON.parse(body);
            func(batches);
        })
    }, 

    getStudentsByBatch: function(batchId, func){
        const options = {
            method: 'GET',
            url: API_URL,
            qs: { 
                batchId: batchId,
                token: TOKEN
            }
        };
        request(options, (error, response, body)=>{
            if(error) throw new Error(error);
            students = JSON.parse(body);
            func(students);
        })
    }
}