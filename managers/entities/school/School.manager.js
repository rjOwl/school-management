const restfulServices = require("../../api/rest-controller");
const Roles = require("../user/utils");
const SchoolModel = require("./School.mongoModel");
const UserModel = require("../user/User.mongoModel");

module.exports = class School {
  constructor({
    utils,
    cache,
    config,
    cortex,
    validators,
    mongomodels,
    managers,
  }) {
    // Initialize School class properties
    this.config = config;
    this.cortex = cortex;
    this.validators = validators;
    this.mongomodels = mongomodels;
    this.tokenManager = managers.token;
    this.usersCollection = "schools";
    this.httpExposed = [
      "get=getAll",
      "create",
      "put=update",
      "delete=delete",
      "get=get",
    ];
    // Initialize restful services for School and User models
    this.schoolServices = restfulServices(SchoolModel);
    this.userServices = restfulServices(UserModel);
  }

  /**
   * Create a new school
   * @param {*} param0
   * @returns
   */
  async create({ __longToken, schoolManager, name, address, website }) {
    // remove on production
    console.log("Inside create: ", __longToken, schoolManager, name, address, website)
    // Check if the user is authorized to create a school
    if (!(await this.canManageSchoolModel(__longToken))) {
      return this.unauthorizedResponse();
    }

    // Validate payload
    const validationResult = await this.validators.school.create({
      name,
      address,
      website,
      schoolManager,
    });

    // Handle validation errors
    if (validationResult) {
      return this.validationErrorResponse(validationResult);
    }

    const currentManager = await this.managerExists(schoolManager);
    // Make sure the school manager exists
    if (!currentManager) {
      return this.errorResponse("School Manager does not exist", 400);
    }

    // Create the school
    return await this.schoolServices.create({
      name,
      address,
      website,
      schoolManager: currentManager._id,
    });
  }

  /**
   * Update a school
   */
  async update({ __longToken, id, name, address, website, schoolManager }) {
    // Check if the user is authorized to update a school
    if (!(await this.canManageSchoolModel(__longToken))) {
      return this.unauthorizedResponse();
    }

    // Validate payload
    const validationResult = await this.validators.school.update({
      id,
      name,
      address,
      website,
      schoolManager,
    });

    // remove on production
    console.log({ id, name, address, website, schoolManager });
    // Handle validation errors
    if (validationResult) {
      return this.validationErrorResponse(validationResult);
    }

    const school = await this.schoolServices.get({ id });

    if (!school) {
      return this.errorResponse("School not found", 404);
    }

    if (schoolManager) {
      const currentManager = await this.managerExists(schoolManager);
      if (!currentManager) {
        return this.errorResponse("School Manager does not exist", 400);
      }

      school.schoolManager = currentManager._id;
    }

    await school
      .set({
        name,
        address,
        website,
      })
      .save();

    return school;
  }

  /**
   * Delete a school by id
   */
  async delete({ __longToken, id }) {
    // Check if the user is authorized to delete a school
    if (!(await this.canManageSchoolModel(__longToken))) {
      return this.unauthorizedResponse();
    }

    const school = await this.schoolServices.get({ id });

    // Handle if the school is not found
    if (!school) {
      return this.errorResponse("School not found", 404);
    }

    // Delete the school
    await school.remove();

    return this.successResponse("School deleted successfully", 200);
  }

  /**
   * Get a school by id
   */
  async get({ __longToken, id }) {
    // Check if the user is authorized to get a school
    if (!(await this.canManageSchoolModel(__longToken))) {
      return this.unauthorizedResponse();
    }

    // Retrieve the school
    const school = await this.schoolServices.get({ id });

    // Handle if the school is not found
    if (!school) {
      return this.errorResponse("School not found", 404);
    }

    return school;
  }

  /**
   * Get all schools
   */
  async getAll({ __longToken }) {
    // Check if the user is authorized to get all schools
    if (!(await this.canManageSchoolModel(__longToken))) {
      return this.unauthorizedResponse();
    }

    // Retrieve all schools
    return await this.schoolServices.getAll();
  }

  // Check if the user can manage the school model
  async canManageSchoolModel(__longToken) {
    // remove on production
    console.log("canManageSchoolModel: ", __longToken);
    const { userKey, userId } = __longToken;
    const user = await this.userServices.get({ id: userId });

    // Check if the user is a super admin
    return (
      userKey ===Roles.SUPER_ADMIN && user && user.key ===Roles.SUPER_ADMIN
    );
  }

  /**
   * Check if the manager exists
   */
  async managerExists(id) {
    // Retrieve the school manager
    const schoolManager = await this.userServices.get({
      id,
      role:Roles.MANAGER,
    });

    if (!schoolManager) {
      return null;
    }

    return schoolManager;
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
};
