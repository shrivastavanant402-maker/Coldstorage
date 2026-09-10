# Twilio "Call Me" Web Feature

A minimal website feature that triggers a real phone call via Twilio Voice API when a button is clicked on the frontend.

## Stack
- **Backend**: Python / Flask (`twilio`, `python-dotenv`)
- **Frontend**: Plain HTML5 / Modern CSS / Vanilla JavaScript (`fetch`)

---

## Setup & Running

### 1. Install Dependencies
Ensure you have Python 3 installed. Navigate to the `call_me` directory and install the requirements:

```bash
cd call_me
pip install -r requirements.txt
```

*(Optional: Create a virtual environment first)*:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and enter your Twilio credentials and phone numbers:

```bash
cp .env.example .env
```

Your `.env` should look like:
```env
TWILIO_ACCOUNT_SID=AC32fe0f37d98fce99650e10cc2d51a998
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_NUMBER=+17372508034
MY_PHONE_NUMBER=+919518976580
```

### 3. Run the Flask Server
```bash
python app.py
```
The server will start on `http://127.0.0.1:5000`.

### 4. Open the Frontend
Either:
- Visit **[http://localhost:5000](http://localhost:5000)** in your browser (served directly by Flask), OR
- Double-click and open `index.html` directly in your browser.

Click **"📞 Call Me"** to trigger the phone call!

---

## API Specification

### `POST /call`
Triggers an outbound call using Twilio's Python SDK `client.calls.create()`.

**Response (Success - 200 OK)**:
```json
{
  "success": true,
  "message": "Call initiated successfully.",
  "call_sid": "CA1234567890abcdef...",
  "status": "queued"
}
```

**Response (Failure - 500 Internal Server Error)**:
```json
{
  "success": false,
  "error": "Twilio API Error (21211): The 'To' number is not a valid phone number."
}
```
