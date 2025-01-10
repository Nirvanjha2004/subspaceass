"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const axios_1 = __importDefault(require("axios"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const options = {
    method: "GET",
    url: "https://youtube-transcriptor.p.rapidapi.com/transcript",
    params: {
        video_id: "",
        lang: "en",
    },
    headers: {
        "x-rapidapi-key": "6870df310bmsh23fbc826ceb19b8p1152acjsn86213df69511",
        "x-rapidapi-host": "youtube-transcriptor.p.rapidapi.com",
    },
};
app.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    options.params.video_id = req.body.video_id;
    const language = req.body.language;
    const length = req.body.length;
    const response = yield axios_1.default.request(options);
    if (response.data.error) {
        res.send(response.data.error);
        return;
    }
    console.log("response", response.data[0].transcriptionAsText);
    try {
        const response2 = yield fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: "Bearer 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",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "meta-llama/llama-3.1-70b-instruct:free",
                messages: [
                    {
                        role: "user",
                        content: `You are an expert summarizer and translator. Your task is to summarize the given text in a specific language and adjust the summary length to a desired percentage of the original text. Ensure the summary is clear, coherent, and retains key information.

Instructions:  "
- Language: ${language}  
- Length: ${length}% of the original text  
Text: ${response.data[0].transcriptionAsText}
`,
                    },
                ],
            }),
        });
        const response2Data = yield response2.json();
        console.log("response2", response2Data.choices[0].message.content);
        const summary = response2Data.choices[0].message.content;
        res.send(summary);
    }
    catch (error) {
        console.log("error", error);
    }
}));
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
