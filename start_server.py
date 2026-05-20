# -*- coding: utf-8 -*-
"""
DA LAN PERSONNEL MANAGEMENT SYSTEM - LOCAL SERVER
Detects local WiFi IP, serves directory files on port 8000,
and opens an elegant browser console with a QR code for iPhone installation.
"""

import http.server
import socketserver
import socket
import webbrowser
import threading
import time
import os
import sys

PORT = 8000

def get_local_ip():
    """Gets the active local IP address of the machine on the network."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # Doesn't need to be reachable, just triggers routing interface selection
        s.connect(('8.8.8.8', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

LOCAL_IP = get_local_ip()

class DaLanHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom request handler to inject dynamic local IP into the console view."""
    
    def log_message(self, format, *args):
        # Override to clean up standard terminal output and make it look premium
        sys.stdout.write("%s - - [%s] %s\n" %
                         (self.address_string(),
                          self.log_date_time_string(),
                          format%args))

    def do_GET(self):
        # Intercept console request to dynamically inject local network IP address
        if self.path == '/console.html' or self.path == '/console':
            try:
                self.send_response(200)
                self.send_header('Content-type', 'text/html; charset=utf-8')
                # Disable caching for clean development
                self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
                self.end_headers()
                
                console_path = os.path.join(os.path.dirname(__file__), 'console.html')
                with open(console_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Dynamic replacement of Local IP
                rendered_content = content.replace('{{LOCAL_IP}}', LOCAL_IP)
                self.wfile.write(rendered_content.encode('utf-8'))
                return
            except Exception as e:
                self.send_error(500, f"Internal Server Error: {str(e)}")
                return
        
        # Serve index.html if root is requested
        if self.path == '/' or self.path == '':
            self.path = '/index.html'
            
        super().do_GET()

def open_browser():
    """Waits for server boot and opens the Server Console on the host machine."""
    time.sleep(1.5)
    console_url = f"http://localhost:{PORT}/console.html"
    print(f"\n[*] Dang tu dong mo trinh dieu khien: {console_url}")
    webbrowser.open(console_url)

def run_server():
    # Set current working directory to script location to ensure correct file serving
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Configure socket address reuse to avoid port collision errors on fast restarts
    socketserver.TCPServer.allow_reuse_address = True
    
    with socketserver.TCPServer(("", PORT), DaLanHTTPRequestHandler) as httpd:
        print("="*60)
        print("    HE THONG QUAN LY NHAN SU DA LAN - SERVER CHO IOS ACTIVE")
        print("="*60)
        print(f" [+] Server local cua ban:   http://localhost:{PORT}/index.html")
        print(f" [+] URL ket noi iPhone:    http://{LOCAL_IP}:{PORT}/index.html")
        print("-"*60)
        print(" [!] QUAN TRONG:")
        print("  1. iPhone va May tinh phai KET NOI CHUNG mang WiFi.")
        print("  2. Trinh duyet tren may tinh se mo ra mot ma QR lon.")
        print("  3. Quet ma QR do bang iPhone cua ban de bat dau cai dat.")
        print("="*60)
        print(" Dang cho thiet bi ket noi... (Nhan Ctrl+C de dung server)\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[-] Dang dung server. Cam on ban da su dung!")
            sys.exit(0)

if __name__ == "__main__":
    # Start browser opener in a separate thread
    threading.Thread(target=open_browser, daemon=True).start()
    
    # Run the server
    run_server()
