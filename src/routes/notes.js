const { response, request } = require('express');
const express = require('express');
const router = express.Router();

//Modulo para crear notas falasas de ejemplo
const faker = require('faker');

//Modelo de notas de la bd
const Nota = require('../model/notas')
const { isAuthenticated } = require('../helpers/auth');
const notas = require('../model/notas');

router.get('/notes/search', isAuthenticated, (req, res)=>{
    res.render('notes/search-notes');
})

//Busqueda de notas para el formulario
router.post('/notes/search', isAuthenticated, async (req, res)=>{
    const search = req.body.search;
    if (search){
        // await Nota.find({user: req.user._id, $text:{$search: search, $caseSensitive: false }})
        await Nota.find({$text:{$search: search, $caseSensitive: false }})
        .sort({date: 'desc'})
        .exec((err, notes)=>{
            // console.log(notes);
            res.render('notes/search-notes',
            {
                notes,
                search
            }//render
            );//exec
        });
    }//if
})//fin del post

router.get('/notes/add', isAuthenticated, function(request, response){
    response.render('notes/new-note');
});

router.get('/notas', isAuthenticated, async function(request, response){
    // console.log(request.user)
    // response.send('Notas de la base de datos');
    const notas = await Nota.find({usuario: request.user._id}).sort({fecha: 'desc'});
        // console.log(notas);
        // response.render('notes/consultar-notas', {notas});
        response.redirect('/notes/1')
})//Fin del modelo obtenre notas

router.post('/notes/editar-nota/:id', isAuthenticated, async function(request, response){
    const {titulo, descripcion} = request.body;
    await Nota.findByIdAndUpdate(request.params.id, {titulo, descripcion})
    response.redirect('/notes');
});

//ruta para guardar una nota en la bd
router.post('/notes/new-note', isAuthenticated,async function(request, response){
    //request.body contiene los datos al servidor
    //console.log(request.body);
    const {titulo, descripcion, precio, imagen} = request.body;
    const errores = [];
    
    if(!titulo){
        errores.push({text: 'Por favor ingresa un titulo para el producto.'});
    }

    if(!descripcion){
        errores.push({text: 'Por favor ingresa una descripción para el producto.'});
    }

    if(!precio){
        errores.push({text: 'Por favor ingresa el precio del producto.'});
    }

    if(!imagen){
        errores.push({text: 'Por favor ingresa la imagen de referencia del producto.'});
    }

    if (errores.length > 0){
        response.render('notes/new-note', {
            errores,
            titulo,
            descripcion,
            precio,
            imagen
        });
    }else {
        const nuevaNota = new Nota({titulo, descripcion, precio, imagen});
        nuevaNota.usuario = request.user._id;
        await nuevaNota.save()//Guarda la nota de manera async
            .then( ()=>{
                request.flash('success_msg', 'Producto guardado correctamente.');
                response.redirect('/notas');
            })
            .catch((err)=>{
                // console.log(err);
                response.redirect('/error');
            })
        // console.log(nuevaNota);
        // response.send('ok');
    }
});

//editar una nota
router.get('/notes/edit:id', isAuthenticated, async (req, res) =>{
    // res.render('notes/editar-nota');
    try{
        var _id = req.params.id;
        var len = req.params.id.length;
        _id = _id.substring(1,len); //Extrae una sub cadena de la posicion 1 del id porque la posicion 0 son los : que se eliminan
        const nota = await Nota.findById(_id);
        _id = nota._id;
        titulo = nota.titulo;
        descripcion = nota.descripcion;
        precio = nota.precio;
        res.render('notes/editar-nota', {titulo,descripcion,_id,precio});
    }catch(err){
        console.log(error)
        res.redirect('/error');
    }
});//Fin de editar las notas

//Para guardar una nota editada
router.put('/notes/editar-nota/:id', isAuthenticated, async function(req, res){
    //request.body contiene los datos al servidor
    //console.log(request.body);
    // var _id = req.params.id;
    // var len = req.params.id.length;
    // _id = _id.substring(1,len); //Extrae una sub cadena de la posicion 1 del id porque la posicion 0 son los : que se eliminan
    
    const {titulo, descripcion, precio} = req.body;
    const _id = req.params.id;
    const errores = [];
    
    if(!titulo){
        errores.push({text: 'Por favor inserte el titulo'});
    }
    if(!descripcion){
        errores.push({text: 'Por favor ingrese la descripcion'});
    }
    if(!precio){
        errores.push({text: 'Por favor ingrese el precio'});
    }
    

    if (errores.length > 0){
        res.render('notes/editar-nota', {
            errores,
            titulo,
            descripcion,
            _id,
            precio
        });
    }else {
        await Nota.findByIdAndUpdate(_id, {titulo, descripcion, precio})//Guarda la nota de manera async
            .then( ()=>{
                req.flash('success_msg', 'Nota actualizada correctamente');
                res.redirect('/notas');
            })
            .catch((err)=>{
                console.log(err);
                res.redirect('/error');
            })
        // console.log(nuevaNota);
        // response.send('ok');
    }
});

// Borrar una notas
router.get('/notes/delete:id', isAuthenticated, async function(request, response){
    try {
        var _id = request.params.id;
        var len = request.params.id.length;

        _id = _id.substring(1, len);

        await Nota.findByIdAndDelete(_id);
        request.flash('success_msg', 'se elimino la nota')
        response.redirect('/notas/');
    } catch (err) {
        response.send(404);
    }
});

router.get('/generate-fake-data', isAuthenticated, async (req, res) =>{
    for(let i=0; i < 30; i++){
        const newNote = new Nota();

        newNote.usuario = req.user._id;

        newNote.titulo = faker.random.word();
        newNote.descripcion = faker.random.words();
        await newNote.save();    
    }

    res.redirect('/notas')
});

// router.get('/notes/:page', isAuthenticated, async (req, res) => {
//     let perPage=6;

//     let page = req.params.page || 1;

//     let numNota = (perPage * page) - perPage; 

//     await Nota.find({usuario: req.user._id})
//     .lean()
//     .sort({date: 'desc'})
//     .skip(numNota)
//     .limit(this.perPage)
//     .exec( (err, notas) =>{
//         Nota.countDocuments ({usuario: req.user._id}, (err, total) =>{
//             if(err)
//                 return next(err);
//             if(total == 0)
//                 pages = null;
//             else
//                 pages = Math.ceil( total/perPage);

//             res.render('notes/consultar-notas', {
//                 notas,
//                 current: page,
//                 pages: pages
//             });
//         });
//     });
// });
router.get('/notes/:page', isAuthenticated, async (request, response) => {
    // Variable que nos indica cuántas notas por página deseamos
    let perPage = 6;

    // Variable que nos indica qué número de página esta solicitando el usuario, por default se envía la página 1
    let page = request.params.page || 1;

    // Variable que nos indica a partir de cuál nota se mostrará
    let numNota = (perPage * page) - perPage;

    // Variable para el tipo de usuario
    let tipo_usuario = request.user.type;

    // Nota.find({usuario: request.user._id})
    Nota.find()
        .lean()
        .sort({date: 'desc'})
        .skip(numNota)
        .limit(perPage)
        .exec((err, notas) => {
            // Nota.countDocuments({usuario: request.user._id}, (err, total) => {
            Nota.countDocuments((err, total) => {
                if(err)
                    return next(err);
                if(total == 0)  // Si no hay notas en la BD
                    pages = null;
                else
                    pages = Math.ceil(total / perPage);

                // console.log(tipo_usuario);
                response.render('notes/consultar-notas', {
                    notas,
                    current: page,
                    pages: pages,
                    tipo_usuario
                });
            })
        });
})

module.exports = router;