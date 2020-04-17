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

module.exports = {
    setupTerminationHandlers
};