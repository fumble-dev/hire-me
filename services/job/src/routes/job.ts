import express from "express";
import { isAuth } from "../middlewares/auth.js";
import uploadFile from "../middlewares/multer.js";
import {
  createCompany,
  createJob,
  deleteCompany,
  getAllActiveJobs,
  getAllCompany,
  getApplicationForJob,
  getCompanyDetails,
  getSingleJob,
  updateApplication,
  updateJob,
} from "../controllers/job.js";

const router = express.Router();

router.post("/company/new", isAuth, uploadFile, createCompany);
router.delete("/company/:companyId", isAuth, deleteCompany);
router.post("/new", isAuth, createJob);
router.get("/company/all", isAuth, getAllCompany);
router.get("/company/:id", isAuth, getCompanyDetails);
router.get("/all", getAllActiveJobs);

router.put("/application/:id", isAuth, updateApplication);
router.get("/application/:jobId", isAuth, getApplicationForJob);
router.get("/:jobId", getSingleJob);
router.put("/:jobId", isAuth, updateJob);

export default router;
