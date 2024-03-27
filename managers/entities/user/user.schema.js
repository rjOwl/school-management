module.exports = {
  createUser: [
    {
      label: "username",
      model: "username",
      required: true,
    },
    {
      label: "email",
      model: "email",
      type: "String",
    },
    {
      label: "password",
      model: "password",
      type: "String",
      required: true,
    },
  ],
  loginUser: [{}],
};
