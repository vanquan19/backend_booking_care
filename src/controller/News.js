import path from "path";
import app, { __dirname } from "../index.js";
import fs from "fs";
const TOPNEWS = 7;

class NewsController {
    routes() {
        app.get("/api/v1/get-top-news", this.getTopNews);
        app.get("/api/v1/get-news", this.getNews);
    }

    getTopNews(req, res) {
        const { limit } = req.query;
        fs.readFile(path.join(__dirname, "public", "news.json"), "utf8", (err, data) => {
            if (err) {
                console.log(err);
            } else {
                const news = JSON.parse(data);
                //get top 6 news
                const topNews = news.results.slice(0, limit ? limit : TOPNEWS);
                res.status(200).json({
                    isSuccess: true,
                    toltalNews: topNews.length,
                    results: topNews,
                });
            }
        });
    }

    getNews(req, res) {
        const { page, limit } = req.query;
        let startIndex = 0;
        let endIndex = 0;
        if (page && limit) {
            startIndex = (page - 1) * limit + TOPNEWS;
            endIndex = page * limit + TOPNEWS;
        }
        fs.readFile(path.join(__dirname, "public", "news.json"), "utf8", (err, data) => {
            if (err) {
                console.log(err);
            } else {
                const news = JSON.parse(data);
                const results = news.results.slice(startIndex, endIndex);
                res.status(200).json({
                    isSuccess: true,
                    totalNews: results.length,
                    results: results,
                    totalPage: Math.ceil(news.results.length / limit),
                });
            }
        });
    }
}
export default NewsController;
