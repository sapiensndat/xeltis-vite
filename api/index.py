import os
import json
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import PyPDF2
import docx
import io
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# --- CONFIGURATION ---
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

ZOHO_EMAIL = "sapiens@xeltis.org"
ZOHO_APP_PASSWORD = os.getenv("ZOHO_APP_PASSWORD")

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
        server = smtplib.SMTP_SSL('smtp.zoho.com', 465)
        server.login(ZOHO_EMAIL, ZOHO_APP_PASSWORD)
        server.send_message(msg)
        server.quit()
        logging.info(f"✅ Zoho email successfully sent")
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

        # 1. Extract Text
        file_bytes = io.BytesIO(file.read())
        if filename.endswith('.pdf'):
            pdf_reader = PyPDF2.PdfReader(file_bytes)
            for page in pdf_reader.pages:
                ext = page.extract_text()
                if ext: resume_text += ext + "\n"
        elif filename.endswith('.docx'):
            doc = docx.Document(file_bytes)
            for para in doc.paragraphs:
                resume_text += para.text + "\n"
        else:
            return jsonify({"error": "Unsupported file format."}), 400

        resume_text = resume_text[:6000]

        # 2. AI Evaluation via Groq REST API (Lightweight)
        groq_headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        prompt = f"You are Xeltis AI HR. Evaluate this resume for the role of '{role}'. Extract the candidate's full name and email address. Determine if they have the elite background required for this advisory position. STRICTLY return ONLY valid JSON: {{\"name\": \"Candidate Name\", \"email\": \"candidate@email.com\", \"decision\": \"ACCEPT\" or \"REJECT\", \"reason\": \"Short explanation of the fit\"}} RESUME: {resume_text}"
        
        groq_payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.1,
            "response_format": {"type": "json_object"}
        }
        
        groq_res = requests.post("https://api.groq.com/openai/v1/chat/completions", json=groq_payload, headers=groq_headers)
        groq_res.raise_for_status()
        
        ai_data = json.loads(groq_res.json()['choices'][0]['message']['content'])
        candidate_email = ai_data.get('email', '').lower()

        if not candidate_email:
            return jsonify({"decision": "REJECT", "reason": "Could not extract email from CV."}), 200

        # 3. Supabase REST API (Lightweight)
        supa_headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

        # Duplicate Check
        check_res = requests.get(f"{SUPABASE_URL}/rest/v1/job_applications?email=eq.{candidate_email}&select=id", headers=supa_headers)
        if check_res.json():  # If list is not empty
            return jsonify({
                "decision": "REJECT", 
                "reason": "Our records show you have already submitted an application for an advisory role."
            }), 200

        # Store in Supabase
        insert_payload = {
            "name": ai_data.get('name'),
            "email": candidate_email,
            "role": role,
            "decision": ai_data.get('decision'),
            "ai_reason": ai_data.get('reason')
        }
        requests.post(f"{SUPABASE_URL}/rest/v1/job_applications", json=insert_payload, headers=supa_headers)

        # 4. Notify via Zoho if ACCEPTED
        if ai_data.get('decision') == "ACCEPT":
            send_zoho_notification(ai_data.get('name'), candidate_email, role, ai_data.get('reason'))

        return jsonify(ai_data)

    except Exception as e:
        logging.error(f"Error: {str(e)}")
        return jsonify({"error": "Internal Server Error"}), 500

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    app.run(port=5001, debug=True)