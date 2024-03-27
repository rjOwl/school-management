module.exports = ({ meta, config, managers }) => {
  return ({ req, res, next }) => {
    console.log("The query request: ", req.query);
    next(req.query);
  };
};
