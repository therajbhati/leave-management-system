const crypto = require("crypto");

// ─────────────────────────────────────────────────────────────────
// AES-256-CBC Encryption Utility
// Key is derived from ENCRYPTION_KEY env var using SHA-256
// Format: "ivHex:encryptedBase64"
// ─────────────────────────────────────────────────────────────────

const getKey = () => {
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error("ENCRYPTION_KEY is not set in environment variables");
  }
  // Derive a consistent 32-byte key from the env string using SHA-256
  return crypto
    .createHash("sha256")
    .update(process.env.ENCRYPTION_KEY)
    .digest();
};

const encrypt = (data) => {
  const key = getKey();
  const iv = crypto.randomBytes(16); // fresh random IV for every response
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const jsonStr = JSON.stringify(data);
  const encrypted = Buffer.concat([
    cipher.update(jsonStr, "utf8"),
    cipher.final(),
  ]);
  // Format: ivHex:encryptedBase64
  return iv.toString("hex") + ":" + encrypted.toString("base64");
};

const decrypt = (encryptedStr) => {
  const key = getKey();
  const [ivHex, encryptedBase64] = encryptedStr.split(":");
  if (!ivHex || !encryptedBase64) {
    throw new Error("Invalid encrypted payload format");
  }
  const iv = Buffer.from(ivHex, "hex");
  const encryptedBuffer = Buffer.from(encryptedBase64, "base64");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  const decrypted = Buffer.concat([
    decipher.update(encryptedBuffer),
    decipher.final(),
  ]);
  return JSON.parse(decrypted.toString("utf8"));
};

// ─────────────────────────────────────────────────────────────────
// MIDDLEWARE 1: Decrypt incoming request body
// Runs BEFORE auth middleware and controllers
// Only decrypts if body has { data: "..." } structure
// GET requests have no body — they pass through untouched
// ─────────────────────────────────────────────────────────────────
const decryptRequest = (req, res, next) => {
  // Skip if no body or no encrypted data field
  if (!req.body || !req.body.data) {
    return next();
  }

  try {
    const decrypted = decrypt(req.body.data);
    req.body = decrypted; // Replace encrypted body with plain object
    next();
  } catch (err) {
    console.error("❌ Decryption failed:", err.message);
    // Even error responses must be encrypted
    const errorPayload = encrypt({
      message: "Invalid or malformed encrypted payload",
    });
    return res.status(400).json({ data: errorPayload });
  }
};

// ─────────────────────────────────────────────────────────────────
// MIDDLEWARE 2: Encrypt all outgoing responses
// Runs AFTER controllers by overriding res.json()
// Every res.json({ ... }) call becomes res.json({ data: "encrypted" })
// ─────────────────────────────────────────────────────────────────
const encryptResponse = (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (data) => {
    try {
      const encrypted = encrypt(data);
      return originalJson({ data: encrypted });
    } catch (err) {
      console.error("❌ Response encryption failed:", err.message);
      // Fallback: send a generic encrypted error
      const errorPayload = encrypt({ message: "Internal server error" });
      return originalJson({ data: errorPayload });
    }
  };

  next();
};

module.exports = { decryptRequest, encryptResponse, encrypt, decrypt };
