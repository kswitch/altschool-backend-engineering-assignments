const fs = require('fs')
const http = require('http')
const nodeURL = require('url')

const port = 3002
const filePath = `${__dirname}/data/items.json`
const allItems = fs.readFileSync(filePath, 'utf-8')

function responseHandler(res, code = 200, contentType='text/plain', data ) {
    return res.writeHead(code, {
        "Content-type": contentType
    }).end(contentType == "application/json" ? JSON.stringify(data) : data)
}

const server = http.createServer((req, res) => {
    const {url, method} = req
    const parsedURL = nodeURL.parse(url, true)

    // Get all items list
    if ((url === '/v1/items') && (method === 'GET')) { 
        const file = JSON.parse(allItems)
        return responseHandler(res, 200, 'application/json', file) // Return all items
    }

    // Get the details of a specific item by ID
    else if ((url.startsWith('/v1/items')) && (method === 'GET')) {
        const {query: {id} } = parsedURL

        try {
            if (id) {
                const items = JSON.parse(allItems)
                const foundItem = items.find(item => id === item.id)
    
                if (foundItem) {
                    return responseHandler(res, 200, 'application/json', foundItem) // Return specific item
                }
                else {
                    return responseHandler(res, 404, 'text/html', `<p>Item Not Found</p>`) // Item not found
                }
            }
            else {
                return responseHandler(res, 404, 'text/html', `<h1>Page Not Found</h1>`) // Error Handling for bad search params and URLs
            }
        } 
        catch (error) {
            console.warn(error)
            return responseHandler(res, 500, 'text/html', `<p>Something went wrong</p>`) // Handle server errors
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

                return responseHandler(res, 200, 'application/json', deletedItem) // Return OK response
            }
            else {     // If the item is not found
                return responseHandler(res, 404, 'text/html', '<p>Item Not Found</p>') // Item not found
            } 
        } 
        catch (error) { 
            // Handle any errors that are thrown from the try block
            console.warn(error)
            return responseHandler(res, 500, 'text/html', `<p>Something went wrong. Delete Error</p>`)
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

                    return responseHandler(res, 201, 'application/json', JSON.parse(parsedMessageBody)) // Return response
                }
                else {
                    // If there is no body with the POST request, return Bad Request response
                    return responseHandler(res, 400, 'application/json', {message: 'Please add a body to the request'}) 
                } 
                
            } catch (error) {
                console.warn(error)
                // Return Server Error
                return responseHandler(res, 500, 'text/html', '<p>500 - Internal Server Error</p>') 
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

                    return responseHandler(res, 202, 'application/json', JSON.parse(propertyToUpdate)) // Send an OK response
                }
                else { 
                    // If there is no body attached to the PATCH request
                    return responseHandler(res, 400, 'application/json', {message: 'Please add a body to the request'})
                }
            } 
            catch (error) {
                console.warn(error)
                return responseHandler(res, 500, 'text/html', '<p>500 - Internal Server Error</p>') // Handle Server Errors
            }
        })
    }
    else { 
        // If all none of the allowed methods is sent to the API server
        return responseHandler(res, 404, 'text/html', `<h1>Page Not Found</h1>`)
    }
})

server.listen(port, 'localhost',() => {
    console.log(`Server is running on http://localhost:${port}`)
})