app.use(function(req, res, next) {
    if (req.session && req.session.lastAccess) {
        var now = new Date();
        var elapsedTime = now - req.session.lastAccess;
        var maxAge = req.session.cookie.maxAge;
        
        if (elapsedTime > maxAge) {
            // La sesión ha expirado
            // Puedes hacer lo que necesites aquí, como destruir la sesión
            req.session.destroy(function(err) {
                if (err) {
                    console.log(err);
                }
            });
        }
    }
    
    // Actualizar el tiempo de última acceso en cada solicitud
    req.session.lastAccess = new Date();
    
    next();
});


export { autorizacionMiddleware }; // Exporta la función de middleware