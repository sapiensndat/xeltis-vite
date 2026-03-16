import os
import json
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
from supabase import create_client, Client
import PyPDF2
import docx  # <-- Added to handle Word documents
import io
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Load secrets from your .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# --- CONFIGURATION (Securely loaded from .env) ---
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# --- ZOHO EMAIL CONFIG ---
ZOHO_EMAIL = "sapiens@xeltis.org"
ZOHO_APP_PASSWORD = os.getenv("ZOHO_APP_PASSWORD")

# Initialize Clients
groq_client = Groq(api_key=GROQ_API_KEY)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def send_zoho_notification(name, candidate_email, role, reason):
    """Sends an email alert via Zoho SMTP."""
    msg = MIMEMultipart()
    msg['From'] = ZOHO_EMAIL
    msg['To'] = ZOHO_EMAIL
    msg['Subject'] = f"New Qualified Advisor Profile: {name}"
    
    body = f"""
Xeltis AI has identified a strong candidate for: {role}

Candidate Name: {name}
Email: {candidate_email}
AI Reasoning: {reason}

View details in the Supabase Dashboard.
    """
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        # Zoho requires SSL on port 465
        server = smtplib.SMTP_SSL('smtp.zoho.com', 465)
        server.login(ZOHO_EMAIL, ZOHO_APP_PASSWORD)
        server.send_message(msg)
        server.quit()
        logging.info(f"✅ Zoho email successfully sent to {ZOHO_EMAIL}")
    except Exception as e:
        logging.error(f"❌ Zoho email error: {e}")

@app.route('/api/apply', methods=['POST'])
def apply():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        
        file = request.files['file']
        role = request.form.get('role', 'General Advisor')
        filename = file.filename.lower()

        resume_text = ""

        # 1. Extract Text based on File Type (PDF or Word)
        file_bytes = io.BytesIO(file.read())
        
        if filename.endswith('.pdf'):
            pdf_reader = PyPDF2.PdfReader(file_bytes)
            for page in pdf_reader.pages:
                extracted = page.extract_text()
                if extracted:
                    resume_text += extracted + "\n"
                    
        elif filename.endswith('.docx'):
            doc = docx.Document(file_bytes)
            for para in doc.paragraphs:
                resume_text += para.text + "\n"
                
        else:
            return jsonify({"error": "Unsupported file format. Please upload a PDF or Word (.docx) document."}), 400

        resume_text = resume_text[:6000] # Token safety to avoid overloading Groq

        # 2. AI Evaluation via Groq
        prompt = f"""
        You are Xeltis AI HR. Evaluate this resume for the role of '{role}'.
        Extract the candidate's full name and email address.
        Determine if they have the elite background required for this advisory position.
        
        STRICTLY return ONLY valid JSON:
        {{
            "name": "Candidate Name",
            "email": "candidate@email.com",
            "decision": "ACCEPT" or "REJECT",
            "reason": "Short explanation of the fit"
        }}
        
        RESUME: {resume_text}
        """

        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        
        ai_data = json.loads(completion.choices[0].message.content)
        candidate_email = ai_data.get('email', '').lower()

        if not candidate_email:
            return jsonify({"decision": "REJECT", "reason": "Could not extract email from CV."}), 200

        # 3. Duplicate Check in Supabase
        existing = supabase.table("job_applications").select("id").eq("email", candidate_email).execute()
        if existing.data:
            return jsonify({
                "decision": "REJECT", 
                "reason": "Our records show you have already submitted an application for an advisory role."
            }), 200

        # 4. Store in Supabase
        supabase.table("job_applications").insert({
            "name": ai_data.get('name'),
            "email": candidate_email,
            "role": role,
            "decision": ai_data.get('decision'),
            "ai_reason": ai_data.get('reason')
        }).execute()

        # 5. Notify sapiens@xeltis.org via Zoho if ACCEPTED
        if ai_data.get('decision') == "ACCEPT":
            send_zoho_notification(ai_data['name'], candidate_email, role, ai_data['reason'])

        return jsonify(ai_data)

    except Exception as e:
        logging.error(f"Error: {str(e)}")
        return jsonify({"error": "Internal Server Error"}), 500

if __name__ == '__main__':
    # Set logging to INFO to see the email success/fail messages in the terminal
    logging.basicConfig(level=logging.INFO)
    app.run(port=5001, debug=True)