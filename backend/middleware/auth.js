const jwt = require('jsonwebtoken');

const authenticationMiddleware = async (req, res, next) => {
  const { token } = req.cookies;

  // if (!authHeader || !authHeader.startsWith('Bearer ')) {
  //   return res.status(404).json({
  //     error: 'token not found',
  //   });

  /* console.log(token) */

  // const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email, id, name, role } = decoded;
    if (role !== 'customer') {
      return res.status(404).json({
        msg: 'Not a customer',
      });
    }
    req.user = { email, id, name, role };
    next();
  } catch (error) {
    return res.status(404).json({
      error: 'invalid token',
    });
  }
};

module.exports = authenticationMiddleware;
