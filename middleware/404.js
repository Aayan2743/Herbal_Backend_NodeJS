export const notFound = (req, res, next) => {
  return res.status(404).json({
    status: false,
    message: "Route not found",
  });
};
