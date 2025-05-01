const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    if(res.headersSent) {
        return next(err);
    }

    //definir código de status padrão caso naõ seja definido

    const statusCode = err.status || 500;

    res.status(statusCode).json({
        error: err.message || "Erro Interno de Servidor",
    });
};


export default errorHandler