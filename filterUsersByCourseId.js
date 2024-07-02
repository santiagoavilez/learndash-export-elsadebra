import fsExtra from "fs-extra";

const usersFile = 'src/user.ld';


const filterUsersByCourseId = async(courseId) => {

    try {
        const data = await fsExtra.readFile(usersFile, 'utf8');
        const lines = data.split('\n').filter(line => line.trim() !== ''); // Dividir por líneas y eliminar líneas vacías
        const objects = lines.map(line => JSON.parse(line)); // Convertir cada línea en un 
        const keyfilter = `course_${courseId}_access_from`;
        const filteredusers = objects.filter(obj => obj?.wp_user_meta[keyfilter] !== undefined);

        console.log(`Se encontraron ${objects.length} usuarios en el archivo JSON`);
        console.log(`Se filtraron ${filteredusers.length} usuarios en el archivo con el courseId ${courseId}`);

        return filteredusers;
    }
    catch (err) {
        console.error(`Ocurrió un error durante el filtrado del archivo JSON: ${err}`);
        return err;
    }
}

filterUsersByCourseId('21042').then((data)=>console.log('data', data.length)).catch(console.error);

export default filterUsersByCourseId;