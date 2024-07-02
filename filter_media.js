const fs = require('fs');
const readline = require('readline');
const path = require('path');

// Variables de configuración
const inputFile = 'media.ld';
const mediaDir = path.join(__dirname, 'media'); // Ruta a la carpeta de medios
const outputDir = 'output_parts_media';
const entriesPerFile = 5;  // Número de entradas por archivo
const configurationContent = `{"post_types":["sfwd-courses","sfwd-lessons","sfwd-topic","sfwd-quiz","sfwd-question","groups"],"post_type_settings":["sfwd-courses","sfwd-lessons","sfwd-topic","sfwd-quiz","sfwd-question","groups"],"users":["profiles","progress"],"other":[],"info":{"ld_version":"4.9.1","wp_version":"6.5.3","db_prefix":"w47fa_","is_multisite":false,"blog_id":1,"home_url":"https://elsadebra.com"}}`;

// Crear directorio para los archivos de salida si no existe
if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir);
}

async function sortAndSplitJSON() {
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
                entries.push(entry);
            } catch (error) {
                console.error(`Error parsing line: ${line}`, error);
            }
        }

        // Ordenar los entries por 'filename'
        entries.sort((a, b) => a.filename.localeCompare(b.filename));

        // Dividir en partes y escribir en archivos
        for (let i = 0; i < entries.length; i += entriesPerFile) {
            const part = entries.slice(i, i + entriesPerFile);
            const partIndex = Math.floor(i / entriesPerFile) + 1;
            const partDir = `${outputDir}/part_${partIndex}`;

            // Crear la carpeta para cada parte
            if (!fs.existsSync(partDir)) {
                fs.mkdirSync(partDir);
            }

            // Crear carpeta 'media' dentro de cada parte
            const mediaPartDir = path.join(partDir, 'media');
            if (!fs.existsSync(mediaPartDir)) {
                fs.mkdirSync(mediaPartDir);
            }

            // Escribir el archivo configuration.ld (contenido estático)
            const configFileName = path.join(partDir, 'configuration.ld');
            fs.writeFileSync(configFileName, configurationContent);
            console.log(`Written configuration to ${configFileName}`);

            // Escribir el archivo media.ld
            const mediaFileName = path.join(partDir, 'media.ld');
            fs.writeFileSync(mediaFileName, part.map(entry => JSON.stringify(entry)).join('\n'));
            console.log(`Written ${part.length} entries to ${mediaFileName}`);

            // Copiar los archivos multimedia correspondientes
            part.forEach((entry,i )=> {
                const sourceFile = path.join(mediaDir, entry.filename);
                const destFile = path.join(mediaPartDir, entry.filename);

                if (fs.existsSync(sourceFile)) {
                    fs.copyFileSync(sourceFile, destFile);
                    console.log(`Copied n-${i+1} ${entry.filename} to ${destFile}`);
                } else {
                    console.error(`File ${entry.filename} does not exist in ${mediaDir}`);
                }
            });
        }

        console.log('Sorting, splitting, and copying complete.');
    } catch (error) {
        console.error('Error processing the file:', error);
    }
}

sortAndSplitJSON();
