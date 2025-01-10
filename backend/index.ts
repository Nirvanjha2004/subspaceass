import express, { Request, Response } from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

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

app.post("/", async (req: Request, res: Response) => {
  options.params.video_id = req.body.video_id;
  const language = req.body.language;
  const length = req.body.length;
  const response = await axios.request(options);
  if (response.data.error) {
    res.send(response.data.error);
    return;
  }
  console.log("response", response.data[0].transcriptionAsText);
  try {
    const response2 = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization:
            "Bearer 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",
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
      }
    );

    const response2Data = await response2.json();
    console.log("response2", response2Data.choices[0].message.content);
    const summary = response2Data.choices[0].message.content;
    res.send(summary);
  } catch (error) {
    console.log("error", error);
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
