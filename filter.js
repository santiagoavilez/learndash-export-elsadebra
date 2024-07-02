const fs = require('fs-extra');
const readlineSync = require('readline-sync');

// Nombre del archivo de entrada y salida
const inputFile = 'user_activity.ld';
const outputFile = 'user_activity_filtered.ld';

// Función para leer el archivo JSON
async function readJSONFile(filename) {
    try {
        const data = await fs.readFile(filename, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error al leer el archivo ${filename}: ${err}`);
        throw err;
    }
}

// Función para escribir el archivo JSON filtrado
async function writeFilteredJSON(filename, data) {
    try {
        await fs.writeFile(filename, JSON.stringify(data, null, 2));
        console.log(`Se escribió el archivo ${filename} correctamente.`);
    } catch (err) {
        console.error(`Error al escribir el archivo ${filename}: ${err}`);
        throw err;
    }
}

// Función principal para filtrar el archivo JSON
// async function filterJSON() {
//     try {
//         const jsonData = await readJSONFile(inputFile);
//         const filteredData = jsonData.filter(obj => obj.course_id === "1073");
//         await writeFilteredJSON(outputFile, filteredData);
//     } catch (err) {
//         console.error('Ocurrió un error durante el filtrado del archivo JSON:', err);
//     }
// }

// // Ejecutar la función principal
// filterJSON();

async function filterJSON() {
    try {
        const data = await fs.readFile(inputFile, 'utf8');
        const lines = data.split('\n').filter(line => line.trim() !== ''); // Dividir por líneas y eliminar líneas vacías
        const objects = lines.map(line => JSON.parse(line)); // Convertir cada línea en un objeto JSON

        const filteredData = objects.filter(obj => obj.course_id === "1073");

        await fs.writeFile(outputFile, filteredData.map(obj => JSON.stringify(obj)).join('\n'));

        console.log(`Se escribió el archivo ${outputFile} correctamente.`);
    } catch (err) {
        console.error(`Ocurrió un error durante el filtrado del archivo JSON: ${err}`);
    }
}

filterJSON();