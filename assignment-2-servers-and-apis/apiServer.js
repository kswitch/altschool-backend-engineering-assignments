const fs = require('fs')
const http = require('http')
const nodeURL = require('url')

const port = 3002
const filePath = `${__dirname}/data/items.json`

function readFileFromDisk() {
    return fs.readFileSync(filePath, 'utf-8')
}

function writeFileToDisk(data) {
    return fs.writeFileSync(filePath, JSON.stringify(data))
}

function responseHandler(res, code = 200, contentType='text/plain', data ) {
    return res.writeHead(code, {
        "Content-type": contentType
    }).end(contentType == "application/json" ? JSON.stringify(data) : data)
}

const server = http.createServer((req, res) => {
    const {url, method} = req
    const parsedURL = nodeURL.parse(url, true)
    const {path, pathname, search} = nodeURL.parse(url, true)

    console.log(parsedURL);

   //========== GET Requests ========//
    if (method === 'GET') {
        // Index Page Served
        if ((path === '/') || (path === '/index.html')) {
            return responseHandler(res, 200, 'text/html', `<h1>Welcome to a Simple API server</h1>`)
        }

        // Get all items list
        else if (path === '/v1/items') { 
            const allItems = readFileFromDisk()
            const file =  JSON.parse(allItems)
            return responseHandler(res, 200, 'application/json', file) // Return all items
        }

        // Get the details of a specific item by ID
        else if ((pathname === '/v1/items') && path.startsWith('/v1/items') && (search !== null)) {
            const {query: {id} } = parsedURL

            if (!id) {
                // Errors for GET requests without an ID
                return responseHandler(res, 400, 'text/html', `<h1>This is a Bad GET Request. Please specify ID</h1>`)
            }
            else {
                try {
                    const allItems = readFileFromDisk()
                    const items = JSON.parse(allItems)
                    const foundItem = items.find(item => id === item.id)
        
                    if (foundItem) {
                        return responseHandler(res, 200, 'application/json', foundItem) // Return specific item
                    }
                    else {
                        return responseHandler(res, 404, 'text/html', `<p>Item with ID: ${id} Not Found</p>`) // Item not found
                    }
                } 
                catch (error) {
                    console.warn(error)
                    return responseHandler(res, 500, 'text/html', `<p>Something went wrong</p>`) // Handle server errors
                }
            }
        }
        else {
            return responseHandler(res, 404, 'text/html', `<h1>Page Not Found</h1>`) // Error Handling for bad search params and URLs
        }
    }

    //========== POST Requests ========//
    else if (method === 'POST') {
        if (path !== '/v1/items') {
            // POST requests to wrong URL
            return responseHandler(res, 404, 'text/html', '<p>Page Not Found</p>') 
        }
        else {
            const messageBody = [] // Create a new temporary storage
    
            req.on('data', chunk => {
                messageBody.push(chunk) // Send the chunk to the storage
            })
    
            req.on('end', () => {
                try {
                    if (!messageBody.length) {
                        // If there is no body with the POST request, return Bad Request response
                        return responseHandler(res, 400, 'application/json', {error: 'Please add a body to the POST request'}) 
                    }
                    else {
                        const allItems = readFileFromDisk()
                        const items = JSON.parse(allItems)
                        const parsedMessageBody = Buffer.concat(messageBody).toString() // Convert the buffer to string
                        
                        items.unshift(JSON.parse(parsedMessageBody)) // Send the newly created entry to the front
                        writeFileToDisk(items) // Write file back to Disk
    
                        return responseHandler(res, 201, 'application/json', JSON.parse(parsedMessageBody)) // Return response
                    } 
                } catch (error) {
                    console.warn(error)
                    return responseHandler(res, 500, 'text/html', '<p>500 - Internal Server Error</p>') 
                }
            });
        }
    }

    //========== PATCH Requests ========//
    else if (method === 'PATCH') {
        if (pathname !== '/v1/items') {
            // PATCH requests to wrong URL
            return responseHandler(res, 404, 'text/html', '<p>Page Not Found</p>') 
        }
        else if ((pathname === '/v1/items') && path.startsWith('/v1/items') && (search !== null))  {
            const {query: {id} } = parsedURL

            if (!id) {
                // Errors for PATCH requests without an ID
                return responseHandler(res, 400, 'text/html', `<h1>This is a Bad PATCH Request</h1>`)
            }
            else {
                const propertyToUpdate = []

                req.on('data', chunk => {
                    propertyToUpdate.push(chunk) // Send the chunk to the storage
                })
        
                req.on('end', () => {
                    try { // Try to find and update the record
                        if (!propertyToUpdate.length) {
                            // If there is no body attached to the PATCH request
                            return responseHandler(res, 400, 'application/json', {error: 'Bad Request. Please add a body to the PATCH request'})
                        }
                        else { 
                            const file = fs.readFileSync(filePath, 'utf-8') // Read file again since it is a PATCH request
                            const items = JSON.parse(file) // Parse the JSON file
                            const itemIndex = items.findIndex(item => item.id == id) // Find the index of the item

                            // Update Item if it is found
                            if (itemIndex !== -1) {
                                items[itemIndex] = {...items[itemIndex], ...JSON.parse(propertyToUpdate)} // Update the entry
                                fs.writeFileSync(filePath, JSON.stringify(items)) // Write the file back to the disk
            
                                return responseHandler(res, 202, 'application/json', JSON.parse(propertyToUpdate)) // Send an OK response
                            }
                            else {
                                return responseHandler(res, 404, 'text/html', `<p>Item with ID: ${id} to Update Not Found</p>`) // Item not found
                            }
                        }
                    } 
                    catch (error) {
                        console.warn(error)
                        return responseHandler(res, 500, 'text/html', '<p>500 - Internal Server Error</p>') // Handle Server Errors
                    }
                })
            }
        }
        else {
            return responseHandler(res, 404, 'text/html', `<h1>Page Not Found</h1>`) // Error Handling for bad search params and URLs
        }
    }

    //========== DELETE Requests ========//
    else if (method === 'DELETE') {
        if (pathname !== '/v1/items') {
            // Error Handling for delete requests to wrong URL
            return responseHandler(res, 400, 'text/html', `<h1>Page Not Found</h1>`)
        }
        else if ((pathname === '/v1/items') && path.startsWith('/v1/items') && (search !== null)) {
            const {query: {id} } = parsedURL

            if (!id) {
                // Errors for DELETE requests without an ID
                return responseHandler(res, 400, 'text/html', `<h1>This is a Bad DELETE Request</h1>`)
            }
            else {
                try {
                    const allItems = readFileFromDisk()
                    const items = JSON.parse(allItems) // Parse the JSON file
                    const itemIndex = items.findIndex(item => item.id == id) // Find the index of the item
        
                    if (itemIndex !== -1) { // If the item is found
                        const deletedItem = items.splice(itemIndex, 1) // Delete the item from the list
                        writeFileToDisk(items) // Write file back to Disk
        
                        return responseHandler(res, 200, 'application/json', deletedItem) // Return OK response
                    }
                    else { // If the item is not found
                        return responseHandler(res, 404, 'text/html', `<p>Item with ID: ${id} Not Found for deletion</p>`) // Item not found
                    }
                } 
                catch (error) { 
                    // Handle any errors that are thrown from the try block
                    console.warn(error)
                    return responseHandler(res, 500, 'text/html', `<p>Something went wrong. Delete Error</p>`)
                }
            }
        }
        else {
            return responseHandler(res, 404, 'text/html', `<h1>Page Not Found</h1>`) // Error Handling for bad search params and URLs
        }
    }

    // If none of the allowed methods is sent to the API server
    else { 
        return responseHandler(res, 405, 'text/html', '<h1>Method Not Allowed</h1>')
    }
})

server.listen(port, 'localhost',() => {
    console.log(`Server is running on http://localhost:${port}`)
})