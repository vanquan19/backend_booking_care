import app from "../index.js";
import Contact from "../model/Contact.js";

class ContactController {
    routes() {
        app.get("/api/v1/contacts/get", this.getContacts);
        app.post("/api/v1/contacts/create", this.createContact);
        app.put("/api/v1/contacts/update", this.updateContact);
        app.get("/api/v1/contacts/get-amount", this.getAmount);
    }

    async getContacts(req, res) {
        try {
            const { status } = req.query;
            const contact = new Contact();
            contact.setStatus(status);
            const response = await contact.get();
            if (response.isSuccess) {
                return res.status(200).json({
                    isSuccess: true,
                    data: response.data,
                });
            } else {
                return res.status(500).json({
                    isSuccess: false,
                    message: response.message,
                });
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                isSuccess: false,
                message: err.message,
            });
        }
    }

    async createContact(req, res) {
        try {
            const { name, email, phone, description, status } = req.body;
            const contact = new Contact(name, email, phone, description, status);
            const response = await contact.save();
            if (response.isSuccess) {
                return res.status(200).json({
                    isSuccess: true,
                    message: response.message,
                });
            } else {
                return res.status(500).json({
                    isSuccess: false,
                    message: response.message,
                });
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                isSuccess: false,
                message: err.message,
            });
        }
    }

    async updateContact(req, res) {
        try {
            const { id, status } = req.body;
            console.log(id, status);

            const contact = new Contact();
            contact.setId(id);
            contact.setStatus(status);
            const response = await contact.updateStatus();
            if (response.isSuccess) {
                return res.status(200).json({
                    isSuccess: true,
                    message: response.message,
                });
            } else {
                return res.status(500).json({
                    isSuccess: false,
                    message: response.message,
                });
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                isSuccess: false,
                message: err.message,
            });
        }
    }

    async getAmount(req, res) {
        try {
            const contact = new Contact();
            const response = await contact.getAmount();
            if (response.isSuccess) {
                return res.status(200).json({
                    isSuccess: true,
                    data: response.data,
                });
            } else {
                return res.status(500).json({
                    isSuccess: false,
                    message: response.message,
                });
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                isSuccess: false,
                message: err.message,
            });
        }
    }
}
export default new ContactController();
