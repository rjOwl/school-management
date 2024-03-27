const { response } = require("express");
const restfulServices = require("../../api/rest-controller");
const SchoolModel = require("../school/School.mongoModel");
const UserModel = require("../user/User.mongoModel");
const Roles = require("../user/utils");
const ClassroomModel = require("./Classroom.mongoModel");

module.exports = class Classroom {
  constructor({
    utils,
    cache,
    config,
    cortex,
    managers,
    validators,
    mongomodels,
  } = {}) {
    this.config = config;
    this.cortex = cortex;
    this.validators = validators;
    this.mongomodels = mongomodels;
    this.tokenManager = managers.token;
    this.usersCollection = "classrooms";
    this.httpExposed = [
      "create",
      "get=getAll",
      "get=get",
      "delete=delete",
      "put=update",
    ];
    this.userServices = restfulServices(UserModel);
    this.schoolServices = restfulServices(SchoolModel);
    this.classroomServices = restfulServices(ClassroomModel);
  }

  /**
   * Create a new classroom
   */
  async create({ __longToken, name, school }) {
    console.log("Inside create classroom: ", __longToken, name, school)
    // Check if the user is authorized to create a classroom
    if (!(await this.canManageClassroomModel(__longToken))) {
    return this.unauthorizedResponse();
    }
    // Validate payload
    const validationResult = await this.validators.classroom.create({
      name,
      school,
    });

    // Handle validation errors
    if (validationResult) {
      return this.validationErrorResponse(validationResult);
    }

    const currentSchool = await this.schoolExists(school);
    // Make sure the school exists
    if (!currentSchool) {
      return this.errorResponse("School not found", 404);
    }
    console.log("currentSchool: ", currentSchool)
    const classroomExists = await this.schoolHasClassroom(currentSchool, name);
    if (classroomExists) {
      return this.errorResponse("Classroom exists", 404);
    }

    // Create classroom
    const classroom = await this.classroomServices.create({
      name,
      school: currentSchool._id,
    });

    currentSchool.classrooms = [...currentSchool.classrooms, classroom._id];
    currentSchool.totalClassrooms++;
    await currentSchool.save();

    return classroom;
  }

  /**
   * Get all classrooms in a school, Default all classrooms in DB
   */
  async getAll({ __longToken, school }) {
    // Check if the user is authorized to create a classroom
    if (!(await this.canManageClassroomModel(__longToken))) {
      return this.unauthorizedResponse();
    }

    let currentSchool = null;
    if (school) {
      currentSchool = await this.schoolExists(school);
      return {
        classrooms: await this.classroomServices.getAll({
          school: currentSchool ? currentSchool._id : null,
        }),
      };
    }

    return {
      classrooms: await this.classroomServices.getAll({}),
    };
  }

  /**
   * Get a classroom by id or name
   */
  async get({ __longToken, id, name }) {
    // Check if the user is authorized to create a classroom
    if (!(await this.canManageClassroomModel(__longToken))) {
      return this.unauthorizedResponse();
    }

    if (id) {
      return await this.classroomServices.get({ id });
    }

    if (name) {
      return await this.classroomServices.get({ name });
    }

    return this.errorResponse("Classroom not found", 404);
  }

  /**
   * Delete a classroom by id
   */
  async delete({ __longToken, id }) {
    console.log("in delete classroom: ", __longToken, id);
    // Check if the user is authorized to create a classroom
    if (!(await this.canManageClassroomModel(__longToken))) {
      return this.unauthorizedResponse();
    }

    const classroom = await this.classroomServices.delete({ id });

    console.log("CLASSSSROOOOOOOOOOOOM: ", classroom);
    // Handle if the classroom is not found
    if (!classroom) {
      return this.errorResponse("Classroom not found", 404);
    }

    // Update school
    const currentSchool = await this.schoolServices.get({
      _id: classroom.school,
    });

    if (currentSchool) {
      currentSchool.classrooms = currentSchool.classrooms.filter(
        (classroom) => classroom.toString() !== classroom._id.toString()
      );
      currentSchool.totalClassrooms--;
      await currentSchool.save();
    }

    return {
      message: "Classroom deleted successfully",
      ok: true,
    };
  }

  /**
   * Update a classroom
   */
  async update({ __longToken, id, name, school }) {
    // Check if the user is authorized to create a classroom
    if (!(await this.canManageClassroomModel(__longToken))) {
      return this.unauthorizedResponse();
    }
    id = Number(id)
    // const validationResult = await this.validators.classroom.update({
    //   name,
    //   id,
    //   school
    // });
    // Handle validation errors
    // if (validationResult) {
    //   return this.validationErrorResponse(validationResult);
    // }

    const classroom = await this.classroomServices.get({ id });

    if (!classroom) {
      return this.errorResponse("Classroom not found", 404);
    }

    classroom.name = name;

    await classroom.save();

    return classroom;
  }

  /**
   * School exists
   * @param {*} school
   * @returns
   */
  async schoolExists(school) {
    return await this.schoolServices.get({ id: school });
  }

  /**
   * Check if the user is authorized to create a classroom
   * @param {*} __longToken
   * @returns
   */
  async canManageClassroomModel(__longToken) {
    const { userId } = __longToken;

    const manager = await this.userServices.get({
      id: userId,
    });

    if (!manager) {
      return false;
    }

    return manager.role === Roles.SUPER_ADMIN || manager.role === Roles.MANAGER;
  }

  /**
   * Return unauthorized response
   * @returns
   */
  unauthorizedResponse() {
    return this.errorResponse("Unauthorized", 401);
  }

  /**
   * Return validation error response
   */
  validationErrorResponse(errors) {
    return { errors, code: 400, message: "Validation Error", ok: false };
  }

  /**
   * Return error response
   */
  errorResponse(message, code) {
    return { errors: [message], code, message, ok: false };
  }

  /**
   * Check if the school has the classroom
   * @param {*} school
   * @param {*} classroom
   * @returns
   */
  async schoolHasClassroom(school, classroom) {
    // get all names of classrooms in the school
    // check if the classroom name is in the list

    // Perform a MongoDB query to find documents with matching IDs
    const classroomDocs = await this.classroomServices.getAll({ _id: { $in: school.classrooms } });

    // filter out the classroom names
    const classroomNames = classroomDocs.map(doc => doc.name);
    // Now you can check if a classroom with a certain name exists
    const classroomExists = classroomNames.includes(classroom);
    return classroomExists
  }
};
