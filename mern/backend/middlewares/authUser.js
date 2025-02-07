const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const token= authHeader.split(" ")[1];
  try {
    const decoded =await  jwt.verify(token, process.env.JWT_SECRET); 
    req.user = decoded; 
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};


module.exports = authMiddleware;
