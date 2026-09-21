import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. Token missing.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_devgear_key_123');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid or expired token.' });
  }
};

export const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};