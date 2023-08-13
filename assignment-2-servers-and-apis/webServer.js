const fs = require('fs')
const http = require('http')

const port = 3001
const body = fs.readFileSync(`${__dirname}/static/index.html`, 'utf-8')
const notFound = fs.readFileSync(`${__dirname}/static/404.html`, 'utf-8')

const server = http.createServer((req, res) => {
    //jbefjkebf
    const {url} = req

    if (url == '/' || url == 'index.html') {
       return res.writeHead(200, {
            'Content-type': 'text/html'
        }).end(body)
    }
    else if (url.endsWith('.html')) {
        const splitURL = url.split('/')
        try {
            const fileName = splitURL[splitURL.length-1]
            const filePath = fs.readFileSync(`${__dirname}/static/${fileName}`, 'utf-8') 
            res.writeHead(200, {
                'Content-type': 'text/html'
            }).end(filePath)

        } catch (error) {
            console.warn(error)
            res.writeHead(200, {
                'Content-type': 'text/html'
            }).end(notFound)
        }
    }
    else {
        return res.writeHead(404, {
            'Content-type': 'text/html'
        }).end(notFound)
    }
})

server.listen(port, 'localhost', () => {
    console.log(`Listening on localhost: http://localhost:${port}`);
})