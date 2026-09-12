import subprocess, time, json, urllib.request, socket, base64

proc = subprocess.Popen([
    r'C:\Program Files\Google\Chrome\Application\chrome.exe',
    '--headless=new',
    '--remote-debugging-port=9225',
    '--user-data-dir=C:\\Users\\Administrator\\.chrome-test-click',
    'http://localhost:8080/'
])
time.sleep(2)
try:
    with urllib.request.urlopen('http://localhost:9225/json') as res:
        tabs = json.loads(res.read().decode())
    page_tab = next((t for t in tabs if t.get('type') == 'page'), None)
    ws_url = page_tab['webSocketDebuggerUrl']
    path = ws_url.split('localhost:9225')[1]
    
    s = socket.socket()
    s.connect(('localhost', 9225))
    key = base64.b64encode(b'1234567890123456').decode()
    s.sendall(f'GET {path} HTTP/1.1\r\nHost: localhost:9225\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n'.encode())
    s.recv(2048)
    
    def send_frame(msg):
        payload = json.dumps(msg).encode()
        frame = bytearray([0x81, 0x80 | len(payload), 1, 2, 3, 4]) + bytearray(b ^ [1, 2, 3, 4][i % 4] for i, b in enumerate(payload))
        s.sendall(frame)
        
    def read_frame():
        hdr = s.recv(2)
        if not hdr: return None
        length = hdr[1] & 0x7F
        if length == 126:
            length = int.from_bytes(s.recv(2), 'big')
        elif length == 127:
            length = int.from_bytes(s.recv(8), 'big')
        data = bytearray()
        while len(data) < length:
            data.extend(s.recv(length - len(data)))
        return json.loads(data.decode('utf-8', errors='ignore'))

    send_frame({"id": 1, "method": "Runtime.enable"})
    # Click specs toggle button
    send_frame({"id": 2, "method": "Runtime.evaluate", "params": {"expression": "document.getElementById('btn-toggle-specs').click()"}})
    time.sleep(0.5)
    send_frame({"id": 3, "method": "Page.captureScreenshot", "params": {"format": "png"}})

    for _ in range(15):
        s.settimeout(2.0)
        try:
            f = read_frame()
            if f and f.get("id") == 3 and "result" in f and "data" in f["result"]:
                img = base64.b64decode(f["result"]["data"])
                with open(r"C:\Users\Administrator\.gemini\antigravity\scratch\3d-object-simulator\screenshot_drawer.png", "wb") as fp:
                    fp.write(img)
                print("Drawer screenshot captured! Size:", len(img))
                break
        except Exception as e:
            print("Err:", e)
            break
finally:
    proc.terminate()
