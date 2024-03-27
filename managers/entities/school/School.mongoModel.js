const { default: mongoose } = require("mongoose");
const preCreateDoc = require("../autoIncreementSchema/pre_mw");

const School = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  address: {
    type: String,
    required: true,
  },
  id: {
    type: Number,
    default: 0,
  },
  website: {
    type: String,
    required: true,
  },
  schoolManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  classrooms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "classrooms",
    },
  ],
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
  totalClassrooms: {
    type: Number,
    default: 0,
  },
}, {timestamps: true});

preCreateDoc(School);

const SchoolModel = mongoose.model("schools", School);

module.exports = SchoolModel;
