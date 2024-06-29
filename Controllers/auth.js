const User = require('../models/auth')
const bcrypt = require("bcryptjs");      

const jwt = require("jsonwebtoken");
var nodemailer = require("nodemailer");

const JWT_SECRET= "hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jbkj?[]]pou89ywe"
const userController = {

  
   register: async (req, res) => {
    const { name, email, password, userType } = req.body;
    console.log(name, email, password, userType);
  console.log((req.body),jwt,"req");
    const encryptedPassword = await bcrypt.hash(password, 10);
    try {
      const oldUser = await User.find( {email} );
  
      if (!oldUser) {
        return res.json({ error: "User Exists" });
      }
      await User.create({
       name,
        email,
        password: encryptedPassword,
        userType,
      });
      res.send({ status: "User Register" });
    } catch (error) {
      console.log(error);
      res.status(500).send (error );
    }
  } ,

   login : async (req, res) => {
    const { email, password } = req.body;
  
    const user = await User.findOne({ email });  
    if (!user) {
      return res.json({ error: "User Not found" });
    }
    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ email: user.email }, JWT_SECRET, {
        expiresIn: "15m",
      });
  
      if (res.status(201)) {
        return res.json({ status: "Login Success", data: token });
      } else {
        return res.json({ error: " token error" });
      }
    }
    res.json({ status: "error", error: "InvAlid Password" });
  },
 userData: async (req, res) => {
    const { token } = req.body;
    try {
      const user = jwt.verify(token, JWT_SECRET, (err, res) => {
        if (err) {
          return "token expired";
        }
        return res;
      });
      console.log(user);
      if (user == "token expired") {
        return res.send({ status: "error", data: "token expired" });
      }
  
      const useremail = user.email;
      User.findOne({ email: useremail })
        .then((data) => {
          res.send({ status: "ok", data: data });
        })
        .catch((error) => {
          res.send({ status: "error", data: error });
        });
    } catch (error) { }
  } 
  


}
  module.exports = userController;