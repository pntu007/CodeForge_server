import User from '../models/userModel.js';
import Question from '../models/questionModel.js';
import Lab from '../models/labModel.js';
import Report from '../models/reportModal.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const createData = async (labId, userId, questionId, count, script) => {
    const reportName = labId + userId;
    let report = await Report.findOne({ name: reportName });

    if (report) {
        let questionIndex = report.questions.findIndex(q => q.questionId.toString() === questionId);

        if (questionIndex !== -1) {
            report.questions[questionIndex].count = count;
            report.questions[questionIndex].script = script;
        } 
        else {
            report.questions.push({ questionId, count, script });
        }

        await report.save(); 
    } 
    else {
        const user = await User.findById(userId);

        const newReport = new Report({
            name: reportName,
            rollNumber: user.rollNumber,
            studentName: user.name,
            questions: [
                { questionId, count, script }
            ]
        });

        await newReport.save(); 
    }
};

const sendReport = tryCatch(async(labId,next)=>{
    const lab = await Lab.findById({ labId });
    if(!lab) return next(new ErrorHandler("Invalid id", 404));

    const reports = await Report.find({ name: { $regex: `^${labId}` } });
    if(!reports) return next(new ErrorHandler("Invalid id", 404));

    const response = reports.map(report => {
        let formattedReport = {
            rollNumber: report.rollNumber,
            name: report.studentName,
        };

        report.questions.forEach((question, index) => {
            formattedReport[`question${index + 1}`] = question.count;
            formattedReport[`code${index + 1}`] = question.script;
        });
        
        return formattedReport;
    });

    lab.report = response;
    await lab.save();
});

export { createData, sendReport }