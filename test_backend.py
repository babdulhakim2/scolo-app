#!/usr/bin/env python3
"""Test backend SSE stream to see what events are actually sent."""

import json
import requests
import sseclient

BACKEND_URL = "http://localhost:8005"

def test_investigation():
    # Start a project
    print("Starting project...")
    start_response = requests.post(
        f"{BACKEND_URL}/api/projects/start",
        json={
            "entity_name": "Donald Trump",
            "entity_type": "individual",
            "tools": ["adverse_media", "sanctions", "pep_check"]
        }
    )

    if not start_response.ok:
        print(f"Failed to start project: {start_response.status_code}")
        print(start_response.text)
        return

    project_data = start_response.json()
    project_id = project_data["project_id"]
    print(f"Project started: {project_id}")

    # Connect to SSE stream
    print("\nConnecting to SSE stream...")
    stream_url = f"{BACKEND_URL}/api/projects/{project_id}/stream"

    with requests.get(stream_url, stream=True) as response:
        client = sseclient.SSEClient(response)

        for event in client.events():
            try:
                data = json.loads(event.data)
                print(f"\n[{data.get('type')}] Event received:")
                print(json.dumps(data, indent=2))

                if data.get('type') == 'project_complete':
                    print("\nProject completed!")
                    break

            except json.JSONDecodeError as e:
                print(f"Failed to parse event: {e}")
                print(f"Raw data: {event.data}")

if __name__ == "__main__":
    test_investigation()