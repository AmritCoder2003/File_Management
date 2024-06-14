import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const PORT = 8000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFilePath = (fileName) => path.join(process.cwd(), 'files', fileName);

const filesDir = path.join(process.cwd(), 'files');
if (!fs.existsSync(filesDir)) {
  fs.mkdirSync(filesDir);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const fileName = url.searchParams.get('file');

  if (req.method === 'GET' && req.url === '/') {
    fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Failed to load the HTML file');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
    return;
  }

  if (req.method === 'GET' && req.url.startsWith('/styles.css')) {
    fs.readFile(path.join(__dirname, 'public', 'styles.css'), (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Failed to load the CSS file');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.end(data);
      }
    });
    return;
  }

  if (!fileName) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('File name is required');
    return;
  }

  const filePath = getFilePath(fileName);

  switch (url.pathname) {
    case '/create':
      const content = url.searchParams.get('content') || 'Default content';
      fs.writeFile(filePath, content, (err) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Failed to create file');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('File created successfully');
        }
      });
      break;

    case '/read':
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('File not found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end(data);
        }
      });
      break;

    case '/delete':
      fs.unlink(filePath, (err) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('File not found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('File deleted successfully');
        }
      });
      break;

    default:
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      break;
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
