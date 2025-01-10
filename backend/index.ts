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
    "x-rapidapi-key": "dfe94a4d6fmshf1dab4eadb04132p1b5c4ejsn2be74ce3b5be",
    "x-rapidapi-host": "youtube-transcriptor.p.rapidapi.com",
  },
};

app.post("/", async (req: Request, res: Response) => {
  options.params.video_id = req.body.video_id;
  const language = req.body.language;
  const length = req.body.length;
  const response = await axios.request(options);
  //   console.log("response", response.data[0].transcriptionAsText);
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
    // console.log("response2", response2Data.choices[0].message.content);
    res.send(response2Data.choices[0].message.content);
  } catch (error) {
    console.log("error", error);
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
