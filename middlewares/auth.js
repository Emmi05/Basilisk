const autenticacionMiddleware = (req, res, next) => {
    if (req.session.loggedin) {
        req.user = {
            id: req.session.userId,
            name: req.session.name,
            rol: req.session.rol
            
        };
        next();// Si el usuario está autenticado, pasa al siguiente middleware
    } else {
        res.redirect('/login');
    }
};


export { autenticacionMiddleware }; // Exporta la función de middleware
