import express, { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";

const router = express.Router();

router.post("/upload", async (req: Request, res: Response) => {
  try {
    const { buffer, public_id } = req.body;

    if (!buffer) {
      return res.status(400).json({
        message: "File buffer is required",
      });
    }

    if (public_id) {
      await cloudinary.uploader.destroy(public_id);
    }

    const cloud = await cloudinary.uploader.upload(buffer);

    res.status(200).json({
      success: true,
      url: cloud.secure_url,
      public_id: cloud.public_id,
    });
  } catch (error: any) {
    const message = error.message || "Cloud upload failed";

    res.status(500).json({
      success: false,
      message,
    });
  }
});

export default router;
