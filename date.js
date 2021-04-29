module.exports=getDate;
function getDate(){
    var today = new Date();
    var currentday = today.getDay();
    var options = {
        weekday : "long",
        day: "numeric",
        month:"long"
    };
var day = today.toLocaleDateString("en-US", options);
    return day;
}
module.exports.getDay =  function() {
    let today = new Date();
    let options = {
        weekday:"long"
    };
    return today.toLocaleDateString("en-US",options);

}