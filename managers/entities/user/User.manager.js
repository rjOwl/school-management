const bcrypt = require("bcrypt");
const restfulServices = require("../../api/rest-controller");
const UserModel = require("./User.mongoModel");
const Roles = require("./utils");

class User {
  constructor({ config, cortex, validators, mongomodels, managers } = {}) {
    // Initialize class properties with provided dependencies
    this.config = config;
    this.cortex = cortex;
    this.validators = validators;
    this.mongomodels = mongomodels;
    this.tokenManager = managers.token;
    this.usersCollection = "users";
    this.httpExposed = ["createUser", "login", "createAdmin"];
    this.restServices = restfulServices(UserModel);
    this.managers = managers;
  }

  // TODO:
  // Create super admin only
  // this should be private end point
  async createAdmin({ username, email, password, role}) {
    const payload = { username, email, password, role};
    console.log("role,Roles.SUPER_ADMIN,Roles.MANAGER:", role,Roles.SUPER_ADMIN,Roles.MANAGER)
    console.log("role,Roles.SUPER_ADMIN,Roles.MANAGER:", typeof role, typeof Roles.SUPER_ADMIN, typeof Roles.MANAGER)
    if (role ===Roles.SUPER_ADMIN || role ===Roles.MANAGER) {
      console.log("I'm heeree:")
      return await this.createUserWithRole({payload})
    }
    return this.errorResponse(400, "Invalid role", ["Invalid role"]);
  }

  // TODO:
  // Create a new user, only school admin can create a new user
  // Only SuperAdmin can create a school
  async createUser({  username, email, password, role = Roles.STUDENT }) {
    const payload = { username, email, password, role };
    // check if role exists and is anything but super admin and manager
     if ( Object.values(Roles).includes(role) &&
          (role!==Roles.SUPER_ADMIN && role !==Roles.MANAGER)) {
      console.log("I'm heeree:")
      return await this.createUserWithRole({payload})
    }
    return this.errorResponse(400, "Invalid role", ["Invalid role"]);
  }

  async createUserWithRole({payload}){
    const { username, email, password, role } = payload

    // Validate user data
    const validationResult = await this.validateUser(payload);

    if (validationResult) {
      return this.errorResponse(400, "Validation Error", validationResult);
    }

    // Check if the user already exists
    if (await this.userExists(email)) {
      return this.errorResponse(400, "User already exists", [
        "User already exists",
      ]);
    }

    // Hash password before storing
    const hashedPassword = await this.hashPassword(password);
    payload.password = hashedPassword;

    // Create user
    const user = await this.restServices.create(payload);

    // Generate long token for user session
    const longToken = this.tokenManager.genLongToken({
      userId: user.id,
      userRole: user.role,
    });
    return this.successResponse(user, longToken);
  }
  // User login
  async login({ email, password }) {
    const validationResult = await this.validateLogin({ email, password });

    if (validationResult) {
      return this.errorResponse(400, "Validation Error", validationResult);
    }

    // Find user by email
    const user = await this.restServices.get({ email });

    if (!user) {
      return this.errorResponse(404, "User not found");
    }

    // Compare provided password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return this.errorResponse(400, "Invalid credentials");
    }

    // Generate long token for user session
    const longToken = this.tokenManager.genLongToken({
      userId: user.id,
      userRole: user.role,
    });

    return this.successResponse(user, longToken);
  }

  // Validate user data
  async validateUser(payload) {
    return await this.validators.user.createUser(payload);
  }

  // Validate login data
  async validateLogin(payload) {
    return await this.validators.user.loginUser(payload);
  }

  // Check if user already exists
  async userExists(email) {
    const user = await this.restServices.get({ email });
    return user !== null;
  }

  // Hash password using bcrypt
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  // Prepare success response object
  successResponse(user, longToken) {
    return {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        id: user.id,
      },
      longToken,
    };
  }

  // Prepare error response object
  errorResponse(code, message, errors = []) {
    return { code, message, ok: false, errors };
  }
}

module.exports = User;
