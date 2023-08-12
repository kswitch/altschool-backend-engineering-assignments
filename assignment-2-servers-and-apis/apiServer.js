const fs = require('fs')
const http = require('http')
const nodeURL = require('url')

const port = 3002
const filePath = `${__dirname}/data/items.json`
const allItems = fs.readFileSync(filePath, 'utf-8')

const server = http.createServer((req, res) => {
    const {url, method} = req
    const parsedURL = nodeURL.parse(url, true)

    // Get all items list
    if ((url === '/v1/items') && (method === 'GET')) { 
        try {
            const file = JSON.parse(allItems)
            res.writeHead(200,{
                'Content-type': 'application/json'
            }).end(JSON.stringify(file))
            
        } catch (error) {
            console.warn(error)
            return res.writeHead(404, {
                'Content-type': 'text/html'
            }).end(`<h1>WebPage Not Found</h1>`)
        }
    }

    // Get the details of a specific item by ID
    else if ((url.startsWith('/v1/items')) && (method === 'GET')) {
        const {query: {id} } = parsedURL

        try {
            const items = JSON.parse(allItems)
            const foundItem = items.find(item => id === item.id)

            if (foundItem) {
                return res.writeHead(200, {
                    'Content-type': 'application/json'
                }).end(JSON.stringify(foundItem))
            }
            else {
                return res.writeHead(404, {
                    'Content-type': 'text/html'
                }).end(`<p>Item not found</p>`)
            } 
        } 
        catch (error) {
            console.warn(error)
            return res.writeHead(500, {
                'Content-type': 'text/html'
            }).end(`<p>Something went wrong</p>`)
        }
    }

    // Delete an entry
    else if ((method == 'DELETE') && (url.startsWith('/v1/items'))) {
        const {query: {id} } = parsedURL

        try {
            const items = JSON.parse(allItems) // Parse the JSON file
            const itemIndex = items.findIndex(item => item.id == id) // Find the index of the item

            if (itemIndex !== -1) { // If the item is found
                const deletedItem = items.splice(itemIndex, 1) // Delete the item from the list

                fs.writeFileSync(filePath, JSON.stringify(items)) // Write back to file

                return res.writeHead(200, {      // Return OK response
                    'Content-Type': 'application/json'
                }).end(JSON.stringify(deletedItem))
            }
            else {     // If the item is not found
                return res.writeHead(404, { 
                    'Content-Type': 'text/html' 
                }).end('<p>Item not found</p>')
            } 
        } catch (error) { // Handle any errors that are thrown from the try block
            console.warn(error)
            return res.writeHead(404, {
                'Content-type': 'text/html'
            }).end(`<p>Something went wrong</p>`)
        }

    }

    // Create new entry
    else if ((method === 'POST')) {
        const messageBody = [] // Create a new temporary storage

        req.on('data', chunk => {
            messageBody.push(chunk) // Send the chunk to the storage
        })

        req.on('end', () => {
            try {
                if (messageBody.length) {
                    const items = JSON.parse(allItems)
                    const parsedMessageBody = Buffer.concat(messageBody).toString() //Convert the buffer to string
                    
                    items.unshift(JSON.parse(parsedMessageBody)) // Send the newly created entry to the front
    
                    fs.writeFileSync(filePath, JSON.stringify(items)) // Write the file to the disk
    
                    return res.writeHead(201, { 
                        'Content-Type': 'application/json' 
                    }).end(JSON.stringify(JSON.parse(parsedMessageBody)));
                }
                else { // If there is no body with the POST request
                    return res.writeHead(400, {
                        'Content-Type': 'application/json'
                    }).end(JSON.stringify({
                        message: 'Please add a body to the request'
                    }))
                } 
                
            } catch (error) {
                console.warn(error)
                return res.writeHead(500, {
                    "Content-type": "text/html"
                }).end('<p>500 - Internal Server Error</p>') 
            }
        });
    }

    else if ((method === 'PATCH') && (url.startsWith('/v1/items'))) {
        const {query: {id} } = parsedURL

        const propertyToUpdate = []

        req.on('data', chunk => {
            propertyToUpdate.push(chunk) // Send the chunk to the storage
        })

        req.on('end', () => {
            try { // Find and update the record
                if (propertyToUpdate.length) { // If there is a body attached to the request
                    const items = JSON.parse(allItems) // Parse the JSON file
                    const itemIndex = items.findIndex(item => item.id == id) // Find the index of the item
                    items[itemIndex] = {...items[itemIndex], ...JSON.parse(propertyToUpdate)} // Update the entry
                    fs.writeFileSync(filePath, JSON.stringify(items)) // Write the file back to the disk
    
                    return res.writeHead(202, { // Send an OK response
                        'Content-Type': 'application/json' 
                    }).end(JSON.stringify(JSON.parse(propertyToUpdate)));
                }
                else { // If there is no body attached to the PATCH request
                    return res.writeHead(400, {
                        'Content-Type': 'application/json'
                    }).end(JSON.stringify({
                        message: 'Please add a body to the request'
                    }))
                }
            } 
            catch (error) { // Any other error will be caught here
                console.warn(error)
                return res.writeHead(500, {
                    "Content-type": "text/html"
                }).end('<p>500 - Internal Server Error</p>')   
            }
        })
    }
    else { // If all none of the allowed methods is sent to the API server
        return res.writeHead(404, { 
            'Content-type': 'text/html'
        }).end(`<h1>Page Not Found</h1>`)
    }
})

server.listen(port, 'localhost',() => {
    console.log(`Server is running on http://localhost:${port}`)
})