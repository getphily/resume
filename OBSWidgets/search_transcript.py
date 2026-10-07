import json

with open('/Users/philybarrolaza/.gemini/antigravity/brain/5848bfb0-6dbe-42ca-9ff1-04b31d25d40d/.system_generated/logs/transcript.jsonl', 'r') as f:
    for line in f:
        data = json.loads(line)
        if data.get('source') == 'USER_EXPLICIT':
            content = data.get('content', '').lower()
            if 'formula' in content or 'questions' in content or 'setup form' in content:
                print("FOUND:", data.get('content'))
