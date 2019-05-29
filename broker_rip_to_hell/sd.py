

import SimpleHTTPServer 
import SocketServer 
 
 
Handler = SimpleHTTPServer.SimpleHTTPRequestHandler 
 
httpd = SocketServer.TCPServer(('localhost', 80), Handler) 
 
httpd.serve_forever()
