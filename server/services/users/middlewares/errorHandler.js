// errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.stack);
  if (err.status === 504) {
    return res.status(504).json({
      success: false,
      message: "The system is under maintenance. Please try again later.",
    });
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

export default errorHandler;
