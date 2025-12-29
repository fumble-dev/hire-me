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

router.delete("/delete/:public_id", async (req: Request, res: Response) => {
  try {
    const { public_id } = req.body;

    if (!public_id) {
      return res.status(400).json({ message: "Public id is required" });
    }

    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result !== "ok") {
      return res.status(404).json({
        message: "Image not found or already deleted",
      });
    }

    res.status(200).json({
      success: true,
      message: "Company logo deleted successfully",
    });
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    res.status(500).json({
      message: "Failed to delete image",
    });
  }
});


export default router;
