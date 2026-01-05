export const errorHandler = (err, req, res, next) => {
  console.error("Server Error:", err);

  return res.status(500).json({
    status: false,
    message: "Internal Server Error",
    error: err.message,
  });
};
