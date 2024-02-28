
//3- Invocamos a dotenv
const dotenv = require('dotenv');
dotenv.config({ path: './env/.env'});


//6 -Invocamos a bcrypt
const bcrypt = require('bcryptjs');

//7- variables de session
const session = require('express-session');
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

// 8 - Invocamos a la conexion de la DB
const connection = require('./database/db');


//10 - Método para la REGISTRACIÓN
const registro= app.post('/register', async (req, res)=>{
	const user = req.body.user;
	const name = req.body.name;
    const rol = req.body.rol;
	const pass = req.body.pass;
	let passwordHash = await bcrypt.hash(pass, 8);
    connection.query('INSERT INTO users SET ?',{user:user, name:name, rol:rol, pass:passwordHash}, async (error, results)=>{
        if(error){
            console.log(error);
        }else{            
			res.render('register', {
				alert: true,
				alertTitle: "Registration",
				alertMessage: "¡Successful Registration!",
				alertIcon:'success',
				showConfirmButton: false,
				timer: 1500,
				ruta: ''
			});
            //res.redirect('/');         
        }
	});
})



//11 - Metodo para la autenticacion
const auth=app.post('/auth', async (req, res)=> {
	const user = req.body.user;
	const pass = req.body.pass;    
    let passwordHash = await bcrypt.hash(pass, 8);
	if (user && pass) {
		connection.query('SELECT * FROM users WHERE user = ?', [user], async (error, results, fields)=> {
			if( results.length == 0 || !(await bcrypt.compare(pass, results[0].pass)) ) {    
				res.render('login', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "USUARIO y/o PASSWORD incorrectas",
                        alertIcon:'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login'    
                    });
				
				//Mensaje simple y poco vistoso
                //res.send('Incorrect Username and/or Password!');				
			} else {         
				//creamos una var de session y le asignamos true si INICIO SESSION       
				req.session.loggedin = true;             
				req.session.name = results[0].name;
				req.session.rol = results[0].rol;
				if(req.session.rol == 'usuario'){
				//console.log(req.session.rol);
				res.render('login', {
					alert: true,
					alertTitle: "PROPIEDAD DE:",
					alertMessage: "¡SARAHI!",
					alertIcon:'success',
					showConfirmButton: false,
					timer: 1500,
					ruta: ''
				});        			} else {
					res.render('login',{
						alert: true,
						alertTitle: "Eres Larry",
						alertMessage:"Ata Papa",
						alertIcon:'success',
						showConfirmButton:false,
						timer: 1500,
						ruta:''
					});
				}
			}			
			res.end();
		});
	} else {	
		res.send('Please enter user and Password!');
		res.end();
	}
});

export const methods={
    registro,
    auth
}