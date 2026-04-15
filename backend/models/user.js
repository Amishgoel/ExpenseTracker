const mongoose=require("mongoose");
const bcrypt=require("bcryptjs");
const UserSchema=new mongoose.Schema(
    {
    fullName:{type: String, required:true},
    email : {type:String, required:true, unique:true},
    password:{type: String, required: false, default: null}, // null for OAuth users
    profileImageUrl: {type: String, default:null},
    },
    {timestamps:true},

);
// Hash password before saving (skip for OAuth users with no password)
UserSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 10);
});
// compare passwords (OAuth users may not have password)
UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};
module.exports=mongoose.model("User",UserSchema);
