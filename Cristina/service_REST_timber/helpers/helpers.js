const { uuid } = require('uuidv4');
const config = require('../config/config');

/* ================================================================ */
/* Helper functions. */
/* ================================================================ */

/** 
* terminator === the termination handler 
* Terminate server on receipt of the specified signal. 
* @param {string} sig Signal to terminate on. 
*/
function terminator(sig) {
    if (typeof sig === "string") {
        console.log('%s: Received %s - terminating sample app ...',
            Date(Date.now()), sig);
        process.exit(1);
    }
    console.log('%s: Node server stopped.', Date(Date.now()));
};

/** 
* Setup termination handlers (for exit and a list of signals). 
*/
function setupTerminationHandlers() {
    // Process on exit and signals. 
    process.on('exit', function () { terminator(); });

    // Removed 'SIGPIPE' from the list - bugz 852598. 
    ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
        'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
    ].forEach(function (element, index, array) {
        process.on(element, function () { terminator(element); });
    });
};

function generateId(){
    var id ="";
    id = uuid();
    id=id.substring(id.length-config.lenghtId); 
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    mm = (mm <10)? "0" + mm : mm;
    dd = (dd <10)? "0" + dd : dd;
    var yyyy = today.getFullYear();
    var full_id = yyyy.toString() + mm.toString() + dd.toString() + "-" + id;
    return {"full_id": full_id, "id": id};
}

function getDateCreated(){
    var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    var dateISO = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
    return dateISO;
}

function ConvertDMSToDD(degrees, minutes, seconds, direction) {
    var dd = Number(degrees) + Number(minutes)/60 + Number(seconds)/(60*60);

    if (direction == "S" || direction == "W") {
        dd = dd * -1;
    } // Don't do anything for N or E
    return dd;
}

function getCoordinates(gps){
    var coord = [];
    coord.push(ConvertDMSToDD(gps.GPSLatitude[0], gps.GPSLatitude[1], gps.GPSLatitude[2],gps.GPSLatitudeRef));
    coord.push(ConvertDMSToDD(gps.GPSLongitude[0],gps.GPSLongitude[1],gps.GPSLongitude[2],gps.GPSLongitudeRef));
    return coord
}
module.exports = {
    setupTerminationHandlers,
    generateId,
    getDateCreated,
    getCoordinates

};