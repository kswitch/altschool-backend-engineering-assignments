const http = require('http');

// 1. Create an HTTP server
const server = http.createServer((request, response) => {

    // 2. Return "Hello world" from the response
    const body = "Hello world"
    response.writeHead(200, { 
        'Content-Type': 'text/plain' 
    }).end(body)
})

// 3. Ensure when you navigate to the server on the browser, "Hello world" is returned.
const port = 3000
server.listen(port, "localhost", () => {
    console.log(`Listening on http://localhost:${port}`)
})