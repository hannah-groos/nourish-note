"use server";
import { extractAttributes } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";




export async function insertEntry(rawJournalText: string){
   try{
       const supabase = await createClient();
       const { data: userData, error: userError } = await supabase.auth.getUser();


       if (userError || !userData.user) {
           console.error("Authentication Error: User not logged in.");
           return { data: null, error: "User must be logged in to submit a journal entry." };
         }


       const userId = userData.user.id;


       // let gemini do this part
       const response = await extractAttributes(rawJournalText)
      
       const extractedJSON = response;


       const { data, error } = await supabase.from('entries').insert([
           {
             user_id: userId,
            
             raw_data: rawJournalText,
            
             extracted_data: extractedJSON,
            
             // 'id' and 'created_at' will use the database's default values (uuid_generate_v4() and now())
           },
         ]).select();
      
         if (error) {
           console.error("Supabase Insertion Error:", error);
         }
      
        
         return { data, error };


   } catch (e){
       console.error(e);
       return { data: null, error: "Unexpected server error" };
   }
  
}


export async function getEntry(){
   try{
       const supabase = await createClient()
       const { data: userData, error: userError } = await supabase.auth.getUser();


       if (userError || !userData.user) {
           console.error("Authentication Error: User not logged in.");
           return { data: null, error: "User must be logged in to submit a journal entry." };
         }


       const userId = userData.user.id;
       const { data, error } = await supabase.from('entries').select().eq('user_id', userId)


       return { data, error };
   } catch (e){
       console.error(e);
       return { data: null, error: "Unexpected server error" };
   }
}


export async function formatEntry() {
 try {
     const { data: entries, error } = await getEntry();


     if (error || !entries || entries.length === 0) {
         console.error("No entries found or error retrieving entries:", error);
         return null;
     }


     // Transform entries into a structured format suitable for a RAG bot
     const formattedEntries = entries.map((entry: any) => {
         const { raw_data, extracted_data, created_at } = entry;


         return `
Entry Date: ${created_at || "Unknown"}
Raw Journal Text:
${raw_data}


Extracted Attributes:
${JSON.stringify(extracted_data, null, 2)}
`;
     });


    
     const documentForRAG = formattedEntries.join("\n---\n");


     return documentForRAG;


 } catch (e) {
     console.error("Error formatting entries:", e);
     return null;
 }
}
