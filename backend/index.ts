import express, { Request, Response } from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors({ origin: "https://subspaceass.vercel.app/" })); // Handle preflight requests
app.use(express.json());

const options = {
  method: "GET",
  url: "https://youtube-transcriptor.p.rapidapi.com/transcript",
  params: {
    video_id: "",
    lang: "en",
  },
  headers: {
    "x-rapidapi-key": "16fa35971bmsh9ecc462cf8e1317p1de334jsnb9b08f5bab6b",
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

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
