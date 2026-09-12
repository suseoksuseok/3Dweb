import urllib.request
import json
import socket
import time
import subprocess
import base64
import os

def run_test():
    proc = subprocess.Popen([
        r'C:\Program Files\Google\Chrome\Application\chrome.exe',
        '--headless=new',
        '--remote-debugging-port=9222',
        '--no-first-run',
        '--no-default-browser-check',
        '--user-data-dir=' + os.path.expanduser('~/.chrome-test-profile'),
        'http://localhost:8080/'
    ])
    time.sleep(2)
    try:
        with urllib.request.urlopen('http://localhost:9222/json') as res:
            tabs = json.loads(res.read().decode())
        page_tab = next((t for t in tabs if t.get('type') == 'page'), None)
        if not page_tab:
            print("No page tab found")
            return
        
        ws_url = page_tab['webSocketDebuggerUrl']
        print("Connecting to:", ws_url)
        # Parse ws url
        # ws://localhost:9222/devtools/page/<id>
        path = ws_url.split('localhost:9222')[1]
        
        # Connect raw websocket
        s = socket.socket()
        s.connect(('localhost', 9222))
        
        # Handshake
        key = base64.b64encode(b'1234567890123456').decode()
        req = f"GET {path} HTTP/1.1\r\nHost: localhost:9222\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n"
        s.sendall(req.encode())
        
        resp = s.recv(4096)
        print("Handshake response received")
        
        # Helper to send frame
        def send_frame(msg_dict):
            payload = json.dumps(msg_dict).encode()
            length = len(payload)
            frame = bytearray([0x81]) # text frame
            if length < 126:
                frame.append(0x80 | length)
            else:
                frame.append(0x80 | 126)
                frame.extend(length.to_bytes(2, 'big'))
            mask = b'\x11\x22\x33\x44'
            frame.extend(mask)
            masked_payload = bytearray(b ^ mask[i % 4] for i, b in enumerate(payload))
            frame.extend(masked_payload)
            s.sendall(frame)
            
        def read_frame():
            hdr = s.recv(2)
            if not hdr: return None
            b1, b2 = hdr
            length = b2 & 0x7F
            if length == 126:
                length = int.from_bytes(s.recv(2), 'big')
            elif length == 127:
                length = int.from_bytes(s.recv(8), 'big')
            data = bytearray()
            while len(data) < length:
                data.extend(s.recv(length - len(data)))
            return json.loads(data.decode('utf-8', errors='ignore'))

        send_frame({"id": 1, "method": "Page.enable"})
        send_frame({"id": 2, "method": "Runtime.enable"})
        send_frame({"id": 3, "method": "Page.captureScreenshot", "params": {"format": "png"}})

        # Read responses
        for _ in range(25):
            s.settimeout(3.0)
            try:
                frame = read_frame()
                if frame:
                    if frame.get("id") == 3 and "result" in frame and "data" in frame["result"]:
                        img_data = base64.b64decode(frame["result"]["data"])
                        with open(r"C:\Users\Administrator\.gemini\antigravity\scratch\3d-object-simulator\screenshot.png", "wb") as f:
                            f.write(img_data)
                        print("Screenshot saved successfully! Size:", len(img_data))
                    elif frame.get("method") == "Runtime.consoleAPICalled":
                        print("Console log:", frame.get("params", {}).get("args"))
                    elif frame.get("method") == "Runtime.exceptionThrown":
                        print("Exception:", frame.get("params"))
            except Exception as e:
                print("Read timeout/end:", e)
                break
    finally:
        proc.terminate()

if __name__ == '__main__':
    run_test()
