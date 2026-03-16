import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';
import pdfParse from 'pdf-parse';

// Initialize external services using environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service key to bypass RLS policies
const supabase = createClient(supabaseUrl, supabaseKey);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { fileBase64, role } = req.body;
    if (!fileBase64) return res.status(400).json({ error: 'No PDF file provided.' });

    // 1. Read the PDF from the Base64 string sent by the frontend
    const pdfBuffer = Buffer.from(fileBase64, 'base64');
    const pdfData = await pdfParse(pdfBuffer);
    const resumeText = pdfData.text.substring(0, 6000); // Limit length to avoid token limits

    // 2. Ask Groq (Llama 3) to evaluate the candidate
    const prompt = `
    You are Xeltis AI HR. Evaluate this resume for the advisory role of '${role}'.
    Determine if they have the exact background needed (e.g. Senior Geologist, UN official, Civil Engineer, former intelligence).
    STRICTLY return ONLY valid JSON in this exact format:
    {"name": "John Doe", "email": "john@email.com", "decision": "ACCEPT", "reason": "Has 10 years at Rio Tinto."}
    If they do not fit the specific criteria for this role, set "decision": "REJECT" and briefly explain why in the reason.
    
    RESUME TEXT:
    ${resumeText}
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'system', content: prompt }],
      model: 'llama3-70b-8192',
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const aiEval = JSON.parse(chatCompletion.choices[0].message.content);
    const email = aiEval.email ? aiEval.email.toLowerCase() : null;

    if (!email) {
      return res.status(400).json({ decision: "REJECT", reason: "Could not reliably extract an email address from the CV." });
    }

    // 3. Check Supabase to see if they already applied
    const { data: existingApp } = await supabase
      .from('job_applications')
      .select('id')
      .eq('email', email)
      .single();

    if (existingApp) {
      return res.status(200).json({ decision: "REJECT", reason: "You have already applied for a role at Xeltis. Duplicate applications are not accepted." });
    }

    // 4. Save to Database
    await supabase.from('job_applications').insert([{
      name: aiEval.name,
      email: email,
      role: role,
      decision: aiEval.decision,
      ai_reason: aiEval.reason
    }]);

    // Send the final result back to the frontend
    return res.status(200).json(aiEval);

  } catch (error) {
    console.error("AI Hiring Error:", error);
    return res.status(500).json({ error: 'Internal Server Error while analyzing profile.' });
  }
}