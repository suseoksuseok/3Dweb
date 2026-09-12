"""
3D시뮬레이션을 이용한 사물 구현화 (Realize3D Studio) - Local Web Server
"""
import http.server
import socketserver
import os
import sys
import webbrowser

PORT = 8080

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and disable cache during development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def guess_type(self, path):
        # Ensure correct MIME types for 3D formats and JS modules
        if path.endswith('.js') or path.endswith('.mjs'):
            return 'application/javascript'
        elif path.endswith('.glb'):
            return 'model/gltf-binary'
        elif path.endswith('.gltf'):
            return 'model/gltf+json'
        elif path.endswith('.obj'):
            return 'text/plain'
        elif path.endswith('.stl'):
            return 'model/stl'
        return super().guess_type(path)

def run():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    global PORT
    for _ in range(10):
        try:
            with socketserver.TCPServer(("", PORT), Handler) as httpd:
                url = f"http://localhost:{PORT}"
                print(f"==================================================")
                print(f"  [3D시뮬레이션을 이용한 사물 구현화] 웹 서버 구동 중")
                print(f"  주소: {url}")
                print(f"==================================================")
                try:
                    webbrowser.open(url)
                except Exception:
                    pass
                httpd.serve_forever()
        except OSError:
            PORT += 1

if __name__ == "__main__":
    run()
