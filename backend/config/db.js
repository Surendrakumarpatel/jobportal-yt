import mysql from 'mysql2/promise'

let db;

const connectDB = async () => {
    if (!db) {
    try {
        db = await mysql.createPool({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            // connectionLimit: 10, in we want to limit thr numbrt of connetions
        });
        console.log('MySQL connected successfully');
    } catch (error) {
        console.log(error);
    }
}
return db;
};

const queryDB = async (query, params) => {
    const db = await connectDB();
    return db.query(query, params);
};

export { connectDB,queryDB };