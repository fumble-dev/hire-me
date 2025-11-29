import express from "express";
import { isAuth } from "../middlewares/auth.js";
import uploadFile from "../middlewares/multer.js";
import {
  createCompany,
  createJob,
  deleteCompany,
  getAllCompany,
  getCompanyDetails,
  updateJob,
} from "../controllers/job.js";

const router = express.Router();

router.post("/company/new", isAuth, uploadFile, createCompany);
router.delete("/company/:companyId", isAuth, deleteCompany);
router.post("/new", isAuth, createJob);
router.get("/company/all", isAuth, getAllCompany);
router.get("/company/:id", isAuth, getCompanyDetails);

router.put("/:jobId", isAuth, updateJob);

export default router;
