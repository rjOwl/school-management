const { default: mongoose } = require("mongoose");
const Roles = require("./utils");
const Counter = require("../autoIncreementSchema/counterModel");
const preCreateDoc = require("../autoIncreementSchema/pre_mw");

const roles = [Roles.TEACHER,Roles.STUDENT,Roles.ADMIN,Roles.SUPER_ADMIN];

const User = new mongoose.Schema({
  isActive: {
    type: Boolean,
    default: true,
  },
  id: {
    type: Number,
    default: 0,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: roles,
    required: true,
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "schools",
  },
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "classrooms",
  },
}, {timestamps: true});

preCreateDoc(User);

const UserModel = mongoose.model("users", User);
module.exports = UserModel;
