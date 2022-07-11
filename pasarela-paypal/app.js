import express from 'express';
import cors from 'cors';
import request from 'request'; 

const app = express();             //se usa para inicializar la app de express
app.use (cors()) 

//Credenciales de paypal

const CLIENT= 'AUpdQx6K26S3ogZMHZ2dRXyKFFjD40mu6qnRa9dcHkJm4EJaC9mk0XoXRpNEhmwiaov4Wp30ZGetv0pu' ;
const SECRET= 'EKVQqV1gO2qlcrruS9xvs8Yr14zSEka0sngzTT2Ev53IjUg7stTvq_wpHVvmTrUfrhBXRyfEFeKajfe2' ;
const PAYPAL_API = 'https://api-m.sandbox.paypal.com';    //Live https://api-m.paypal.com
const auth= {user:CLIENT, pass:SECRET}

//Establecemos los controladores a utilizar

//crear orden de pago:
const createPayment = (req, res) => {
  
    const body = {
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: 'EUR', //https://developer.paypal.com/docs/api/reference/currency-codes/
                value: '115'
            }
        }],
        application_context: {
            brand_name: `MiTienda.com`,
            landing_page: 'NO_PREFERENCE', // Default, para mas informacion https://developer.paypal.com/docs/api/orders/v2/#definition-order_application_context
            user_action: 'PAY_NOW', // Accion para que en paypal muestre el monto del pago
            //paginas a donde nos va a redirigir dependiendo del comportamiento:
            return_url: `http://localhost:3000/execute-payment`, // Url despues de realizar el pago
            cancel_url: `http://localhost:3000/cancel-payment` // Url despues de realizar el pago
        }
    }

    //utilizamos el request porque nuestor controlador va a hacer una peticiona  la API de Paypal  
   //https://api-m.sandbox.paypal.com/v2/checkout/orders [POST]
    request.post(`${PAYPAL_API}/v2/checkout/orders`, {            
        auth,  //por el lado del header va a necesitar una autenticacion que ya la hemos establecido
        body,  // por aqui vamos a pasar el objeto del body que acabamos de explicar
        json: true   //y esto se usa para decirle que nos devuelva la respuesta en formato json
    }, (err, response) => {
        res.json({ data: response.body })
    })
}

   //Funcion para capturar el dinero
const executePayment = (req, res) => {
    const token = req.query.token; //<-----------

    request.post(`${PAYPAL_API}/v2/checkout/orders/${token}/capture`, {
        auth,
        body: {},
        json: true
    }, (err, response) => {
        res.json({ data: response.body })
    })
}

/**
 * Creamos Ruta para generar pagina de CHECKOUT
 */

//    http://localhost:3000/create-payment [POST]    <------ para acceder a la ruta en postman
app.post(`/create-payment`, createPayment)


/**
 * Creamos Ruta para que luego de que el cliente completa el checkout 
 * capturemos el dinero!
 */

app.get(`/execute-payment`, executePayment)


app.listen(3000, () => {
    console.log(`Comenzemos a generar dinero --> http://localhost:3000`);
})