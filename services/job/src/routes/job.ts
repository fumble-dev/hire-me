import express from "express";
import { isAuth } from "../middleware/auth";
import {
  createCompany,
  createJob,
  deleteCompany,
  getAllActiveJobs,
  getAllApplicationForJob,
  getAllCompany,
  getCompanyDetails,
  getSingleJob,
  updateApplication,
  updateJob,
} from "../controllers/job";
import uploadFile from "../middleware/multer";

const router = express.Router();

router.post("/company/new", isAuth, uploadFile, createCompany);
router.delete("/company/:companyId", isAuth, deleteCompany);
router.post("/new", isAuth, createJob);
router.get("/company/all", isAuth, getAllCompany);
router.get("/company/:id", isAuth, getCompanyDetails);
router.get("/all", getAllActiveJobs);
router.get("/application/:jobId", isAuth, getAllApplicationForJob);
router.put("/application/update/:id", isAuth, updateApplication);

router.get("/:jobId", getSingleJob);
router.put("/:jobId", isAuth, updateJob);
export default router;
