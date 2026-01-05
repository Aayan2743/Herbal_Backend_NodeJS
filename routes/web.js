import express from "express";
import {body} from "express-validator";
const webrouter = express.Router();
import { renderHomePage,display,getSingleUser } from "../controllers/web/homeController.js";
import { home,addUser } from "../controllers/web/dashboardController.js";



webrouter.get("/home", renderHomePage);


webrouter.get("/display", display);

webrouter.get("/user/:id", getSingleUser);


 const validationdata=[
              body('username').notEmpty().withMessage("Name Field Required"),
              body('userage').notEmpty().withMessage('Age Field Required')
    ];


webrouter.get("/blank", home)
webrouter.post("/add-User",validationdata, addUser)



export default webrouter;