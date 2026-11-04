const { status } = require("http-status");
const { query } = require("../config/db");
const { AppError } = require("../utils/AppError");
const { handleAsync } = require("../utils/handleAsync");
const { verifyToken } = require("../utils/tokens");


const auth = (...roles) =>
  handleAsync(async (req, _res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new AppError(status.UNAUTHORIZED, "Please login first");
    }

    const payload = verifyToken(header.split(" ")[1]);
    const result = await query(
      'SELECT id, role, is_active AS "isActive" FROM users WHERE id = $1',
      [payload.userId]
    );
    const user = result.rows[0];

    if (!user || !user.isActive) {
      throw new AppError(status.UNAUTHORIZED, "Account not found or deactivated");
    }
    if (roles.length && !roles.includes(user.role)) {
      throw new AppError(status.FORBIDDEN, "You do not have permission to do this");
    }

    req.user = { id: user.id, role: user.role };
    next();
  });

const optionalAuth = handleAsync(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    const payload = verifyToken(header.split(" ")[1]);
    const result = await query(
      'SELECT id, role, is_active AS "isActive" FROM users WHERE id = $1',
      [payload.userId]
    );
    const user = result.rows[0];
    if (user && user.isActive) {
      req.user = { id: user.id, role: user.role };
    }
  }
  next();
});

module.exports = { auth, optionalAuth };

