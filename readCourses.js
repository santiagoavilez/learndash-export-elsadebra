import fsExtra from "fs-extra";
import filterUsersByCourseId from "./filterUsersByCourseId.js";

const inputFile = 'src/post_type_course.ld';

const readCourses = async() => {
    try {
        const data = await fsExtra.readFile(inputFile, 'utf8');
        const lines = data.split('\n').filter(line => line.trim() !== ''); // Dividir por líneas y eliminar líneas vacías
        const objects = lines.map(line => JSON.parse(line)); // Convertir cada línea en un 
        console.log(`Se encontraron ${objects.length} cursos en el archivo JSON`);
        return objects;
    }
    catch (err) {
        console.error(`Ocurrió un error durante el filtrado del archivo JSON: ${err}`);
        return err;
    }
}

readCourses().then((data)=>{
    console.log(`Se encontraron ${data.length} cursos en el archivo JSON`);
    console.log(data);
    data.map((course)=> filterUsersByCourseId(course.wp_post.ID).then((users)=>console.log(`Curso ${course.wp_post.ID} tiene ${users.length} usuarios`)).catch(console.error));

}).catch(console.error);

export default readCourses;