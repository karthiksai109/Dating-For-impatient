const userModel=require('../Models/userRegisterModel')
const userRegister=async function(req,res){
    try{
    let data=req.body
    if(!data){
        return res.status(400).send({status:false,message:"please enter all feilds..."})
    }
    
   let arr=['name','email', 'password', 'confirmpassword' ,'dateOfBirth', 'hobbies', 'bio', 'preferences', 'photos']

   let keys=Object.keys(data)
   for(let i=0;i<keys.length;i++){
 
        if(keys[keys.length-1].length<6){
            return res.status(400).send({status:false,message:`please upload valid number of photos`})
        }
        if(keys[keys.length-1].length>6){
            return res.status(400).send({status:false,message:`please upload valid number of photos`})
        }
        if(!arr.includes(keys[i])){
            return res.status(400).send({status:false,message:`please enter valid attributes is required`})
    }
   }    
   let {name,email,password, confirmpassword ,dateOfBirth, hobbies, bio, preferences ,photos}=data
        if(!name){
            return res.status(400).send({status:false,message:`please enter your name`})
        }
       

        if(!email){
            return res.status(400).send({status:false,message:`please enter your email`})
        }
      

        let isEmail=await userModel.findOne({email:email})
            if(isEmail){
                return res.status(400).send({status:false,message:`email already registered`})
            }
        if(!password){
            return res.status(400).send({status:false,message:`please enter your password`})
        }
        if(!confirmpassword){
            return res.status(400).send({status:false,message:`please enter your password`})
        }
        if(password !== confirmpassword){
            return res.status(400).send({status:false,message:`password mismatch `})
        }
        if(!dateOfBirth){
            return res.status(400).send({status:false,message:`please enter your dateofBirth `})
        }
          if(!hobbies){
            return res.status(400).send({status:false,message:`please enter your dateofBirth `})
        }
        
        
        
   
    let userData=await userModel.create(data)
    console.log(userData)
    return res.status(200).send({status:"success",message:"registration successfull "})
    }
catch(err){
    return res.status(400).send({status:false,message:err.message})
}
}

// GET ALL USERS
const getAllUsers = async function (req, res) {
  try {
    let users = await userModel
      .find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).send({ status: true, message: "users list", data: users });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// GET SINGLE USER DETAILS
const getUserById = async function (req, res) {
  try {
    let { userId } = req.params;

    let user = await userModel.findOne({ _id: userId, role: "user" }).select("-password");
    if (!user) return res.status(404).send({ status: false, message: "user not found" });

    return res.status(200).send({ status: true, message: "user details", data: user });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};


//update user details
const updateUser = async function (req, res) {
  try {
    let { userId } = req.params;

    let user = await userModel.findOne({ _id: userId, role: "user" }).select("-password");
    if (!user) return res.status(404).send({ status: false, message: "user not found" });


    //return res.status(200).send({ status: true, message: "user details", data: user });

      const allowedUpdates = [
      "name",
      "email",
      "status",
      "gender",
      "age",
      "bio"
    ];

    const updates = {};
    for (let key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }
      const userUpdated = await userModel.findByIdAndUpdate(
      userId,
      updates,
      { new: true }
    ).select("-password");



  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};


//update user details
const deleteUser = async function (req, res) {
  try {
    let { userId } = req.params;

    let user = await userModel.findOne({ _id: userId, role: "user" }).select("-password");
    if (!user) return res.status(404).send({ status: false, message: "user not found" });


  
   
    const userUpdated = await userModel.findByIdAndUpdate(
     userId,{status:'banned'},
      { new: true }
    );
   return res.send({status:true,message:'banned succesfully'})



  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};


module.exports={userRegister,getAllUsers,getUserById,updateUser,deleteUser}