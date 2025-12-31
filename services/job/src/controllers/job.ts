import axios from "axios";
import { AuthenticatedRequest } from "../middleware/auth";
import { getBuffer } from "../utils/buffer";
import { sql } from "../utils/db";
import ErrorHandler from "../utils/errorHandler";
import { TryCatch } from "../utils/TryCatch";
import { applicationStatusUpdateTemplate } from "../template";
import { publishToTopic } from "../producer";

interface UploadResult {
  url: string;
  public_id: string;
}

export const createCompany = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) {
      throw new ErrorHandler(401, "Authentication Required");
    }

    if (user.role !== "recruiter") {
      throw new ErrorHandler(
        403,
        "Forbidden: Only recruiter can create a company"
      );
    }

    const { name, description, website } = req.body;
    if (!name || !description || !website) {
      throw new ErrorHandler(400, "All the fields are required");
    }

    const existingCompanies = await sql`
        SELECT company_id FROM companies WHERE name = ${name}
    `;
    if (existingCompanies.length !== 0) {
      throw new ErrorHandler(
        409,
        `Company with the name ${name} already exists`
      );
    }

    const file = req.file;
    if (!file) {
      throw new ErrorHandler(400, "Company Logo is required");
    }

    if (!file.mimetype.startsWith("image/")) {
      throw new ErrorHandler(400, "Only image files are allowed");
    }

    const fileBuffer = getBuffer(file);
    if (!fileBuffer || !fileBuffer.content) {
      throw new ErrorHandler(500, "Failed to create file buffer");
    }

    const { data } = await axios.post<UploadResult>(
      `${process.env.UPLOAD_SERVICE}/api/utils/upload`,
      { buffer: fileBuffer.content }
    );

    const [newCompany] = await sql`
        INSERT INTO companies  (name,description, website, logo, logo_public_id, recruiter_id)
        VALUES(${name},${description},${website},${data.url},${data.public_id},${req.user?.user_id})
        RETURNING *;
    `;

    res.json({
      message: "Company created successfully",
      company: newCompany,
    });
  }
);

export const deleteCompany = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) throw new ErrorHandler(401, "Authentication Required");

    if (user.role !== "recruiter") {
      throw new ErrorHandler(403, "Only recruiters can delete companies");
    }

    const { companyId } = req.params;

    const [company] = await sql`
      SELECT logo_public_id 
      FROM companies 
      WHERE company_id = ${companyId}
      AND recruiter_id = ${user.user_id}
    `;

    if (!company) {
      throw new ErrorHandler(
        404,
        "Company not found or you're not authorized to delete it"
      );
    }

    await sql`DELETE FROM companies WHERE company_id = ${companyId}`;

    await axios.delete(`${process.env.UPLOAD_SERVICE}/api/utils/delete`, {
      //@ts-ignore
      data: {
        public_id: company.logo_public_id,
      },
    });

    res.json({
      message: "Company and all associated jobs have been deleted",
    });
  }
);

export const createJob = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  if (!user) throw new ErrorHandler(401, "Authentication Required");

  if (user.role !== "recruiter") {
    throw new ErrorHandler(403, "Only recruiters can create jobs");
  }

  const {
    title,
    description,
    salary,
    location,
    role,
    job_type,
    work_location,
    company_id,
    openings,
  } = req.body;

  if (
    !title ||
    !description ||
    salary === undefined ||
    !location ||
    !role ||
    openings === undefined ||
    !job_type ||
    !work_location ||
    !company_id
  ) {
    throw new ErrorHandler(400, "All fields are required");
  }

  const [company] = await sql`
    SELECT company_id 
    FROM companies 
    WHERE company_id = ${company_id}
    AND recruiter_id = ${user.user_id}
  `;

  if (!company) {
    throw new ErrorHandler(404, "Company not found");
  }

  const [newJob] = await sql`
    INSERT INTO jobs (
      title,
      description,
      salary,
      location,
      role,
      job_type,
      work_location,
      company_id,
      posted_by_recruiter_id,
      openings
    )
    VALUES (
      ${title},
      ${description},
      ${salary},
      ${location},
      ${role},
      ${job_type},
      ${work_location},
      ${company_id},
      ${user.user_id},
      ${openings}
    )
    RETURNING *;
  `;

  res.json({
    message: "Job posted successfully",
    job: newJob,
  });
});

export const updateJob = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  if (!user) throw new ErrorHandler(401, "Authentication Required");

  if (user.role !== "recruiter") {
    throw new ErrorHandler(403, "Only recruiters can update jobs");
  }

  const {
    title,
    description,
    salary,
    location,
    role,
    job_type,
    work_location,
    openings,
    is_active,
  } = req.body;

  const { jobId } = req.params;

  const [existingJob] = await sql`
    SELECT posted_by_recruiter_id FROM jobs
    WHERE job_id = ${jobId}
  `;
  if (!existingJob) {
    throw new ErrorHandler(404, "Job not found");
  }

  if (existingJob.posted_by_recruiter_id !== user.user_id) {
    throw new ErrorHandler(403, "Forbidden: You are not allowed");
  }

  const [updatedJob] = await sql`
  UPDATE jobs
  SET
    title = COALESCE(${title}, title),
    description = COALESCE(${description}, description),
    salary = COALESCE(${salary}, salary),
    role = COALESCE(${role}, role),
    location = COALESCE(${location}, location),
    job_type = COALESCE(${job_type}, job_type),
    work_location = COALESCE(${work_location}, work_location),
    is_active = COALESCE(${is_active}, is_active),
    openings = COALESCE(${openings}, openings)
  WHERE job_id = ${jobId}
  RETURNING *;
`;

  res.json({
    message: "Job updated successfully",
    job: updatedJob,
  });
});

export const getAllCompany = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const companies = await sql`
    SELECT * FROM companies WHERE recruiter_id = ${req.user?.user_id}
  `;

    res.json(companies);
  }
);

export const getCompanyDetails = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    if (!id) {
      throw new ErrorHandler(400, "Company id is required");
    }

    const [companyData] = await sql`
      SELECT c.*, COALESCE  (
        (
          SELECT json_agg(j.*) FROM jobs j WHERE 
          j.company_id = c.company_id
        ),
        '[]'::json
      ) AS jobs
       FROM companies c WHERE c.company_id = ${id} GROUP BY c.company_id;
    `;
    if (!companyData) {
      throw new ErrorHandler(404, "Company not found");
    }

    res.json(companyData);
  }
);

export const getAllActiveJobs = TryCatch(async (req, res) => {
  const { title, location } = req.query as {
    title?: string;
    location?: string;
  };

  let queryString = `
    SELECT 
      j.job_id, j.title, j.description, j.salary, j.location,
      j.job_type, j.role, j.work_location, j.created_at,
      c.name AS company_name, c.logo AS company_logo, c.company_id
    FROM jobs j
    JOIN companies c ON j.company_id = c.company_id
    WHERE j.is_active = true
  `;

  const values: any[] = [];
  let i = 1;

  if (title) {
    queryString += ` AND j.title ILIKE $${i++}`;
    values.push(`%${title}%`);
  }

  if (location) {
    queryString += ` AND j.location ILIKE $${i++}`;
    values.push(`%${location}%`);
  }

  queryString += ` ORDER BY j.created_at DESC`;

  const jobs = await sql.query(queryString, values);
  res.json(jobs);
});

export const getSingleJob = TryCatch(async (req, res) => {
  const [job] = await sql`
    SELECT * FROM jobs WHERE job_id = ${req.params.jobId}
  `;

  res.json(job);
});

export const getAllApplicationForJob = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) throw new ErrorHandler(401, "Authentication Required");

    if (user.role !== "recruiter") {
      throw new ErrorHandler(403, "Only recruiters can update jobs");
    }

    const { jobId } = req.params;
    if (!jobId) {
      throw new ErrorHandler(400, "Job id is required");
    }

    const [job] = await sql`
      SELECT posted_by_recruiter_id FROM jobs WHERE job_id = ${jobId}
    `;
    if (!job) {
      throw new ErrorHandler(404, "Job not found");
    }

    if (job.posted_by_recruiter_id !== user.user_id) {
      throw new ErrorHandler(403, "Forbidden you're not allowed");
    }

    const applications = await sql`
      SELECT * FROM applications WHERE job_id = ${jobId}  
      ORDER BY subscribed DESC, applied_at ASC
    `;

    res.json(applications);
  }
);

export const updateApplication = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) {
      throw new ErrorHandler(401, "Authentication Required");
    }

    if (user.role !== "recruiter") {
      throw new ErrorHandler(403, "Only recruiters can update applications");
    }

    const applicationId = Number(req.params.id);
    if (!applicationId || Number.isNaN(applicationId)) {
      throw new ErrorHandler(400, "Invalid application id");
    }

    const { status } = req.body;

    const allowedStatuses = ["Submitted", "Rejected", "Hired"];
    if (!allowedStatuses.includes(status)) {
      throw new ErrorHandler(400, "Invalid application status");
    }

    const [application] = await sql`
      SELECT * FROM applications WHERE application_id = ${applicationId}
    `;

    if (!application) {
      throw new ErrorHandler(404, "Application not found");
    }

    const [job] = await sql`
      SELECT posted_by_recruiter_id, title
      FROM jobs
      WHERE job_id = ${application.job_id}
    `;

    if (!job) {
      throw new ErrorHandler(404, "Job not found");
    }

    if (job.posted_by_recruiter_id !== user.user_id) {
      throw new ErrorHandler(403, "Forbidden: Not your job posting");
    }

    const [updatedApplication] = await sql`
      UPDATE applications
      SET status = ${status}
      WHERE application_id = ${applicationId}
      RETURNING *;
    `;

    // fire-and-forget email notification
    publishToTopic("send-mail", {
      to: application.applicant_email,
      subject: "Application Update - HireMe",
      html: applicationStatusUpdateTemplate(job.title),
    }).catch((err) => {
      console.error("Kafka publish failed:", err);
    });

    res.json({
      message: "Application updated successfully",
      job,
      updatedApplication
    });
  }
);
