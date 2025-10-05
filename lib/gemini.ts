import { GoogleGenAI, Type } from "@google/genai";
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_KEY});


export async function extractAttributes(text: string) {
  
   const systemInstruction = `You are a specialized Natural Language Processor designed for mental health pattern recognition. Your task is to analyze the user's journal entry and extract five key attributes into a strict JSON object. Do not output any text other than the JSON object itself. Ensure all fields in the schema are present and accurately reflect the user's input.`;
  
   try {
       const response = await ai.models.generateContent({
           model: "gemini-2.5-flash",
           contents: [{ role: "user", parts: [{ text: `Journal Entry to analyze: "${text}"` }] }],
           config: {
               systemInstruction: systemInstruction,
               thinkingConfig: {
                   thinkingBudget: 0,
               },
               responseMimeType: "application/json",
               responseSchema: {
                   type: Type.OBJECT,
                   properties: {
                       identified_trigger: { type: Type.STRING, description: "The core event or situation that immediately preceded the urge or behavior." },
                       preceding_mood: { type: Type.STRING, description: "The primary emotional state (e.g., Anxiety, Loneliness, Boredom) felt just before the behavior." },
                       severity_score_1_5: { type: Type.STRING, description: "A subjective severity score from '1' (minor lapse) to '5' (severe episode). Must be a string." },
                       environment: { type: Type.STRING, description: "The physical location and immediate surroundings during the event (e.g., 'Alone in kitchen', 'At work desk')." },
                       post_binge_feeling: { type: Type.STRING, description: "The dominant emotion experienced immediately after the behavior (e.g., Guilt, Shame, Numbness)." }
                   },
                   required: ["identified_trigger", "preceding_mood", "severity_score_1_5", "environment", "post_binge_feeling"]
               }
           }
       });


       const extractedJSONString = response.text;
      
       if (!extractedJSONString) {
            throw new Error("Gemini returned an empty response text.");
       }


       return JSON.parse(extractedJSONString);
      
   } catch (error) {
       console.error("Error during Gemini API call for extraction:", error);
       return {
            error: true,
            message: "Extraction failed due to an API or network error.",
            originalError: error instanceof Error ? error.message : String(error)
       };
   }
}


export async function extractAttributes(text: string) {
    
    const systemInstruction = `You are a specialized Natural Language Processor designed for mental health pattern recognition. Your task is to analyze the user's journal entry and extract five key attributes into a strict JSON object. Do not output any text other than the JSON object itself. Ensure all fields in the schema are present and accurately reflect the user's input.`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: `Journal Entry to analyze: "${text}"` }] }],
            config: {
                systemInstruction: systemInstruction,
                thinkingConfig: {
                    thinkingBudget: 0, 
                },
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        identified_trigger: { type: Type.STRING, description: "The core event or situation that immediately preceded the urge or behavior." },
                        preceding_mood: { type: Type.STRING, description: "The primary emotional state (e.g., Anxiety, Loneliness, Boredom) felt just before the behavior." },
                        severity_score_1_5: { type: Type.STRING, description: "A subjective severity score from '1' (minor lapse) to '5' (severe episode). Must be a string." },
                        environment: { type: Type.STRING, description: "The physical location and immediate surroundings during the event (e.g., 'Alone in kitchen', 'At work desk')." },
                        post_binge_feeling: { type: Type.STRING, description: "The dominant emotion experienced immediately after the behavior (e.g., Guilt, Shame, Numbness)." }
                    },
                    required: ["identified_trigger", "preceding_mood", "severity_score_1_5", "environment", "post_binge_feeling"]
                }
            }
        });

        const extractedJSONString = response.text;
        
        if (!extractedJSONString) {
             throw new Error("Gemini returned an empty response text.");
        }

        return JSON.parse(extractedJSONString);
        
    } catch (error) {
        console.error("Error during Gemini API call for extraction:", error);
        return {
             error: true,
             message: "Extraction failed due to an API or network error.",
             originalError: error instanceof Error ? error.message : String(error)
        };
    }
}
