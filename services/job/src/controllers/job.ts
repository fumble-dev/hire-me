import { application } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import getBuffer from "../utils/buffer.js";
import { sql } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";
import { applicationStatusUpdateTemplate } from "../template.js";
import { publishToTopic } from "../producer.js";

interface UploadResult {
  url: string;
  public_id: string;
}

export const createCompany = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) {
      throw new ErrorHandler(401, "Authentication required");
    }

    if (user.role !== "recruiter") {
      throw new ErrorHandler(403, "Only recruiter can create a company");
    }

    const { name, description, website } = req.body;
    if (!name || !description || !website) {
      throw new ErrorHandler(400, "All fields are required");
    }

    const existingCompany = await sql`
      SELECT company_id FROM companies WHERE name = ${name}
    `;

    if (existingCompany.length > 0) {
      throw new ErrorHandler(409, `Company "${name}" already exists`);
    }

    const file = req.file;
    if (!file) {
      throw new ErrorHandler(400, "Company logo file is required");
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
      INSERT INTO companies 
        (name, description, website, logo, logo_public_id, recruiter_id)
      VALUES 
        (${name}, ${description}, ${website}, ${data.url}, ${data.public_id}, ${user.user_id})
      RETURNING *
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
    if (!user) {
      throw new ErrorHandler(401, "Authentication required");
    }

    const companyId = Number(req.params.companyId);
    if (!companyId || isNaN(companyId)) {
      throw new ErrorHandler(400, "Invalid companyId");
    }

    const companies = await sql`
      SELECT logo_public_id 
      FROM companies 
      WHERE company_id = ${companyId} 
      AND recruiter_id = ${user.user_id}
    `;

    if (companies.length === 0) {
      throw new ErrorHandler(
        404,
        "Company not found or you are not authorized to delete it"
      );
    }

    // const { logo_public_id } = companies[0];

    // if (logo_public_id) {
    //   try {
    //     await axios.post(`${process.env.UPLOAD_SERVICE}/api/utils/upload`, {
    //       public_id: logo_public_id,
    //     });
    //   } catch (error) {
    //     console.log("Logo deletion failed but company delete will continue");
    //   }
    // }

    await sql`DELETE FROM companies WHERE company_id = ${companyId}`;

    res.json({
      message: "Company deleted successfully (jobs removed due to cascade)",
    });
  }
);

export const createJob = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  if (!user) {
    throw new ErrorHandler(401, "Authentication required");
  }

  if (user.role !== "recruiter") {
    throw new ErrorHandler(403, "Only recruiter can create a job");
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
    job_type === undefined ||
    work_location === undefined ||
    openings === undefined
  ) {
    throw new ErrorHandler(400, "All fields are required");
  }

  const [company] = await sql`
    SELECT company_id FROM companies 
    WHERE company_id = ${company_id} 
    AND recruiter_id = ${user.user_id}
  `;

  if (!company) {
    throw new ErrorHandler(404, "Company not found or unauthorized");
  }

  const [newJob] = await sql`
    INSERT INTO jobs 
    (title, description, salary, location, role, job_type, work_location, company_id, posted_by_recruiter_id, openings)
    VALUES
    (${title}, ${description}, ${salary}, ${location}, ${role}, ${job_type}, ${work_location}, ${company_id}, ${user.user_id}, ${openings})
    RETURNING *
  `;

  res.json({
    message: "Job posted successfully",
    job: newJob,
  });
});

export const updateJob = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  if (!user) {
    throw new ErrorHandler(401, "Authentication required");
  }

  if (user.role !== "recruiter") {
    throw new ErrorHandler(403, "Only recruiter can update a job");
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
    is_active,
  } = req.body;

  const { jobId } = req.params;
  if (!jobId) {
    throw new ErrorHandler(400, "Job Id is required to update a job");
  }

  const [existingJob] = await sql`
    SELECT posted_by_recruiter_id 
    FROM jobs 
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
      title = ${title},
      description = ${description},
      salary = ${salary},
      location = ${location},
      role = ${role},
      job_type = ${job_type},
      work_location = ${work_location},
      openings = ${openings},
      is_active = ${is_active},
      company_id = ${company_id}
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
    const user = req.user;

    if (!user) {
      throw new ErrorHandler(401, "Authentication required");
    }

    const companies = await sql`
      SELECT * FROM companies WHERE recruiter_id = ${user.user_id}
    `;

    res.json({
      count: companies.length,
      companies,
    });
  }
);

export const getCompanyDetails = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    if (!id) {
      throw new ErrorHandler(400, "Company Id is required");
    }

    const [companyData] = await sql`
      SELECT 
        c.*,
        COALESCE(
          (
            SELECT json_agg(j.*)
            FROM jobs j
            WHERE j.company_id = c.company_id
          ),
          '[]'::json
        ) AS jobs
      FROM companies c
      WHERE c.company_id = ${id}
      GROUP BY c.company_id
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
        j.job_id, 
        j.title, 
        j.description, 
        j.salary, 
        j.location, 
        j.job_type,
        j.role, 
        j.work_location, 
        j.created_at,
        c.name AS company_name, 
        c.logo AS company_logo, 
        c.company_id
      FROM jobs j
      JOIN companies c ON j.company_id = c.company_id
      WHERE j.is_active = true
    `;

  const values: any[] = [];
  let paramsIndex = 1;

  if (title) {
    queryString += ` AND j.title ILIKE $${paramsIndex}`;
    values.push(`%${title}%`);
    paramsIndex++;
  }

  if (location) {
    queryString += ` AND j.location ILIKE $${paramsIndex}`;
    values.push(`%${location}%`);
    paramsIndex++;
  }

  queryString += ` ORDER BY j.created_at DESC`;

  const jobs = (await sql.query(queryString, values)) as any;

  res.json(jobs);
});

export const getSingleJob = TryCatch(async (req, res) => {
  const { job_id } = req.params;

  if (!job_id) {
    throw new ErrorHandler(400, "Job ID is required");
  }

  const [job] = await sql`
    SELECT * FROM jobs WHERE job_id = ${job_id}
  `;

  if (!job) {
    throw new ErrorHandler(404, "Job not found");
  }

  res.json(job);
});

export const getApplicationForJob = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) {
      throw new ErrorHandler(401, "Authentication required");
    }

    if (user.role !== "recruiter") {
      throw new ErrorHandler(403, "Only recruiter can access the applications");
    }

    const { jobId } = req.params;

    if (!jobId) {
      throw new ErrorHandler(400, "Job ID is required");
    }

    const [job] = await sql`
      SELECT posted_by_recruiter_id 
      FROM jobs 
      WHERE job_id = ${jobId}
    `;

    if (!job) {
      throw new ErrorHandler(404, "Job not found");
    }

    if (job.posted_by_recruiter_id !== user.user_id) {
      throw new ErrorHandler(403, "Forbidden: You are not allowed");
    }

    const applications = await sql`
      SELECT * 
      FROM applications 
      WHERE job_id = ${jobId} 
      ORDER BY subscribed DESC, applied_at ASC
    `;

    res.json(applications);
  }
);

export const updateApplication = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) {
      throw new ErrorHandler(401, "Authentication required");
    }

    if (user.role !== "recruiter") {
      throw new ErrorHandler(403, "Only recruiter can access this");
    }

    const { id } = req.params;
    if (!id) {
      throw new ErrorHandler(400, "Application Id is required");
    }

    const [application] = await sql`
      SELECT * FROM applications WHERE application_id = ${id}
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
      throw new ErrorHandler(404, "No job with this id");
    }

    if (job.posted_by_recruiter_id !== user.user_id) {
      throw new ErrorHandler(403, "Forbidden: You are not allowed");
    }

    const [updatedApplication] = await sql`
      UPDATE applications 
      SET status = ${req.body.status}
      WHERE application_id = ${id}
      RETURNING *
    `;

    const message = {
      to: application.applicant_email,
      subject: "Application Update - Hire Me",
      html: applicationStatusUpdateTemplate(job.title),
    };

    publishToTopic("send-mail", message).catch((error) => {
      console.error("Failed to Publish Message to Kafka", error);
    });

    res.json({
      message: "Application Updated",
      updatedApplication,
    });
  }
);
