#!/usr/bin/env python3
"""
Captioneer Local Server
=======================
A simple HTTP server with CORS and security headers for running Captioneer locally.

Usage:
    python server.py [port]
    
Default port: 8000
Access at: http://localhost:8000/captioneer.html
"""

import http.server
import socketserver
import sys
import os
import webbrowser
from functools import partial

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP request handler with CORS and security headers."""
    
    def end_headers(self):
        # CORS headers for API requests
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        
        # Security headers for SharedArrayBuffer (if needed for future WASM features)
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        
        # Cache control for development
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        
        super().end_headers()
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests."""
        self.send_response(200)
        self.end_headers()
    
    def log_message(self, format, *args):
        """Custom log formatting."""
        message = format % args
        # Color coding for different request types
        if '200' in message or '304' in message:
            print(f"  \033[92m✓\033[0m {message}")
        elif '404' in message:
            print(f"  \033[91m✗\033[0m {message}")
        else:
            print(f"  → {message}")

def main():
    # Change to the script's directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)) or '.')
    
    Handler = partial(CORSRequestHandler, directory=os.getcwd())
    
    print()
    print("\033[96m" + "=" * 60 + "\033[0m")
    print("\033[96m" + "  CAPTIONEER - Local Development Server" + "\033[0m")
    print("\033[96m" + "=" * 60 + "\033[0m")
    print()
    print(f"  \033[93m→\033[0m Server starting on port {PORT}")
    print(f"  \033[93m→\033[0m Directory: {os.getcwd()}")
    print()
    print(f"  \033[92m✓\033[0m Open in browser: \033[4mhttp://localhost:{PORT}/captioneer.html\033[0m")
    print()
    print("  \033[90mPress Ctrl+C to stop the server\033[0m")
    print()
    print("-" * 60)
    
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            # Auto-open browser
            webbrowser.open(f'http://localhost:{PORT}/captioneer.html')
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n")
        print("  \033[93m→\033[0m Server stopped")
        print()
    except OSError as e:
        if e.errno == 98 or e.errno == 48:  # Address already in use
            print(f"\n  \033[91m✗\033[0m Port {PORT} is already in use!")
            print(f"  \033[93m→\033[0m Try: python server.py {PORT + 1}")
            print()
        else:
            raise

if __name__ == "__main__":
    main()
