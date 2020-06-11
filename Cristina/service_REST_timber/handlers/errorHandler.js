function methodNotAllow(res) {
    res.status(405).send();
}

function sendError(res, error, optional=null){
    if (optional!=null)
        res.status(error.code).send({"error":error.msg + ": "+ optional});
    else
        res.status(error.code).send({"error":error.msg});
}

module.exports = {
    methodNotAllow,
    sendError
}