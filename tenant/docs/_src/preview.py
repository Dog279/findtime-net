# Preview the site the way GitHub Pages and Cloudflare Pages serve it: /x resolves
# to x.html and a directory to its index.html.
#   python3 tenant/docs/_src/preview.py        then open http://127.0.0.1:8123/tenant/
import http.server, os, sys
ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".."))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8123
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=ROOT, **k)
    def translate_path(self, path):
        p = super().translate_path(path.split("?")[0])
        if os.path.isdir(p): return os.path.join(p, "index.html")
        if not os.path.exists(p) and os.path.exists(p + ".html"): return p + ".html"
        return p
print("serving", ROOT, "at http://127.0.0.1:%d/tenant/" % PORT)
http.server.ThreadingHTTPServer(("127.0.0.1", PORT), H).serve_forever()
