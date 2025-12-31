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

import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY_GEMINI });

router.post("/career", async (req, res) => {
  try {
    const { skills } = req.body;

    if (!skills) {
      return res.status(400).json({
        message: "Skills Required",
      });
    }

    const prompt = `
      Based on the following skills: ${skills}.
      Please act as a career advisor and generate a career path suggestion.
      Your entire response must be in a valid JSON format. Do not include any text or markdown
      formatting outside of the JSON structure.
      The JSON object should have the following structure:
      {
      "summary": "A brief, encouraging summary of the user's skill set and their general job
      title.",
      "jobOptions": [
      {
      "title": "The name of the job role.",
      "responsibilities": "A description of what the user would do in this role.",
      "why": "An explanation of why this role is a good fit for their skills."
      }
      ],
      "skillsToLearn": [
      {
      "category": "A general category for skill improvement (e.g., 'Deepen Your Existing Stack
      Mastery', 'DevOps & Cloud').",
      "skills": [
      {
      "title": "The name of the skill to learn.",
      "why": "Why learning this skill is important.",
      "how": "Specific examples of how to learn or apply this skill."
      }
      ]
      }
      ],
      "learningApproach": {
      "title": "How to Approach Learning",
      "points": ["A bullet point list of actionable advice for learning."]
      }
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let jsonResponse;

    try {
      const rawText = response.text
        ?.replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      if (!rawText) {
        throw new Error("Ai did not return a valid text response");
      }

      jsonResponse = JSON.parse(rawText);
    } catch (error) {
      return res.status(500).json({
        message: "Ai returned response that was not valid",
        rawResponse: response.text,
      });
    }

    res.json(jsonResponse);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    res.status(500).json({
      message: "Failed to delete image",
    });
  }
});

router.post("/resume-analyser", async (req, res) => {
  try {
    const {pdfBase64} = req.body;
    if (!pdfBase64) {
      return res.status(400).json({
        message: "PDF data is required",
      });
    }

    const prompt = `
          You are an expert ATS (Applicant Tracking System) analyzer. Analyze the following resume
          and provide:
          1. An ATS compatibility score (0-100)
          2. Detailed suggestions to improve the resume for better ATS performance
          Your entire response must be in valid JSON format. Do not include any text or markdown
          formatting outside of the JSON structure.
          The JSON object should have the following structure:

          {
          "atsScore": 85,
          "scoreBreakdown": {
          "formatting": {
          "score": 90,
          "feedback": "Brief feedback on formatting"
          },
          "keywords": {
          "score": 80,
          "feedback": "Brief feedback on keyword usage"
          },
          "structure": {
          "score": 85,
          "feedback": "Brief feedback on resume structure"
          },
          "readability": {
          "score": 88,
          "feedback": "Brief feedback on readability"
          }
          },
          "suggestions": [
          {
          "category": "Category name (e.g., 'Formatting', 'Content', 'Keywords',
          'Structure')",
          "issue": "Description of the issue found",
          "recommendation": "Specific actionable recommendation to fix it",
          "priority": "high/medium/low"
          }
          ],
          "strengths": [
          "List of things the resume does well for ATS"
          ],
          "summary": "A brief 2-3 sentence summary of the overall ATS performance"
          }
          Focus on:
          - File format and structure compatibility
          - Proper use of standard section headings
          - Keyword optimization
          - Formatting issues (tables, columns, graphics, special characters)
          - Contact information placement
          - Date formatting
          - Use of action verbs and quantifiable achievements
          - Section organization and flow
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        role:"user",
        parts:[{
          text:prompt,
          
        },{
          inlineData:{
            mimeType:"application/pdf",
            data:pdfBase64.replace(/^data:application\/pdf; base64,/, "")
          }
        }]
      }],
    });

    let jsonResponse;

    try {
      const rawText = response.text
        ?.replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      if (!rawText) {
        throw new Error("Ai did not return a valid text response");
      }

      jsonResponse = JSON.parse(rawText);
    } catch (error) {
      return res.status(500).json({
        message: "Ai returned response that was not valid",
        rawResponse: response.text,
      });
    }

    res.json(jsonResponse);

  } catch (error) {
    console.error("Cloudinary delete error:", error);
    res.status(500).json({
      message: "Failed to delete image",
    });
  }
});

export default router;
