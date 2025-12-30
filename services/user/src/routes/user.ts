import express from "express";
import {
  addSkillToUser,
  applyForJob,
  deleteSkillFromUser,
  getAllApplications,
  getUserProfile,
  myProfile,
  updateProfilePic,
  updateResume,
  updateUserProfile,
} from "../controllers/user.js";
import { isAuth } from "../middleware/auth.js";
import uploadFile from "../middleware/multer.js";

const router = express.Router();

router.get("/me", isAuth, myProfile);
router.put("/update/profile", isAuth, updateUserProfile);
router.put("/update/pic", isAuth, uploadFile, updateProfilePic);
router.put("/update/resume", isAuth, uploadFile, updateResume);
router.post("/skill/add", isAuth, addSkillToUser);
router.delete("/skill/delete", isAuth, deleteSkillFromUser);
router.post("/apply/job", isAuth, applyForJob);
router.get("/application/all", isAuth, getAllApplications);

router.get("/:userId", isAuth, getUserProfile);

export default router;
