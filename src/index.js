const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars')
const { engine } = require('express-handlebars');//handledbars
const methodOverride = require('method-override');//metods put delete http
const session = require('express-session');//guardar las sesiones
const flash = require('connect-flash');//libreria para mensajes
const passport = require('passport');

//Inicializaciones
const app = express();
require('./database');
require('./config/passport');

//Configuraciones
app.set('puerto', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views')); //dirname es para que corra en cualquier sistema operativo ya sea / o \
app.engine('.hbs', engine({
    defaultLayout: 'main',
    defaultDir: path.join('views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials'),
    extname: 'hbs',
    runtimeOptions: {
        allowProtoMethodsByDefault: true,
        allowProtoPropertiesByDefault: true
    },
    helpers: {
        equal: function(lvalue, rvalue, options) {
            if(lvalue != rvalue)
                return options.inverse(this);
            else
                return options.fn(this);
        },
        for: function(current, pages, options) {
            current: Number(current);
            pages: Number(pages);

            var code = '';

            // Inicializamos la variable i con la paginación inicial
            // Si i > 3 le restamos 2 y si no es mayor a 3 la inicializamos en 1
            var i = current > 3 ? current - 2 : 1;

            // Si el indice i es mayor a 1 es porque queremos renderizar solo algunas páginas
            if(i !== 1){
                let last = i - 1;

                code += '<li class="page-item mr-1">'
                    + '<a href="/notes/' + last + '" class="page-link">...</a>'
                    + '</li>'
            }

            for(; i < (current + 3) && i <= pages; ++i){
                if(i == current){
                    code += '<li class="page-item active mr-1">'
                        + '<a href="' + i + '" class="page-link">' + i + '</a>'
                        + '</li>'
                } else {
                    code += '<li class="page-item mr-1">'
                        + '<a href="/notes/' + i +'" class="page-link">' + i + '</a>'
                        + '</li>'
                }

                // Si hay más páginas que mostrar incluimos después del for
                // puntos suspensivos para indicar que hay más páginas antes del final
                if(i == (current + 2) && i < pages){
                    let last = i + 1;

                    code += '<li class="page-item mr-1">'
                        + '<a href="/notes/' + last +'" class="page-link">...</a>'
                        + '</li>'
                }
            }

            return options.fn(code);
        }
    }
},)
);

app.set('view engine', 'hbs');
//Middleware
app.use(express.urlencoded({extended:false}));
app.use(methodOverride('_method'));//put, delete, get
app.use(session({
    secret: 'mysecretapp',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

//Variables Globales
app.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.usuario = req.user || null;

    next(); //Sirve para enviar mensajes y ejecutar el siguiente codigo
    
})
//Rutas
app.use(require('./routes/index'));
app.use(require('./routes/notes'));
app.use(require('./routes/users'));

//Archivos estaticos
app.use(express.static(path.join(__dirname, 'public')));

//Servidor
app.listen(app.get('puerto'), function(){
    console.log('Servicio corriendo en el puerto:' +app.get('puerto'));
});

