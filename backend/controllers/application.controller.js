import { queryDB } from "../config/db.js";

export const applyJob = async (req, res) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;
        if (!jobId) {
            return res.status(400).json({
                message: "Job id is required.",
                success: false
            })
        };
  
        // check if the jobs exists
        // const job = await Job.findById(jobId);
        const [[job]]=await queryDB('SELECT * FROM jobs WHERE id = ?', [jobId]);
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            })
        }

        // check if the user has already applied for the job
        const [[existingApplication]] = await queryDB('SELECT * FROM applications WHERE jobId = ? AND applicantId = ?', [jobId, userId]);

        if (existingApplication) {
            return res.status(400).json({
                message: "You have already applied for this jobs",
                success: false
            });
        } 

        // create a new application
        await queryDB('INSERT INTO applications (jobId, applicantId, status) VALUES (?, ?, ?)', [jobId, userId,"pending"]);

        // const newApplication = await Application.create({
        //     job:jobId,
        //     applicant:userId,
        // });

        // job.applications.push(newApplication.id);
        // await job.save();
        return res.status(201).json({
            message:"Job applied successfully.",
            success:true
        })
    } catch (error) {
        console.log(error);
    }
};
export const getAppliedJobs = async (req,res) => {
    try {
        const userId = req.id;

        // const application = await Application.find({applicant:userId}).sort({createdAt:-1}).populate({
        //     path:'job',
        //     options:{sort:{createdAt:-1}},
        //     populate:{
        //         path:'company',
        //         options:{sort:{createdAt:-1}},
        //     }
        // });

        const query = `
            SELECT applications.*, jobs.title AS title, companies.name AS company_name
            FROM applications
            LEFT JOIN jobs ON jobs.id = applications.jobId
            LEFT JOIN companies ON companies.id = jobs.companyId
            WHERE applications.applicantId = ?
            ORDER BY applications.createdAt DESC;
        `;

        const [ applications ] = await queryDB(query,[userId]);
        
        if(applications.length === 0){
            return res.status(404).json({
                message:"No Applications",
                success:false
            })
        };
        return res.status(200).json({
            applications,
            success:true
        })
    } catch (error) {
        console.log(error);
    }
}

export const getApplicants = async (req,res) => {
    try {
        const jobId = req.params.id;
        // const job = await Job.findById(jobId).populate({
        //     path:'applications',
        //     options:{sort:{createdAt:-1}},
        //     populate:{
        //         path:'applicant'
        //     }
        // });

        const query = `
            SELECT users.fullname, users.email, users.phoneNumber, applications.createdAt as application_createdAt, applications.status as application_status, applications.id as application_id
            FROM applications
            LEFT JOIN users ON users.id = applications.applicantId
            WHERE applications.jobId = ?
            ORDER BY applications.createdAt DESC;
    `;

       // Execute the query with the jobId parameter
        const [ applications ] = await queryDB(query, [jobId]);      

        // if(applications.length == 0){
        //     return res.status(404).json({
        //         message:'Job not found.',
        //         success:false
        //     })
        // };
        return res.status(200).json({
            applications, 
            succeess:true
        });
    } catch (error) {
        console.log(error);
    }
}
export const updateStatus = async (req,res) => {
    try {
        const {status} = req.body;
        const applicationId = req.params.id;
        
        // check if the status is valid
        const validStatuses = ['pending', 'accepted', 'rejected'];
        if (!validStatuses.includes(status.toLowerCase())) {
            return res.status(400).json({
                message: 'Invalid status value.',
                success: false
            });
        }

        // find the application by applicantion id
        // const application = await Application.findOne({id:applicationId});
        const [[application]] = await queryDB(
            "SELECT * FROM applications WHERE id = ? ORDER BY createdAt DESC", 
            [applicationId]
        );
        if(!application){
            return res.status(404).json({
                message:"Application not found.",
                success:false
            })
        };

        // update the status
        await queryDB('UPDATE applications SET status = ? WHERE id = ?', [status.toLowerCase(), applicationId]);
        // application.status = status.toLowerCase();
        // await application.save();

        return res.status(200).json({
            message:"Status updated successfully.",
            success:true
        });

    } catch (error) {
        console.log(error);
    }
}