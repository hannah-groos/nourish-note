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


