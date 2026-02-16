import jwt from "jsonwebtoken";

/**
 * Middleware para validar JWT en el Sistema Bancario
 * Se espera el token en el header:
 * Authorization: Bearer <TOKEN>
 */
export const validateJWT = (req, res, next) => {
  // Configuración del JWT desde variables de entorno
  const jwtConfig = {
    secret: process.env.JWT_SECRET,       // Obligatorio
    issuer: process.env.JWT_ISSUER || null,   // Opcional
    audience: process.env.JWT_AUDIENCE || null, // Opcional
  };

  if (!jwtConfig.secret) {
    console.error("Error JWT: JWT_SECRET no definido en .env");
    return res.status(500).json({
      success: false,
      message: "Configuración del servidor inválida: falta JWT_SECRET",
    });
  }

  // Extraer token del header Authorization
  const token =
    req.header("Authorization")?.replace("Bearer ", "") ||
    req.header("x-token"); // soporte opcional para x-token

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No se proporcionó un token",
      error: "MISSING_TOKEN",
    });
  }

  try {
    // Opciones de verificación del JWT
    const verifyOptions = {};
    if (jwtConfig.issuer) verifyOptions.issuer = jwtConfig.issuer;
    if (jwtConfig.audience) verifyOptions.audience = jwtConfig.audience;

    // Decodificar el token
    const decoded = jwt.verify(token, jwtConfig.secret, verifyOptions);

    // Asignar datos del usuario al request
    req.user = {
      id: decoded.sub,               // ID del usuario
      role: decoded.role || "User",  // Rol por defecto
      iat: decoded.iat,              // Emitido en
      jti: decoded.jti || null,      // ID único del token (opcional)
    };

    next(); // Token válido, continuar al controlador
  } catch (error) {
    console.error("Error validando JWT:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "El token ha expirado",
        error: "TOKEN_EXPIRED",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token inválido",
        error: "INVALID_TOKEN",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al validar el token",
      error: "TOKEN_VALIDATION_ERROR",
    });
  }
};
