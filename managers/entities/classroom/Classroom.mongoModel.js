const { default: mongoose } = require("mongoose");
const preCreateDoc = require("../autoIncreementSchema/pre_mw");

const Classroom = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "schools",
  },
  id: {
    type: Number,
    default: 0,
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  ],
  totalStudents: {
    type: Number,
    default: 0,
  },
}, {timestamps: true});

preCreateDoc(Classroom);

const ClassroomModel = mongoose.model("classrooms", Classroom);

module.exports = ClassroomModel;
