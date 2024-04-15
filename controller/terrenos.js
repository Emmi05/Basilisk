
import { pool} from '../database/db.js'



//expresion para terrenos
const idInternoRegex = /^\d+\.\d+\/\d+$/;
const loteRegex = /^\d{1,2}$/;
const manzanaregex = /^[a-zA-Z0-9\s-]+$/;
const dimensionesregex = /^\d+$/;
const precioRegex = /\b\d{1,3}(,\d{3})*(\.\d+)?\b/;
const predialregex = /^\d{3}-\d{3}-\d{3}-\d{3}$/;
const addressRegex = /^[A-Za-z0-9\s-]{10,100}$/;



// Expresiones regulares globales
const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
const nombreRegex = /^[A-Za-zÁ-Úá-ú\s]+$/;
const apellidoRegex = /^[A-Za-zÁ-Úá-ú]+$/;
const celRegex = /^\d{10}$/;


const cantidades = /^\d*,?\d+$/;

// abonos
const numeros= /^\d+$/;
// terreno
export const crearTerreno= async (req, res) => {
    try {
        const { id_interno, calle, lote, manzana, superficie, precio, predial, escritura, estado } = req.body;
        
        console.log(req.body);
        // Convertir el precio a un número entero
        // const precioTerreno = parseFloat(precio);
        if (req.session.rol == 'admin') {
        const precioTerreno = parseFloat(precio.replace(',', ''));

        // Verificar si algún campo está vacío
        if (!id_interno || !calle || !lote || !manzana || !superficie || !precio || !predial || !escritura || !estado) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Debes rellenar todos los campos!",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 1500,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
            });
        }
        const existinid_interno = await pool.query('SELECT * FROM land WHERE id_interno = ?', id_interno);
        console.log(existinid_interno)
        if (existinid_interno[0].length > 0) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El id_interno ya existe. Por favor, verifique el id",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
            });
        }

        // const idInternoRegex = /^\d+(\.\d+)?(\/\d+)?$/;
        // const idInternoRegex = /^\d+\.\d+\/\d+$/;

        const validID = idInternoRegex.test(id_interno);
        
        if (!validID) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato del id_interno es inválido.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 5000,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
        
            });
        }

        const validAdress=addressRegex.test(calle);
        if (!validAdress) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato de calle inválido. No debe tener caracteres especiales.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
            });
        }
        // const loteRegex = /^\d{1,2}$/;
        const validLote=loteRegex.test(lote);
        if (!validLote) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato de lote inválido. No debe tener caracteres especiales ni cifras mayor a 2 digitos.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
            });
        }

        const existTerreno = await pool.query('SELECT * FROM land WHERE lote = ? AND manzana = ?', [lote, manzana]);

        if (existTerreno[0].length > 0) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Ya existe un terreno con el mismo lote y manzana. Por favor, verifique.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/',
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
            });
        }


        // const manzanaregex = /^[a-zA-Z0-9\s-]+$/;
        const validManzana=manzanaregex.test(manzana);
        if (!validManzana) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato de manzana inválido. No debe tener caracteres especiales.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
            });
        }

        // const dimensionesregex = /^\d+$/;

        const validDimensiones=dimensionesregex.test(superficie)
        if (!validDimensiones) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato de superficie / dimensiones inválido. Solo números.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
            });
        }

        // const precioRegex = /\b\d{1,3}(,\d{3})*(\.\d+)?\b/;
        const validPrecio=precioRegex.test(precio);
           if (!validPrecio) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato de precio inválido. Debe llevar comas y puntos ejemplo 1,000.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
            });
        }

        const existpredial = await pool.query('SELECT * FROM land WHERE predial = ?', predial);
        console.log(existpredial)
        if (existpredial[0].length > 0) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El número de predial ya existe. Por favor, verifique números",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
            });
        }

        // const predialregex = /^\d{3}-\d{3}-\d{3}-\d{3}$/;
        const validPredial=predialregex.test(predial);
               if (!validPredial) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato de predial inválido. Debe llevar separador (-)",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
            });
        }

        await pool.query('INSERT INTO land SET ?', { id_interno, calle, lote, manzana,superficie,precio: precioTerreno,predial,escritura,estado });
        
        res.render('terrenoAlta', {
            alert: true,
            alertTitle: "Registro",
            alertMessage: "¡Registro Exitoso",
            alertIcon: 'success',
            showConfirmButton: false,
            timer: 1500,
            ruta: '/', 
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
        });

    }
    if (req.session.rol == 'usuario') {
        const precioTerreno = parseFloat(precio.replace(',', ''));

        // Verificar si algún campo está vacío
        if (!id_interno || !calle || !lote || !manzana || !superficie || !precio || !predial || !escritura || !estado) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Debes rellenar todos los campos!",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 1500,
                ruta: '/', 
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,

            });
        }
        const existinid_interno = await pool.query('SELECT * FROM land WHERE id_interno = ?', id_interno);
        console.log(existinid_interno)
        if (existinid_interno[0].length > 0) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El id_interno ya existe. Por favor, verifique el id",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
            });
        }

        // const idInternoRegex = /^\d+(\.\d+)?(\/\d+)?$/;
        // const idInternoRegex = /^\d+\.\d+\/\d+$/;

        const validID = idInternoRegex.test(id_interno);
        
        if (!validID) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato del id_interno es inválido.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 5000,
                ruta: '/', 
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
        
            });
        }

        const validAdress=addressRegex.test(calle);
        if (!validAdress) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato de calle inválido. No debe tener caracteres especiales.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
            });
        }
        // const loteRegex = /^\d{1,2}$/;
        const validLote=loteRegex.test(lote);
        if (!validLote) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato de lote inválido. No debe tener caracteres especiales ni cifras mayor a 2 digitos.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
            });
        }
        const existTerreno = await pool.query('SELECT * FROM land WHERE lote = ? AND manzana = ?', [lote, manzana]);

        if (existTerreno[0].length > 0) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Ya existe un terreno con el mismo lote y manzana. Por favor, verifique.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/',
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
            });
        }


        // const manzanaregex = /^[a-zA-Z0-9\s-]+$/;
        const validManzana=manzanaregex.test(manzana);
        if (!validManzana) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato de manzana inválido. No debe tener caracteres especiales.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
            });
        }

        // const dimensionesregex = /^\d+$/;

        const validDimensiones=dimensionesregex.test(superficie)
        if (!validDimensiones) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato de superficie / dimensiones inválido. Solo números.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
            });
        }

        // const precioRegex = /\b\d{1,3}(,\d{3})*(\.\d+)?\b/;
        const validPrecio=precioRegex.test(precio);
           if (!validPrecio) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato de precio inválido. Debe llevar comas y puntos ejemplo 1,000.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
            });
        }

        const existpredial = await pool.query('SELECT * FROM land WHERE predial = ?', predial);
        console.log(existpredial)
        if (existpredial[0].length > 0) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El número de predial ya existe. Por favor, verifique números",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
            });
        }

        // const predialregex = /^\d{3}-\d{3}-\d{3}-\d{3}$/;
        const validPredial=predialregex.test(predial);
               if (!validPredial) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato de predial inválido. Debe llevar separador (-)",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
            });
        }

        await pool.query('INSERT INTO land SET ?', { id_interno, calle, lote, manzana,superficie,precio: precioTerreno,predial,escritura,estado });
        
        res.render('terrenoAlta', {
            alert: true,
            alertTitle: "Registro",
            alertMessage: "¡Registro Exitoso",
            alertIcon: 'success',
            showConfirmButton: false,
            timer: 1500,
            ruta: '/', 
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol,
        });

        
    }

    } catch (error) {
        console.error(error);
        // Manejar el error apropiadamente
        res.status(500).send('Error interno del servidor');
    }
}


export const editarTerrenos = async (req, res) => {
    const id = req.params.id;
    const [rows] = await pool.query('SELECT * FROM land WHERE id=?',[id]);

    if (req.session.rol == 'usuario') {
        const { id } = req.params;
        const {id_interno, calle, lote, manzana, superficie, precio, predial, escritura, estado } = req.body;
        
        const precioTerreno = parseFloat(precio.replace(',', ''));

        // Verificar si algún campo está vacío
        if (!id_interno || !calle || !lote || !manzana || !superficie || !precio || !predial || !escritura || !estado) {
            return res.render('terrenosEdit', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Debes rellenar todos los campos!",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 1500,
                ruta: '/', 
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
                terrenos: rows,
            });
        }

     const idInternoModificado = req.body.id_interno !== rows[0].id_interno;
     if (idInternoModificado) {
         // Validar formato de id_interno
         const validIdInterno = idInternoRegex.test(id_interno);
         if (!validIdInterno) {
              return res.render('terrenosEdit', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Debes rellenar todos los campos!",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 1500,
                ruta: '/', 
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
                terrenos: rows,
            });
         }

         const existinid_interno = await pool.query('SELECT * FROM land WHERE id_interno = ?', id_interno);
         if (existinid_interno[0].length > 0) {
             return res.render('terrenosEdit', {
                 alert: true,
                 alertTitle: "Error",
                 alertMessage: "El id_interno ya existe. Por favor, verifique el id",
                 alertIcon: 'error',
                 showConfirmButton: false,
                 timer: 3500,
                 ruta: '/', 
                 login: true,
                 roluser: false,
                 name: req.session.name,
                 rol: req.session.rol,
                 terrenos: rows,
             });
         }
     }

        const validAdress=addressRegex.test(calle);
        if (!validAdress) {
            return res.render('terrenosEdit', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato de calle inválido. No debe tener caracteres especiales.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
                terrenos: rows,
            });
        }

      
            // Verificar si el lote o la manzana han sido modificados
        const loteModificado = req.body.lote !== rows[0].lote;
        if (loteModificado) {
            const validLote=loteRegex.test(lote);
            if (!validLote) {
                return res.render('terrenosEdit', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "El formato de lote inválido. No debe tener caracteres especiales ni cifras mayor a 2 digitos.",
                    alertIcon: 'error',
                    showConfirmButton: false,
                    timer: 3500,
                    ruta: '/', 
                    login: true,
                    roluser: false,
                    name: req.session.name,
                    rol: req.session.rol,
                    terrenos: rows,
                });
            }
            
            
        }
        const manzanaModificada = req.body.manzana !== rows[0].manzana;
        if (manzanaModificada) {
            const validManzana=manzanaregex.test(manzana);
        if (!validManzana) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato de manzana inválido. No debe tener caracteres especiales.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
            });
        }
        const existTerreno = await pool.query('SELECT * FROM land WHERE lote = ? AND manzana = ?', [lote, manzana]);

// Realizar la validación solo si el lote o la manzana han sido modificados
        if (existTerreno[0].length > 0) {
            return res.render('terrenosEdit', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Ya existe un terreno con el mismo lote y manzana. Por favor, verifique.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
                terrenos: rows,
            });
        }

        }


     const validDimensiones=dimensionesregex.test(superficie)
     if (!validDimensiones) {
         return res.render('terrenosEdit', {
             alert: true,
             alertTitle: "Error",
             alertMessage: "El formato de superficie / dimensiones inválido. Solo números.",
             alertIcon: 'error',
             showConfirmButton: false,
             timer: 3500,
             ruta: '/', 
             login: true,
             roluser: false,
             name: req.session.name,
             rol: req.session.rol,
             terrenos: rows,
         });
     }
     const validPrecio = precioRegex.test(precio) && !isNaN(parseFloat(precio.replace(',', '')));
     if (!validPrecio) {
         return res.render('terrenosEdit', {
             alert: true,
             alertTitle: "Error",
             alertMessage: "El formato de precio inválido. Debe llevar comas y puntos ejemplo 1,000.",
             alertIcon: 'error',
             showConfirmButton: false,
             timer: 3500,
             ruta: '/', 
             login: true,
             roluser: false,
             name: req.session.name,
             rol: req.session.rol,
             terrenos: rows,
         });
     }
     
       // Agregar lógica para verificar si el id_interno ha sido modificado
       const predialModificado = req.body.predial !== rows[0].predial;
       if (predialModificado) {
         
           const validpredial = predialregex.test(predial);
           if (!validpredial) {
               return res.render('terrenosEdit', {
                   alert: true,
                   alertTitle: "Error",
                   alertMessage: "El formato de predial es inválido.",
                   alertIcon: 'error',
                   showConfirmButton: false,
                   timer: 3500,
                   ruta: '/', 
                   login: true,
                   roluser: false,
                   name: req.session.name,
                   rol: req.session.rol,
                   terrenos: rows,
               });
           }
  
           const existpredial = await pool.query('SELECT * FROM land WHERE predial = ?', predial);
           if (existpredial[0].length > 0) {
               return res.render('terrenosEdit', {
                   alert: true,
                   alertTitle: "Error",
                   alertMessage: "El predial ya existe. Por favor, verifique.",
                   alertIcon: 'error',
                   showConfirmButton: false,
                   timer: 3500,
                   ruta: '/', 
                   login: true,
                   roluser: false,
                   name: req.session.name,
                   rol: req.session.rol,
                   terrenos: rows,
               });
           }
       }

        const [result] = await pool.query('UPDATE land SET id_interno = ?, calle = ?, lote = ?, manzana = ?, superficie = ?, precio = ?, predial = ?, escritura = ?, estado = ? WHERE id = ?', [id_interno, calle, lote, manzana, superficie, precioTerreno, predial, escritura, estado, id]);
        
        // Si el id_interno no ha sido modificado o no existe en la base de datos, proceder con la actualización
        if (result && result.affectedRows > 0) {
            const [rows]=await pool.query('SELECT * FROM land');
            res.render('terrenos', {
                alert: true,
                alertTitle: "Actualización",
                alertMessage: "¡Actualización Exitoso",
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 1500,
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
                terrenos:rows,
                ruta:'terrenos'
            });


   }} else if (req.session.rol == 'admin') {
    const { id } = req.params;
        const {id_interno, calle, lote, manzana, superficie, precio, predial, escritura, estado } = req.body;
        
        const precioTerreno = parseFloat(precio.replace(',', ''));

        // Verificar si algún campo está vacío
        if (!id_interno || !calle || !lote || !manzana || !superficie || !precio || !predial || !escritura || !estado) {
            return res.render('terrenosEdit', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Debes rellenar todos los campos!",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 1500,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
                terrenos: rows,
            });
        }

       
     // Agregar lógica para verificar si el id_interno ha sido modificado
     const idInternoModificado = req.body.id_interno !== rows[0].id_interno;
     if (idInternoModificado) {
         // Validar formato de id_interno
         const validIdInterno = idInternoRegex.test(id_interno);
         if (!validIdInterno) {
             return res.render('terrenosEdit', {
                 alert: true,
                 alertTitle: "Error",
                 alertMessage: "El formato de id_interno es inválido.",
                 alertIcon: 'error',
                 showConfirmButton: false,
                 timer: 3500,
                 ruta: '/', 
                 login: true,
                 roluser: true,
                 name: req.session.name,
                 rol: req.session.rol,
                 terrenos: rows,
             });
         }

         const existinid_interno = await pool.query('SELECT * FROM land WHERE id_interno = ?', id_interno);
         if (existinid_interno[0].length > 0) {
             return res.render('terrenosEdit', {
                 alert: true,
                 alertTitle: "Error",
                 alertMessage: "El id_interno ya existe. Por favor, verifique el id",
                 alertIcon: 'error',
                 showConfirmButton: false,
                 timer: 3500,
                 ruta: '/', 
                 login: true,
                 roluser: true,
                 name: req.session.name,
                 rol: req.session.rol,
                 terrenos: rows,
             });
         }
     }

        const validAdress=addressRegex.test(calle);
        if (!validAdress) {
            return res.render('terrenosEdit', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato de calle inválido. No debe tener caracteres especiales.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
                terrenos: rows,
            });
        }

      
            // Verificar si el lote o la manzana han sido modificados
        const loteModificado = req.body.lote !== rows[0].lote;
        if (loteModificado) {
            const validLote=loteRegex.test(lote);
            if (!validLote) {
                return res.render('terrenosEdit', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "El formato de lote inválido. No debe tener caracteres especiales ni cifras mayor a 2 digitos.",
                    alertIcon: 'error',
                    showConfirmButton: false,
                    timer: 3500,
                    ruta: '/', 
                    login: true,
                    roluser: true,
                    name: req.session.name,
                    rol: req.session.rol,
                    terrenos: rows,
                });
            }
            
            
        }
        const manzanaModificada = req.body.manzana !== rows[0].manzana;
        if (manzanaModificada) {
            const validManzana=manzanaregex.test(manzana);
        if (!validManzana) {
            return res.render('terrenoAlta', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El formato de manzana inválido. No debe tener caracteres especiales.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
            });
        }
        const existTerreno = await pool.query('SELECT * FROM land WHERE lote = ? AND manzana = ?', [lote, manzana]);

// Realizar la validación solo si el lote o la manzana han sido modificados
if (existTerreno[0].length > 0) {
    return res.render('terrenosEdit', {
        alert: true,
        alertTitle: "Error",
        alertMessage: "Ya existe un terreno con el mismo lote y manzana. Por favor, verifique.",
        alertIcon: 'error',
        showConfirmButton: false,
        timer: 3500,
        ruta: '/', 
        login: true,
        roluser: true,
        name: req.session.name,
        rol: req.session.rol,
        terrenos: rows,
    });
}

        }

  



     const validDimensiones=dimensionesregex.test(superficie)
     if (!validDimensiones) {
         return res.render('terrenosEdit', {
             alert: true,
             alertTitle: "Error",
             alertMessage: "El formato de superficie / dimensiones inválido. Solo números.",
             alertIcon: 'error',
             showConfirmButton: false,
             timer: 3500,
             ruta: '/', 
             login: true,
             roluser: true,
             name: req.session.name,
             rol: req.session.rol,
             terrenos: rows,
         });
     }
     const validPrecio = precioRegex.test(precio) && !isNaN(parseFloat(precio.replace(',', '')));
     if (!validPrecio) {
         return res.render('terrenosEdit', {
             alert: true,
             alertTitle: "Error",
             alertMessage: "El formato de precio inválido. Debe llevar comas y puntos ejemplo 1,000.",
             alertIcon: 'error',
             showConfirmButton: false,
             timer: 3500,
             ruta: '/', 
             login: true,
             roluser: true,
             name: req.session.name,
             rol: req.session.rol,
             terrenos: rows,
         });
     }
     
       // Agregar lógica para verificar si el id_interno ha sido modificado
       const predialModificado = req.body.predial !== rows[0].predial;
       if (predialModificado) {
         
           const validpredial = predialregex.test(predial);
           if (!validpredial) {
               return res.render('terrenosEdit', {
                   alert: true,
                   alertTitle: "Error",
                   alertMessage: "El formato de predial es inválido.",
                   alertIcon: 'error',
                   showConfirmButton: false,
                   timer: 3500,
                   ruta: '/', 
                   login: true,
                   roluser: true,
                   name: req.session.name,
                   rol: req.session.rol,
                   terrenos: rows,
               });
           }
  
           const existpredial = await pool.query('SELECT * FROM land WHERE predial = ?', predial);
           if (existpredial[0].length > 0) {
               return res.render('terrenosEdit', {
                   alert: true,
                   alertTitle: "Error",
                   alertMessage: "El predial ya existe. Por favor, verifique.",
                   alertIcon: 'error',
                   showConfirmButton: false,
                   timer: 3500,
                   ruta: '/', 
                   login: true,
                   roluser: true,
                   name: req.session.name,
                   rol: req.session.rol,
                   terrenos: rows,
               });
           }
       }


       


        // const [result] = await pool.query('UPDATE land SET id_interno  = IFNULL (?, id_interno), calle = IFNULL (?, calle), lote = IFNULL (?, lote), manzana = IFNULL (?, manzana), superficie = IFNULL (?, superficie), precio= IFNULL (?, precio), predial= IFNULL (?, predial), escritura= IFNULL (?, escritura), estado= IFNULL (?, estado)  WHERE id = ?', [id_interno, calle, lote, manzana,superficie, precio, predial, escritura, estado, id]);

        const [result] = await pool.query('UPDATE land SET id_interno = ?, calle = ?, lote = ?, manzana = ?, superficie = ?, precio = ?, predial = ?, escritura = ?, estado = ? WHERE id = ?', [id_interno, calle, lote, manzana, superficie, precioTerreno, predial, escritura, estado, id]);
        
        // Si el id_interno no ha sido modificado o no existe en la base de datos, proceder con la actualización
        if (result && result.affectedRows > 0) {
            const [rows]=await pool.query('SELECT * FROM land');
            res.render('terrenos', {
                alert: true,
                alertTitle: "Actualización",
                alertMessage: "¡Actualización Exitoso",
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 1500,
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
                terrenos:rows,
                ruta:'terrenos'
            });
        }
   } 
}


// ELIMINAR TERRENO

export const eliminarTerreno = async (req, res) => {

    if (req.session.rol == 'admin') {
        const { id } = req.params;
        const [result]=await pool.query('DELETE FROM land WHERE id=?',[id])
    //otro if de si es mayor a 0?
    if (result && result.affectedRows > 0) {
        const [rows]=await pool.query('SELECT * FROM land');
    res.render('terrenos', {
        alert: true,
        alertTitle: "Eliminado",
        alertMessage: "¡Eliminado Exitoso",
        alertIcon: 'success',
        showConfirmButton: false,
        timer: 1500,
        login: true,
        roluser: true,
        name: req.session.name,
        rol: req.session.rol,
        terrenos:rows,
        ruta:'terrenos'
    });
} }else{
    // (error) 
    //     console.error(error);
        // Manejar el error apropiadamente
        res.status(500).send('Error interno del servidor');
    }
}


export const methods = {
    crearTerreno,
    editarTerrenos,
    eliminarTerreno,
  }


