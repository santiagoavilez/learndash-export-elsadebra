const fs = require('fs');
const readline = require('readline');
const path = require('path');

const inputFile = 'user.ld';
const outputDir = 'output_users';
const entriesPerFile = 150; // Número de entradas por archivo
const configFilePath = 'configuration.ld'; // Archivo de configuración

// Crear directorio para los archivos de salida si no existe
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

async function filterAndSplitUsers() {
    try {
        const entries = [];

        // Leer el archivo línea por línea
        const rl = readline.createInterface({
            input: fs.createReadStream(inputFile),
            crlfDelay: Infinity
        });

        for await (const line of rl) {
            try {
                const entry = JSON.parse(line);
                // Filtrar usuarios con 'course_1073_access_from'
                if (entry.wp_user_meta && entry.wp_user_meta.course_1073_access_from) {
                    entries.push(entry);
                }
            } catch (error) {
                console.error(`Error parsing line: ${line}`, error);
            }
        }

        // Ordenar los entries por 'user_login'
        entries.sort((a, b) => a.wp_user.user_login.localeCompare(b.wp_user.user_login));

        // Dividir en partes y escribir en archivos
        for (let i = 0; i < entries.length; i += entriesPerFile) {
            const part = entries.slice(i, i + entriesPerFile);
            const partDir = `${outputDir}/part_${Math.floor(i / entriesPerFile) + 1}`;

            // Crear la carpeta para cada parte
            if (!fs.existsSync(partDir)) {
                fs.mkdirSync(partDir);
            }

            // Crear carpeta 'configuration' dentro de cada parte y copiar el archivo de configuración
            const configPartDir = path.join(partDir, 'configuration');
            if (!fs.existsSync(configPartDir)) {
                fs.mkdirSync(configPartDir);
            }
            fs.copyFileSync(configFilePath, path.join(configPartDir, 'configuration.ld'));

            // Escribir el archivo user.ld para cada parte
            const userFileName = path.join(partDir, `user_part_${Math.floor(i / entriesPerFile) + 1}.ld`);
            fs.writeFileSync(userFileName, part.map(entry => JSON.stringify(entry)).join('\n'));
            console.log(`Written ${part.length} entries to ${userFileName}`);
        }

        console.log('Filtering, splitting, and copying complete.');
    } catch (error) {
        console.error('Error processing the file:', error);
    }
}

filterAndSplitUsers();
