module.exports = {
  create: [
    {
      label: "name",
      model: "name",
      type: "String",
      required: true,
    },
    {
      label: "school",
      model: "school",
      type: "Number",
      required: true,
    },
  ],

  update: [
    {
      label: "name",
      model: "name",
      type: "String",
    },
    {
      label: "id",
      model: "id",
      type: "Number",
      required: true,
    },
    {
      label: "school",
      model: "school",
      type: "Number",
    },
  ],
};
