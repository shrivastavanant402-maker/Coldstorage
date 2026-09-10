import unittest
from unittest.mock import patch, MagicMock
import os
import sys

# Ensure call_me directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app


class TwilioCallMeTestCase(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        self.client.testing = True

    def test_get_index(self):
        """Verify GET / returns 200 and serves HTML content."""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Call Me", response.data)
        self.assertIn(b"Twilio Voice Connect", response.data)
        # Check CORS header
        self.assertEqual(response.headers.get("Access-Control-Allow-Origin"), "*")

    def test_options_call(self):
        """Verify OPTIONS /call preflight works."""
        response = self.client.options("/call")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers.get("Access-Control-Allow-Origin"), "*")
        self.assertIn("POST", response.headers.get("Access-Control-Allow-Methods"))

    @patch("app.os.getenv")
    def test_call_missing_env_vars(self, mock_getenv):
        """Verify POST /call returns 500 when environment variables are missing."""
        mock_getenv.return_value = None
        response = self.client.post("/call")
        self.assertEqual(response.status_code, 500)
        json_data = response.get_json()
        self.assertFalse(json_data["success"])
        self.assertIn("Missing required environment variable", json_data["error"])

    @patch("app.Client")
    def test_call_success_mocked(self, mock_client_cls):
        """Verify POST /call successfully initiates call via Twilio SDK."""
        mock_client_instance = MagicMock()
        mock_client_cls.return_value = mock_client_instance

        mock_call = MagicMock()
        mock_call.sid = "CA_TEST_SID_12345"
        mock_call.status = "queued"
        mock_client_instance.calls.create.return_value = mock_call

        response = self.client.post("/call")
        self.assertEqual(response.status_code, 200)
        json_data = response.get_json()
        self.assertTrue(json_data["success"])
        self.assertEqual(json_data["call_sid"], "CA_TEST_SID_12345")
        self.assertEqual(json_data["status"], "queued")

        # Verify arguments passed to calls.create
        mock_client_instance.calls.create.assert_called_once()
        _, kwargs = mock_client_instance.calls.create.call_args
        self.assertIn("to", kwargs)
        self.assertIn("from_", kwargs)
        self.assertIn("twiml", kwargs)
        self.assertIn("<Say", kwargs["twiml"])

    @patch("app.os.getenv")
    def test_call_rejects_invalid_phone_numbers(self, mock_getenv):
        """Reject malformed phone numbers before making a Twilio request."""
        mock_getenv.side_effect = lambda name, default=None: {
            "TWILIO_ACCOUNT_SID": "AC" + "a" * 32,
            "TWILIO_AUTH_TOKEN": "a" * 32,
            "TWILIO_FROM_NUMBER": "15551234567",
            "MY_PHONE_NUMBER": "+15551234567",
        }.get(name, default)

        response = self.client.post("/call")

        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.get_json()["success"])
        self.assertIn("E.164", response.get_json()["error"])

    @patch("app.Client")
    def test_call_network_error(self, mock_client_cls):
        """Return a clear retryable error when the Twilio API is unreachable."""
        from requests.exceptions import ConnectionError

        mock_client_cls.return_value.calls.create.side_effect = ConnectionError()

        response = self.client.post("/call")

        self.assertEqual(response.status_code, 503)
        self.assertFalse(response.get_json()["success"])
        self.assertIn("Unable to reach Twilio", response.get_json()["error"])

    @patch("app.Client")
    def test_call_twilio_error(self, mock_client_cls):
        """Verify POST /call returns 500 when Twilio raises an exception."""
        from twilio.base.exceptions import TwilioRestException
        mock_client_instance = MagicMock()
        mock_client_cls.return_value = mock_client_instance
        mock_client_instance.calls.create.side_effect = TwilioRestException(
            status=400, uri="/Calls", msg="Invalid phone number", code=21211
        )

        response = self.client.post("/call")
        self.assertEqual(response.status_code, 500)
        json_data = response.get_json()
        self.assertFalse(json_data["success"])
        self.assertIn("Twilio API Error", json_data["error"])
        self.assertIn("21211", json_data["error"])


if __name__ == "__main__":
    unittest.main()
