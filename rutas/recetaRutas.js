const express = require('express');
const rutas = express.Router();
const RecetaModel = require('../models/Receta');
const UsuarioModel = require('../models/Usuario');

//endpoint 1 traer todas las recetas
rutas.get('/getRecetas', async (req, res) => {
    try  {
        const receta = await  RecetaModel.find();
        res.json(receta);
    } catch (error){
        res.status(500).json({mensaje: error.message});
    }
});

//endpoint 2. Crear
rutas.post('/crear', async (req, res) => {
    const receta = new RecetaModel({
        nombre: req.body.nombre,
        ingredientes: req.body.ingredientes,
        porciones: req.body.porciones,
        usuario: req.body.usuario // asignar el id de usuario
    })
    try {
        const nuevaReceta = await receta.save();
        res.status(201).json(nuevaReceta);
    } catch (error) {
        res.status(400).json({ mensaje :  error.message})
    }
});

//endpoint 3. Editar
rutas.put('/editar/:id', async (req, res) => {
    try {
        const recetaEditada = await RecetaModel.findByIdAndUpdate(req.params.id, req.body, { new : true });
        if (!recetaEditada)
            return res.status(404).json({ mensaje : 'Receta no encontrada!!!'});
        else
            return res.json(recetaEditada);

    } catch (error) {
        res.status(400).json({ mensaje :  error.message})
    }
})


//ENDPOINT 4. eliminar
rutas.delete('/eliminar/:id',async (req, res) => {
    try {
       const recetaEliminada = await RecetaModel.findByIdAndDelete(req.params.id);
       if (!recetaEliminada)
            return res.status(404).json({ mensaje : 'Receta no encontrada!!!'});
       else 
            return res.json({mensaje :  'Receta eliminada'});    
       } 
    catch (error) {
        res.status(500).json({ mensaje :  error.message})
    }
});

// - 5. obtener una receta por su ID
rutas.get('/receta/:id', async (req, res) => {
    try {
        const receta = await RecetaModel.findById(req.params.id);
        if (!receta)
            return res.status(404).json({ mensaje : 'Receta no encontrada!!!'});
        else 
            return res.json(receta);
    } catch(error) {
        res.status(500).json({ mensaje :  error.message})
    }
});
// - obtener recetas por un ingrediente especifico
rutas.get('/recetaPorIngrediente/:ingrediente', async (req, res) => {
    try {
        const recetaIngrediente = await RecetaModel.find({ ingrediente: req.params.ingrediente});
        return res.json(recetaIngrediente);
    } catch(error) {
        res.status(500).json({ mensaje :  error.message})
    }
});

rutas.get('/recetaPorIngrediente2/:ingrediente', async (req, res) => {
    try {
        const ingredienteBuscado = req.params.ingrediente.toLowerCase(); // Convertir el ingrediente a minúsculas para una búsqueda insensible a mayúsculas
        const recetas = await RecetaModel.find({ ingredientes: { $regex: ingredienteBuscado, $options: 'i' }});
        // Utilizar una expresión regular para buscar el ingrediente dentro de la lista de ingredientes de cada receta, con la opción 'i' para insensible a mayúsculas y minúsculas
        if (recetas.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron recetas con ese ingrediente.' });
        }
        return res.json(recetas);
    } catch(error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// - eliminar todas las recetas
rutas.delete('/eliminarTodos', async (req, res) => {
    try {
        await RecetaModel.deleteMany({});
        return res.json({mensaje: "Todas las recetas han sido eliminadas"});
    } catch(error) {
        res.status(500).json({ mensaje :  error.message})
    }
});

// - contar el numero total de recetas
rutas.get('/totalRecetas', async (req, res) => {
    try {
        const total = await RecetaModel.countDocuments();
        return res.json({totalReceta: total });
    } catch(error) {
        res.status(500).json({ mensaje :  error.message})
    }
});

// - obtener recetas ordenadas por nombre ascendente
// query.sort({ field: 'asc', test: -1 });
rutas.get('/ordenarRecetas', async (req, res) => {
    try {
       const recetasOrdenadas = await RecetaModel.find().sort({ nombre: -1});
       res.status(200).json(recetasOrdenadas);
    } catch(error) {
        res.status(500).json({ mensaje :  error.message})
    }
});

//REPORTES 1
rutas.get('/recetaPorUsuario/:usuarioId', async (peticion, respuesta) =>{
    const {usuarioId} = peticion.params;
    console.log(usuarioId);
    try{
        const usuario = await UsuarioModel.findById(usuarioId);
        if (!usuario)
            return respuesta.status(404).json({mensaje: 'usuario no encontrado'});
        const recetas = await RecetaModel.find({ usuario: usuarioId}).populate('usuario');
        respuesta.json(recetas);

    } catch(error){
        respuesta.status(500).json({ mensaje :  error.message})
    }
})

//REPORTES 2
//sumar porciones de recetas por Usuarios
rutas.get('/porcionPorUsuario', async (req, res) => {
    try {   
        const usuarios = await UsuarioModel.find();
        const reporte = await Promise.all(
            usuarios.map( async ( usuario1 ) => {
                const recetas = await RecetaModel.find({ usuario: usuario1._id});
                const totalPorciones = recetas.reduce((sum, receta) => sum + receta.porciones, 0);
                return {
                    usuario: {
                        _id: usuario1._id,
                        nombreusuario: usuario1.nombreusuario
                    },
                    totalPorciones,
                    recetas: recetas.map( r => ( {
                        _id: r._id,
                        nombre: r.nombre,
                        porciones: r.porciones
                    }))
                }
            } )
        )
        res.json(reporte);
    } catch (error){
        res.status(500).json({ mensaje :  error.message})
    }
})


module.exports = rutas;



