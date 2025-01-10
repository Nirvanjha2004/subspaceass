import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Youtube,
  Sparkles,
  Clock,
  Bot,
  Languages,
  AlignJustify,
  History,
  Wand2,
  HardDrive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import axios from "axios";
import { useSignOut } from "@nhost/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import "./App.css";
import { nhost } from "./lib/nhost";
import { useNavigate } from "react-router-dom";

let videoId: string | null = null;

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "zh", label: "Chinese" },
];

function App() {
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("en");
  const [length, setLength] = useState([50]);
  const [isSummarizing, setIsSummarizing] = useState(false); // For the Summarize button
  const [isUploading, setIsUploading] = useState(false); // For the Upload button
  const [savedSummaries, setSavedSummaries] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { signOut } = useSignOut();

  function getYouTubeVideoId(url: string) {
    const regex =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  useEffect(() => {
    const userId = nhost.auth.getUser()?.id;

    if (!userId) {
      console.warn("User not logged in.");
      return;
    }

    setLoadingHistory(true);

    fetchSavedSummaries(userId)
      .then((summaries) => {
        setSavedSummaries(summaries);
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "Failed to fetch summary history. Error: " + error,      
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoadingHistory(false);
      });
  }, []);

  async function saveSummary(userId: string, videoId: string, summary: string) {
    const mutation = `
      mutation InsertUserSummary($userId: uuid!, $videoId: String!, $summary: String!) {
        insert_user_summaries(objects: { user_id: $userId, video_id: $videoId, summary: $summary }) {
          affected_rows
        }
      }
    `;

    const variables = { userId, videoId, summary };

    try {
      const response = await nhost.graphql.request(mutation, variables);

      // Check for errors
      if (response.error) {
        console.error("GraphQL Error:", response.error);
      }

      // Handle success
      console.log(
        "Rows affected:",
        response.data.insert_user_summaries.affected_rows
      );
      return response.data.insert_user_summaries.affected_rows;
    } catch (error) {
      console.error("Unexpected error saving summary:", error);
      throw error;
    }
  }

  async function fetchSavedSummaries(userId: string) {
    const query = `
      query GetUserSummaries($userId: uuid!) {
        user_summaries(where: { user_id: { _eq: $userId } }) {
          video_id
          summary
        }
      }
    `;

    const variables = { userId };

    try {
      const response = await nhost.graphql.request(query, variables);

      if (response.error) {
        console.error("GraphQL Error:", response.error);
      }

      return response.data.user_summaries; // Return the summaries
    } catch (error) {
      console.error("Unexpected error fetching summaries:", error);
      throw error;
    }
  }

  const logout = () => {
    signOut();
    navigate("/signup");
  };

  const summarizeVideo = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid YouTube URL",
        variant: "destructive",
      });
      return;
    }

    setIsSummarizing(true);

    try {
      videoId = getYouTubeVideoId(url);

      if (!videoId) {
        toast({
          title: "Error",
          description: "Invalid YouTube URL",
          variant: "destructive",
        });
        setIsSummarizing(false);
        return;
      }

      const response = await axios.post("http://localhost:3000", {
        url,
        video_id: videoId,
        language,
        length,
      });

      setSummary(response.data); // Set the summarized content
      toast({
        title: "Success",
        description: "Summary generated successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error summarizing video:", error);
      toast({
        title: "Error",
        description: "Failed to generate summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSaveSummary = async () => {
    if (!videoId || !summary.trim()) {
      toast({
        title: "Error",
        description: "No summary available to save.",
        variant: "destructive",
      });
      return;
    }

    const userId = nhost.auth.getUser()?.id; // Get the authenticated user ID

    if (!userId) {
      toast({
        title: "Error",
        description: "Please login to save your summary",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const savedSummary = await saveSummary(userId, videoId, summary);

      if (savedSummary) {
        toast({
          title: "Success",
          description: "Summary saved successfully!",
          variant: "default",
        });
      } else {
        throw new Error("Failed to save summary.");
      }
    } catch (error) {
      console.error("Error saving summary:", error);
      toast({
        title: "Error",
        description: "Failed to save summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a YouTube URL",
        variant: "destructive",
      });
      return;
    }
    setLoading(false);
    await summarizeVideo();
    setLoading(true);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-secondary">
      <Button
        variant="outline"
        className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
        onClick={logout}
      >
        Logout
      </Button>
      <div className="w-full min-h-screen flex flex-col">
        <div className="flex-1 w-full px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto w-full flex flex-col items-center space-y-8"
          >
            {/* Header */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left w-full"
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-purple-600 rounded-full blur opacity-75"></div>
                <div className="relative bg-background rounded-full p-3">
                  <Youtube className="h-12 w-12 text-red-500" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-purple-600">
                  YouTube Summarizer
                </h1>
                <p className="text-muted-foreground mt-1">
                  Transform long videos into concise summaries
                </p>
              </div>
            </motion.div>

            {/* Main Content */}
            <div className="w-full">
              <Tabs defaultValue="summarize" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger
                    value="summarize"
                    className="flex items-center gap-2"
                  >
                    <Wand2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Summarize</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="flex items-center gap-2"
                  >
                    <History className="h-4 w-4" />
                    <span className="hidden sm:inline">History</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="summarize" className="w-full">
                  <Card className="p-4 sm:p-6 w-full">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* URL Input */}
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Input
                            type="url"
                            placeholder="Paste YouTube URL here..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            type="submit"
                            disabled={isSummarizing}
                            className="w-full sm:w-auto"
                          >
                            {isSummarizing ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                                className="flex items-center gap-2"
                              >
                                <Sparkles className="h-4 w-4" />
                                <span>Processing...</span>
                              </motion.div>
                            ) : (
                              <span className="flex items-center gap-2">
                                <Wand2 className="h-4 w-4" />
                                <span>Summarize</span>
                              </span>
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <Languages className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Output Language</span>
                          </div>
                          <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Language" />
                            </SelectTrigger>
                            <SelectContent>
                              {languages.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value}>
                                  {lang.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          onClick={handleSaveSummary}
                          className="w-full sm:w-auto"
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              className="flex items-center gap-2"
                            >
                              <HardDrive className="h-4 w-4" />
                              <span>Saving...</span>
                            </motion.div>
                          ) : (
                            <span className="flex items-center gap-2">
                              <HardDrive className="h-4 w-4" />
                              <span>Upload</span>
                            </span>
                          )}
                        </Button>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <AlignJustify className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                Summary Length
                              </span>
                            </div>
                            <span className="text-muted-foreground">
                              {length}%
                            </span>
                          </div>
                          <Slider
                            value={length}
                            onValueChange={setLength}
                            min={10}
                            max={100}
                            step={10}
                            className="py-2"
                          />
                        </div>
                      </div>
                    </form>
                  </Card>

                  {/* Summary Result */}
                  {summary && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="mt-6 w-full"
                    >
                      <Card className="p-4 sm:p-6">
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center space-x-2">
                              <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-red-500 rounded-full blur opacity-75"></div>
                                <div className="relative bg-background rounded-full p-1.5">
                                  <Bot className="h-5 w-5 text-primary" />
                                </div>
                              </div>
                              <h2 className="text-xl font-semibold">Summary</h2>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <Languages className="h-4 w-4" />
                                <span>
                                  {
                                    languages.find((l) => l.value === language)
                                      ?.label
                                  }
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <AlignJustify className="h-4 w-4" />
                                <span>{length}% length</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-muted/50 rounded-lg p-4">
                            <p className="text-muted-foreground leading-relaxed">
                              {summary}
                            </p>
                          </div>

                          <div className="flex items-center justify-end text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-1.5" />
                            <span>Generated in 2 seconds</span>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </TabsContent>

                <TabsContent value="history" className="w-full">
                  <Card className="p-6">
                    {loadingHistory ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="h-12 w-12 border-4 border-muted rounded-full border-t-transparent mb-4"
                        ></motion.div>
                        <p className="text-sm">
                          Loading your saved summaries...
                        </p>
                      </div>
                    ) : savedSummaries.length > 0 ? (
                      <div className="space-y-6">
                        {savedSummaries.map(
                          (
                            item: { video_id: string; summary: string },
                            index
                          ) => (
                            <div
                              key={index}
                              className="p-4 rounded-lg bg-muted/50"
                            >
                              <div className="mb-2 flex items-center justify-between">
                                <a
                                  href={`https://www.youtube.com/watch?v=${item.video_id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary font-medium hover:underline"
                                >
                                  Video Link
                                </a>
                                <span className="text-sm text-muted-foreground">
                                  Summary #{index + 1}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {item.summary}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                        <History className="h-12 w-12 mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                          No History Yet
                        </h3>
                        <p className="text-sm">
                          Your saved summaries will appear here after you upload
                          them.
                        </p>
                      </div>
                    )}
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-sm text-muted-foreground mt-8"
            >
              <p>
                Powered by AI • Fast and accurate video summaries in multiple
                languages
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default App;
