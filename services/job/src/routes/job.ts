import express from "express";
import { isAuth } from "../middleware/auth";
import {
  createCompany,
  createJob,
  deleteCompany,
  updateJob,
} from "../controllers/job";
import uploadFile from "../middleware/multer";

const router = express.Router();

router.post("/company/new", isAuth, uploadFile, createCompany);
router.delete("/company/:companyId", isAuth, deleteCompany);
router.post("/new", isAuth, createJob);

router.put("/:jobId", isAuth, updateJob);
export default router;
