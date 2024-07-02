
const fs = require('fs');
const axios = require('axios');

// Configuración
const wpBaseUrl = process.env.WORDPRESS_SITE_URL; // URL base de la API REST de WordPress
const courseId = parseInt(process.env.LEARNDASH_COURSE_ID);  // ID del curso que deseas agregar
const wpUser = process.env.WORDPRESS_ADMIN_USER; // Usuario de WordPress
const wpPassword = process.env.WORDPRESS_APP_PASSWORD; // Contraseña de WordPress
// Leer usuarios del archivo

const courseFile = 'src/post_type_course.ld';

const usersFile = 'src/user.ld';

const usersData = fs.readFileSync(usersFile, 'utf-8').split('\n').filter(Boolean);
const users = usersData.map(JSON.parse);

// Archivo de salida para registrar los cambios
const outputFile = 'user_update_log.txt';

// Borrar el archivo de salida existente
if (fs.existsSync(outputFile)) {
    fs.unlinkSync(outputFile);
}

// Función para obtener un usuario por correo electrónico
async function getUserByEmail(email) {
    try {
        const response = await axios.get(`${wpBaseUrl}/wp/v2/users`, {
            auth: {
                username: wpUser,
                password: wpPassword
            },
             params:{
                 search: email
             }
        });
        if(response.data){
            return response.data[0]
        }
        else  return null
    } catch (error) {
        console.error(`Error fetching user by email ${email}`, error);
        return null;
    }
}

// Función para verificar la inscripción en el curso
async function checkUserEnrollment(userId) {
    try {
        const response = await axios.get(
            `${wpBaseUrl}/ldlms/v2/users/${userId}/courses`,
            {
                auth: {
                    username: wpUser,
                    password: wpPassword
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error(`Error checking enrollment for user ID ${userId}`, error);
        return [];
    }
}

// Función para inscribir al usuario en el curso
async function enrollUserInCourse(userId, courseId) {
    try {
        const response = await axios.post(
            `${wpBaseUrl}/ldlms/v2/users/${userId}/courses`,
            { course_ids: [courseId] },
            {
                auth: {
                    username: wpUser,
                    password: wpPassword
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error(`Error enrolling user ID ${userId} in course ${courseId}`, error);
        return null;
    }
}

// Función principal para actualizar los usuarios
async function updateUsers() {
    for (const user of users) {
        const email = user.wp_user.user_email;

        // Buscar usuario por email
        const wpUser = await getUserByEmail(email);

        if (!wpUser) {
            console.log(`User with email ${email} not found.`);
            fs.appendFileSync(outputFile, `User with email ${email} not found.\n`);
            continue;
        }

        const userId = wpUser.id;
        if(userId){


        // Verificar si el usuario está inscrito en el curso
        const enrolledCourses = await checkUserEnrollment(userId);

        if (!enrolledCourses.some(course => course.id === courseId)) {
            console.log(`User ${email} (ID: ${userId}) is not enrolled in course ${courseId}. Enrolling now.`);
            fs.appendFileSync(outputFile, `User ${email} (ID: ${userId}) is not enrolled in course ${courseId}. Enrolling now.\n`);

             const result = await enrollUserInCourse(userId, courseId);
             if (result) {
                 console.log(`User ${email} (ID: ${userId}) successfully enrolled in course ${courseId}.`);
                 fs.appendFileSync(outputFile, `User ${email} (ID: ${userId}) successfully enrolled in course ${courseId}.\n`);
             } else {
                 console.error(`Failed to enroll user ${email} (ID: ${userId}) in course ${courseId}.`);
                 fs.appendFileSync(outputFile, `Failed to enroll user ${email} (ID: ${userId}) in course ${courseId}.\n`);
             }
        } else {
            console.log(`User ${email} (ID: ${userId}) is already enrolled in course ${courseId}.`);
            fs.appendFileSync(outputFile, `User ${email} (ID: ${userId}) is already enrolled in course ${courseId}.\n`);
        }
        }
    }

    console.log('User enrollment update process complete.');
}

// Ejecutar la función principal
updateUsers();
