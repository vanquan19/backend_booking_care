import QuestionAndAnswer from "../model/Q&A.js";
import app from "../index.js";

class QuestionAndAnswerController {
    routes() {
        app.get("/api/v1/question-and-answer/get-all", this.getAll);
        app.get("/api/v1/question-and-answer/get-by-id/:id", this.getById);
        app.post("/api/v1/question-and-answer/create", this.createQuestionAndAnswer);
        app.post("/api/v1/question-and-answer/update", this.updateQuestionAndAnswer);
        app.delete("/api/v1/question-and-answer/delete/:id", this.deleteQuestionAndAnswer);
    }

    async getAll(req, res) {
        try {
            const { search, type } = req.query;
            const questionAndAnswer = new QuestionAndAnswer();
            const response = await questionAndAnswer.getAll(search, type);
            return res.status(200).json(response);
        } catch (error) {
            return res.status(500).json({ error: error.message, isSuccess: false });
        }
    }

    async getById(req, res) {
        try {
            const id = req.params.id;
            const questionAndAnswer = new QuestionAndAnswer();
            const response = await questionAndAnswer.getById(id);
            return res.status(200).json(response);
        } catch (error) {
            return res.status(500).json({ error: error.message, isSuccess: false });
        }
    }

    async createQuestionAndAnswer(req, res) {
        try {
            const { question, answer, type } = req.body;
            const questionAndAnswer = new QuestionAndAnswer(question, answer, type);
            const response = await questionAndAnswer.save();
            return res.status(200).json(response);
        } catch (error) {
            return res.status(500).json({ error: error.message, isSuccess: false });
        }
    }

    async updateQuestionAndAnswer(req, res) {
        try {
            const { question, answer, type, id } = req.body;
            const questionAndAnswer = new QuestionAndAnswer(question, answer, type);
            const response = await questionAndAnswer.update(id);
            return res.status(200).json(response);
        } catch (error) {
            return res.status(500).json({ error: error.message, isSuccess: false });
        }
    }

    async deleteQuestionAndAnswer(req, res) {
        try {
            const id = req.params.id;
            const questionAndAnswer = new QuestionAndAnswer();
            const response = await questionAndAnswer.delete(id);
            return res.status(200).json(response);
        } catch (error) {
            return res.status(500).json({ error: error.message, isSuccess: false });
        }
    }
}

export default new QuestionAndAnswerController();
