

// export const renderHomePage = (req, res) => {
//     res.send("Welcome to the Home Page");
// }

import  User  from "../../models/user.js";

export const renderHomePage = (req, res) => {
    
    // Define the asynchronous logic as a single, main function to be executed
    const handleUserAdditionAndResponse = async () => {
        try {
            // Attempt to create a new user using the imported model
            const newUser = await User.create({ name: "Asif Doe", age: 30 });   
            
            console.log("New user added:", newUser.toJSON());
            
            // Send the response ONLY after the asynchronous database operation completes
            res.send("Welcome to the Home Page. User added: " + newUser.name);

        } catch (error) {
            console.error("Error adding user:", error);
            
            // Handle the error gracefully and send an error response to the client
            res.status(500).send("Welcome to the Home Page. Error adding user.");
        }
    };

    // Call the function immediately when the controller is hit by a request
    handleUserAdditionAndResponse();
};

export const display=(req, res) => {

    const data = async()=>{

        try {
            const users = await User.findAll();
            res.json(users);
        }catch (error) {
            console.error("Error fetching users:", error);
            res.status(500).send("Error fetching users.");
        }

    }

    data();

};


export const getSingleUser= (req, res) => {

    const data = async()=>{
        try {
            const userId = req.params.id;
            console.log("User ID from params:", userId);
            const user = await User.findByPk(userId);
            res.json(user);
        }catch (error) {
            console.error("Error fetching user:", error);
            res.status(500).send("Error fetching user.");
        }
    }

    data();
};