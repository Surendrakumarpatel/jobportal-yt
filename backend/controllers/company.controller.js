import { queryDB } from "../config/db.js";

export const registerCompany = async (req, res) => {
    try {
        const { companyName } = req.body;

        if (!companyName) {
            return res.status(400).json({
                message: "Company name is required.",
                success: false
            });
        }
        // let company = await Company.findOne({ name: companyName });
        const [[company]]=await queryDB('select * from companies where name = ?',[companyName])

        if (company) {
            return res.status(400).json({
                message: "You can't register same company.",
                success: false
            })
        };

        await queryDB('insert into companies (name, userId) values (?, ?)', [companyName, req.id]);
        // company = await Company.create({
        //     name: companyName,
        //     userId: req.id
        // });

        // Get the last inserted ID
        const [[{ id }]] = await queryDB('SELECT LAST_INSERT_ID() AS id');

        // Now, you can use this `id` to query the inserted job record
        const [[ addedCompany ]] = await queryDB('SELECT * FROM companies WHERE id = ?', [id]);

        return res.status(201).json({
            message: "Company registered successfully.",
            company:addedCompany,
            success: true
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error while registering company.",
            sucess: false
        })
    }
}
export const getCompany = async (req, res) => {
    try {
        const userId = req.id; // logged in user id

        // const companies = await Company.find({ userId });
        const [companies] = await queryDB('select * from companies where userId = ?',[userId]);

        if ( companies.length==0 ) {
            return res.status(404).json({
                message: "Companies not found.",
                success: false
            })
        }
        return res.status(200).json({
            companies,
            success:true
        })
    } catch (error) {
        console.log(error);
    }
}
// get company by id
export const getCompanyById = async (req, res) => {
    try {
        const companyId = req.params.id;
        // const company = await Company.findById(companyId);
        const [[company]] = await queryDB('select * from companies where id = ?',[companyId]);

        if (!company) {
            return res.status(404).json({
                message: "Company not found.",
                success: false
            })
        }
        return res.status(200).json({
            company,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
export const updateCompany = async (req, res) => {
    try {
        const { name, description, website, location } = req.body;
        const companyId = req.params.id;
 
        // const file = req.file;
        // idhar cloudinary ayega
        // const fileUri = getDataUri(file);
        // const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
        // const logo = cloudResponse.secure_url;

        const query = `
            UPDATE companies
            SET name = ?, description = ?, website = ?, location = ?
            WHERE id = ?;
        `;

        const [result] = await queryDB(query, [name, description, website, location, companyId]);
        // const company = await Company.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Company not found.",
                success: false
            })
        }
        return res.status(200).json({
            message:"Company information updated.",
            success:true
        })

    } catch (error) {
        console.log(error);
    }
}