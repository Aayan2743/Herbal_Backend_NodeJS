
import {body,validationResult } from "express-validator";

export const home=(req,res)=>{
    
    res.render("pages/blank", { errors: {}, old: {} })
}





export const addUser=(req,res)=>{

   const result=validationResult(req);

//      if (!errors.isEmpty()) {
   

//     res.render("pages/blank",{errors:errors.array()})
//   }


if (!result.isEmpty()) {
    // map errors to an object { fieldName: 'message' }
    const mappedErrors = {};
    result.array().forEach(err => {
      // if multiple rules per field, keep first (or push to array)
      if (!mappedErrors[err.param]) mappedErrors[err.param] = err.msg;
    });

    return res.status(200).render("pages/blank", {
      errors: mappedErrors,
      old: req.body || {}
    });
  }




}