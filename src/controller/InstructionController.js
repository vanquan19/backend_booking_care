import app from "../index.js";
import Instruction from "../model/Instruction.js";
class InstructionController {
    routes() {
        app.get("/api/v1/instruction/get", this.getInstruction);
        app.post("/api/v1/instruction/create", this.createInstruction);
        app.post("/api/v1/instruction/update", this.updateInstruction);
        app.delete("/api/v1/instruction/delete", this.deleteInstruction);
    }

    async getInstruction(req, res) {
        try {
            const instruction = new Instruction();
            const response = await instruction.get();
            return res.status(200).json(response);
        } catch (error) {
            console.log(error);

            return res.status(500).json({ error: error.message, isSuccess: false });
        }
    }

    async createInstruction(req, res) {
        try {
            const { content } = req.body;
            const instruction = new Instruction(content);
            const response = await instruction.save();
            return res.status(200).json(response);
        } catch (error) {
            return res.status(500).json({ error: error.message, isSuccess: false });
        }
    }

    async updateInstruction(req, res) {
        try {
            const { content } = req.body;
            const instruction = new Instruction(content);
            const response = await instruction.update();
            return res.status(200).json(response);
        } catch (error) {
            return res.status(500).json({ error: error.message, isSuccess: false });
        }
    }

    async deleteInstruction(req, res) {
        try {
            const instruction = new Instruction();
            const response = await instruction.delete();
            return res.status(200).json(response);
        } catch (error) {
            return res.status(500).json({ error: error.message, isSuccess: false });
        }
    }
}

export default new InstructionController();
