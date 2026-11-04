const { handleAsync } = require("../utils/handleAsync");

const validateRequest = (schema, source = "body") =>
  handleAsync(async (req, _res, next) => {
    const parsed = await schema.parseAsync(req[source]);
    Object.defineProperty(req, source, {
      value: parsed,
      writable: true,
      configurable: true,
      enumerable: true,
    });
    next();
  });

module.exports = { validateRequest };

