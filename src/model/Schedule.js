import generateDate from "../utils/calendar.js";
import db from "../config/db.js";
import dayjs from "dayjs";

class Schedule {
    constructor(id, date, month, year, time) {
        this.id = id;
        this.date = date;
        this.month = month;
        this.year = year;
        this.time = time;
    }

    async getSchedule(clinicId, userId) {
        try {
            const [doctor] = await db.query(`SELECT specialize FROM doctor WHERE userId = '${userId}'`);
            const query = `SELECT  date, month, year, GROUP_CONCAT(id) AS listProfile FROM historybooking 
                WHERE clinicId = '${clinicId}' AND doctorId = '${userId}' AND status between 2 AND 3
                GROUP BY date, month, year 
              `;

            const [rows] = await db.query(query);

            const generateSchedule = generateDate(this.month || dayjs().month(), this.year || dayjs().year(), rows);

            const currentDate = generateSchedule.find((item) => item.today === true);

            return {
                currentDate: currentDate,
                isSuccess: true,
                data: generateSchedule,
            };
        } catch (error) {
            console.log(error);
            return {
                isSuccess: false,
                message: "Error when getting schedule",
            };
        }
    }

    // Getters
    getId() {
        return this.id;
    }
    getDate() {
        return this.date;
    }
    getMonth() {
        return this.month;
    }
    getYear() {
        return this.year;
    }
    getTime() {
        return this.time;
    }

    // Setters
    setId(id) {
        this.id = id;
    }
    setDate(date) {
        this.date = date;
    }
    setMonth(month) {
        this.month = month;
    }
    setYear(year) {
        this.year = year;
    }
    setTime(time) {
        this.time = time;
    }
}

export default Schedule;
