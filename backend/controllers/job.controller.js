import { queryDB } from "../config/db.js";

export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experience, position, companyId } = req.body;
        const userId = req.id;

        if (!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId) {
            return res.status(400).json({
                message: "Somethin is missing.",
                success: false
            })
        };

        await queryDB('INSERT INTO jobs (title, description, requirements, salary, location, jobType, experienceLevel, position, companyId, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [title, description, requirements, Number(salary), location, jobType, experience, position, companyId, userId]);

        // Get the last inserted ID
        const [[{ id }]] = await queryDB('SELECT LAST_INSERT_ID() AS id');

        // Now, you can use this `id` to query the inserted job record
        const [[ job ]] = await queryDB('SELECT * FROM jobs WHERE id = ?', [id]);
         
        return res.status(201).json({
            message: "New job created successfully.",
            job,
            success: true
        });
    } catch (error) {
        console.log(error);
    }
}
export const getAllJobs = async (req, res) => {
    try {
        const state = req.query.state || "";
        const industry=req.query.industry || "";
        const salary = req.query.salary || "0";
        const minBorne=salary.split("-")[0];

        const query = `
            SELECT jobs.*, companies.name as company_name, companies.description as company_description, companies.location as company_location, companies.website as company_website
            FROM jobs
            JOIN companies ON jobs.companyId = companies.id
            WHERE (jobs.description LIKE ? OR jobs.title LIKE ? OR jobs.location LIKE ?) AND jobs.salary >= ?
            ORDER BY jobs.createdAt DESC;
        `;
        const [jobs] = await queryDB(query, [`%${industry}%`, `%${industry}%`, `%${state}%`,`%${minBorne}%` ]);

        if (jobs.length === 0) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
export const getJobById = async (req, res) => {
    //returns job+status

    try {
        const jobId = req.params.id;
        const userId = req.id;
        const query = `
            SELECT jobs.*, applications.status AS status, applications.applicantId
            FROM jobs
            LEFT JOIN applications 
                ON jobs.id = applications.jobId
            WHERE jobs.id = ? ;
        `;
    
        const [ jobs] = await queryDB(query, [jobId]);
        let userJobs=[];
        let job;
        userJobs = jobs.filter(job => job.applicantId === userId);
        if (userJobs.length > 0) {
            job = userJobs[0];
        } else {
            job = jobs[0];
            job.status = null;
        }
        return res.status(200).json({ job, success: true });
    } catch (error) {
        console.log(error);
    }
}
export const getAdminJobs = async (req, res) => {
    //returns job + company name
    try {
        const adminId = req.id;
        const query = `
            SELECT jobs.*, companies.name as company_name
            FROM jobs
            LEFT JOIN companies ON jobs.companyId = companies.id
            WHERE jobs.createdBy = ?;
        `;
        const [jobs] = await queryDB(query, [adminId]);
        if (jobs.length === 0) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
