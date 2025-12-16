import { TryCatch } from "../utils/TryCatch.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sql } from "../utils/db.js";
import bcrypt from "bcrypt";
import { getBuffer } from "../utils/buffer.js";
import axios from "axios";

const SALT_ROUNDS = 10;
const ALLOWED_ROLES = ["recruiter", "jobseeker"] as const;

export const registerUser = TryCatch(async (req, res) => {
  const { name, email, password, phoneNumber, role, bio } = req.body;

  if (!name || !email || !password || !phoneNumber || !role) {
    throw new ErrorHandler(400, "Please fill all required details");
  }

  if (!ALLOWED_ROLES.includes(role)) {
    throw new ErrorHandler(400, "Invalid role");
  }

  const existingUsers = await sql`
    SELECT user_id FROM users WHERE email = ${email}
  `;

  if (existingUsers.length > 0) {
    throw new ErrorHandler(409, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  let registeredUser;

  if (role === "recruiter") {
    const [user] = await sql`
      INSERT INTO users (name, email, password, phone_number, role)
      VALUES (${name}, ${email}, ${hashedPassword}, ${phoneNumber}, ${role})
      RETURNING user_id, name, email, phone_number, role, created_at
    `;

    registeredUser = user;
  }

  if (role === "jobseeker") {
    const file = req.file;
    if (!file) {
      throw new ErrorHandler(400, "Resume is required");
    }

    const fileBuffer = getBuffer(file);
    if (!fileBuffer?.content) {
      throw new ErrorHandler(500, "Failed to generate file buffer");
    }

    const { data } = await axios.post(
      `${process.env.UPLOAD_SERVICE}/api/utils/upload`,
      { buffer: fileBuffer.content },
      { timeout: 10000 }
    );

    //@ts-ignore
    const { url, public_id } = data;
    if (!url || !public_id) {
      throw new ErrorHandler(502, "File upload failed");
    }

    const [user] = await sql`
      INSERT INTO users (
        name,
        email,
        password,
        phone_number,
        role,
        bio,
        resume,
        resume_public_id
      )
      VALUES (
        ${name},
        ${email},
        ${hashedPassword},
        ${phoneNumber},
        ${role},
        ${bio ?? null},
        ${url},
        ${public_id}
      )
      RETURNING user_id, name, email, phone_number, role, bio, resume, created_at
    `;

    registeredUser = user;
  }

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: registeredUser,
  });
});
