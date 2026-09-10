import os
import re
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
from requests.exceptions import RequestException
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__, static_folder=".")

E164_PHONE_NUMBER = re.compile(r"^\+[1-9]\d{7,14}$")


@app.after_request
def enable_cors(response):
    """Enable CORS so index.html works when opened directly via file:// or another origin."""
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    return response


@app.route("/", methods=["GET"])
def serve_index():
    """Serve the frontend HTML page."""
    return send_from_directory(".", "index.html")


@app.route("/call", methods=["POST", "OPTIONS"])
def make_call():
    """Trigger an outbound phone call via Twilio with a spoken <Say> message."""
    if request.method == "OPTIONS":
        return "", 200
    # Retrieve credentials from environment variables
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_FROM_NUMBER")
    to_number = os.getenv("MY_PHONE_NUMBER")

    # Validate presence of required environment variables
    missing_vars = [
        var_name
        for var_name, val in [
            ("TWILIO_ACCOUNT_SID", account_sid),
            ("TWILIO_AUTH_TOKEN", auth_token),
            ("TWILIO_FROM_NUMBER", from_number),
            ("MY_PHONE_NUMBER", to_number),
        ]
        if not val
    ]

    if missing_vars:
        return (
            jsonify(
                {
                    "success": False,
                    "error": f"Missing required environment variable(s): {', '.join(missing_vars)}",
                }
            ),
            500,
        )

    invalid_phone_vars = [
        var_name
        for var_name, value in [
            ("TWILIO_FROM_NUMBER", from_number),
            ("MY_PHONE_NUMBER", to_number),
        ]
        if not E164_PHONE_NUMBER.fullmatch(value)
    ]
    if invalid_phone_vars:
        return (
            jsonify(
                {
                    "success": False,
                    "error": (
                        "Invalid E.164 phone number format for: "
                        f"{', '.join(invalid_phone_vars)}. Use a leading + and country code."
                    ),
                }
            ),
            400,
        )

    # TwiML message to speak when call is answered
    twiml_instruction = (
        "<Response>"
        "<Say voice='alice' language='en-US'>"
        "Hello! This is an automated call triggered from your website."
        "</Say>"
        "</Response>"
    )

    # Optional TwiML URL fallback for trial accounts that disallow inline 'twiml' parameter
    fallback_url = os.getenv(
        "TWILIO_VOICE_URL",
        "https://demo.twilio.com/docs/voice.xml"
    )

    try:
        # Initialize Twilio client and trigger call
        client = Client(account_sid, auth_token)
        try:
            call = client.calls.create(
                to=to_number,
                from_=from_number,
                twiml=twiml_instruction,
            )
        except TwilioRestException as tre:
            # Twilio trial accounts restrict inline 'twiml' parameter; fallback to URL
            if "trial accounts have limited parameter access" in str(tre).lower() or tre.code == 0:
                call = client.calls.create(
                    to=to_number,
                    from_=from_number,
                    url=fallback_url,
                )
            else:
                raise tre

        return (
            jsonify(
                {
                    "success": True,
                    "message": "Call initiated successfully.",
                    "call_sid": call.sid,
                    "status": call.status,
                }
            ),
            200,
        )

    except TwilioRestException as e:
        return (
            jsonify(
                {
                    "success": False,
                    "error": f"Twilio API Error ({e.code}): {e.msg}",
                }
            ),
            500,
        )
    except RequestException:
        # Twilio's SDK uses requests underneath.  Keep the actionable failure
        # separate from credentials and phone-number errors returned by Twilio.
        return (
            jsonify(
                {
                    "success": False,
                    "error": "Unable to reach Twilio. Check this server's internet connection and try again.",
                }
            ),
            503,
        )
    except Exception as e:
        return (
            jsonify(
                {
                    "success": False,
                    "error": f"Server Error: {str(e)}",
                }
            ),
            500,
        )


def get_port():
    """Return port from environment or pick 5000/5001 depending on availability (e.g. macOS AirPlay)."""
    import socket
    if "PORT" in os.environ:
        return int(os.environ["PORT"])
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        # Check if 5000 is occupied
        if s.connect_ex(("127.0.0.1", 5000)) == 0:
            return 5001
        return 5000


if __name__ == "__main__":
    port = get_port()
    print(f" * Server running on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
