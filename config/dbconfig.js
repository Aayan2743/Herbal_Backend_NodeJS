


import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();



const sequelize = new Sequelize({
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    dialect: 'mysql',
    logging: false,
});




export default sequelize;
