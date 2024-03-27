module.exports = {
  create: [
    {
      label: "name",
      model: "name",
      type: "String",
      required: true,
    },
    {
      label: "address",
      model: "address",
      type: "String",
      required: true,
    },
    {
      label: "website",
      model: "website",
      type: "String",
      required: true,
    },
    {
      model: "schoolManager",
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
    },
    {
      label: "address",
      model: "address",
      type: "String",
    },
    {
      label: "website",
      model: "website",
      type: "String",
    },
    {
      label: "schoolManager",
      model: "schoolManager",
      type: "Number",
    },
  ],
};
