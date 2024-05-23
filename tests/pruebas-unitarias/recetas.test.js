const express = require('express');
const request = require('supertest');
const recetaRutas = require('../../rutas/recetaRutas');
const RecetaModel = require('../../models/Receta');
const mongoose  = require('mongoose');
const app = express();
app.use(express.json());
app.use('/recetarios', recetaRutas);

describe('Pruebas Unitarias para Recetas', () => {
    //se ejecuta antes de iniciar las pruebas
    beforeEach(async () => {
        await mongoose.connect('mongodb://127.0.0.1:27017/apprecetas',{
            useNewUrlParser : true,            
        });
        await RecetaModel.deleteMany({});
    });
    // al finalziar las pruebas
    afterAll(() => {
        return mongoose.connection.close();
      });

    //1er test : GET
    test('Deberia Traer todas las recetas metodo: GET: getRecetas', async() =>{
        await RecetaModel.create({ nombre: 'Pie de Limon', ingredientes: 'limon, harina, crema de leche', porciones: 15 });
        await RecetaModel.create({ nombre: 'Pie de Manzana', ingredientes: 'manzana, harina, crema de leche', porciones: 25 });
        // solicitud - request
        const res =  await request(app).get('/recetarios/getRecetas');
        //verificar la respuesta
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveLength(2);
    }, 10000);

    test('Deberia agregar una nueva Receta: POST: /crear', async() => {
        const nuevaReceta = {
            nombre: 'Torta Helada', 
            ingredientes: 'huevo, harina, crema de leche, leche, azucar', 
            porciones: 10 
        };
        const res =  await request(app)
                            .post('/recetarios/crear')
                            .send(nuevaReceta);
        expect(res.statusCode).toEqual(201);
        expect(res.body.nombre).toEqual(nuevaReceta.nombre);
    });

    test('Deberia actualizar una tarea que ya existe: PUT /editar/:id', async()=>{
        const recetaCreada = await RecetaModel.create(
                                  { nombre: 'Pie de Limon', 
                                    ingredientes: 'limon, harina, crema de leche', 
                                    porciones: 15 });
        const recetaActualizar = {
            nombre: 'Pie de Limon (editado)',
            ingredientes: 'limon, harina, crema de leche (editado)',
            porciones: 28
        };
        const res =  await request(app)
                            .put('/recetarios/editar/'+recetaCreada._id)
                            .send(recetaActualizar);
        expect(res.statusCode).toEqual(201);
        expect(res.body.nombre).toEqual(recetaActualizar.nombre);                   

    });
   
    test('Deberia eliminar una tarea existente : DELETE /eliminar/:id', async() =>{
        const recetaCreada = await RecetaModel.create(
            { nombre: 'Pie de Limon', 
              ingredientes: 'limon, harina, crema de leche', 
              porciones: 15 });

        const res =  await request(app)
                                .delete('/recetarios/eliminar/'+recetaCreada._id);
        
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({mensaje :  'Receta eliminada'});
    });
});
