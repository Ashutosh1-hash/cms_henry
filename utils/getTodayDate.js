//EXPORT FUNCTION
module.exports.getTodayDate = function(){
    const date = new Date();
    const todayDate = date.getDate() +'-'+ date.getMonth() +'-'+ date.getFullYear();
    return todayDate;
}
