import XLSX from 'xlsx';
import ProductManager from '../dao/db-managers/ProductManager.js'
import productModel from '../dao/models/product.model.js'

// el unico proposito de este js es importar mi base de datos de productos a mongoDB si por error los elimino. 
// ejecuto el comando node importInfo.js


const productManager = new ProductManager();
const { read, writeXLSX } = XLSX

function readExcel(dir) {
    const workbook = XLSX.readFile(dir);
    const workbookSheets = workbook.SheetNames;
    // console.log("workbookSheets", workbookSheets); // Muestra las hoja del excel -- mostraria  [ 'Hoja1' ]
    const sheet = workbookSheets[0]; // Selecciono la Hoja posicion 0 .. selecciona  [ 'Hoja1' ]
    const dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);  // Obtengo la informacion de mi excel en un array de objetos json
    return dataExcel
    // console.log("dataExcel",dataExcel);
}

const baseProducts = readExcel('productsLocal.xlsx'); // Guardo mi Array con productos para importar a Mongo


await productModel.deleteMany({});  // Borro todos mis productos para dejar mi collections "Products" limpia. 

// Subo los productos a mi base de datos MongoDB
baseProducts.forEach(async element =>
    productManager.addProduct(element.title, element.description, element.code, element.price, element.status, element.stock, element.category, element.thumbnail, element.owner)
    );

