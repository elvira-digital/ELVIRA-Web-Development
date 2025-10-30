/**
 * Ask Question Component
 *
 * Allows guests to ask custom questions using natural language
 * Uses OpenAI analyzer edge function to provide intelligent answers
 */

import React, { useState } from "react";
import { Send } from "lucide-react";
import { getGuestSupabaseClient } from "../../../../services/guestSupabase";
import { SearchFilterBar } from "../../shared/search-filter";

interface AskQuestionProps {
  hotelId: string;
  onBackClick: () => void;
}

export const AskQuestion: React.FC<AskQuestionProps> = ({
  hotelId,
  onBackClick,
}) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    setError(null);
    setAnswer("");

    try {
      const supabase = getGuestSupabaseClient();

      // Call OpenAI analyzer edge function
      const { data, error: invokeError } = await supabase.functions.invoke(
        "openai-analyzer",
        {
          body: {
            task: "answer_question",
            text: question.trim(),
            hotel_id: hotelId,
          },
        }
      );

      if (invokeError) {
        throw new Error("Failed to get answer");
      }

      // Extract answer from response
      // The edge function returns the answer in both data.result and data.results.answer
      const answerText =
        data?.results?.answer ||
        data?.result ||
        "Sorry, I couldn't find an answer to your question.";
      setAnswer(answerText);
    } catch (err) {
      console.error("Error asking question:", err);
      setError("Failed to get an answer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Search Filter Bar with Ask Button */}
      <SearchFilterBar
        searchValue={question}
        onSearchChange={setQuestion}
        placeholder="Type your question here..."
        onBackClick={onBackClick}
        rightIcon={
          <button
            onClick={handleAsk}
            disabled={isLoading || !question.trim()}
            className="shrink-0 p-0 hover:opacity-70 transition-opacity disabled:opacity-50"
            aria-label="Ask question"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="text-gray-700" size={18} />
            )}
          </button>
        }
      />

      {/* Error */}
      {error && (
        <div className="mx-4 mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Answer */}
      {answer && (
        <div className="mx-4 mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{answer}</p>
        </div>
      )}
    </div>
  );
};
