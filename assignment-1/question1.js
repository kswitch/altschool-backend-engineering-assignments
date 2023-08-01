const path = require('path')
const os = require('os')

// 1. The current working directory
const cwd = process.cwd()
console.log('Current Working Directory:', cwd)

// 2. The separator of a given file path (e.g someFile.js file in "someFolder" folder of the Current Working Directory)
const filePath = `${cwd}/someFolder/someFile.js`;
console.log('Separator of a file path:', path.sep);

// 3. The extension name of a file path (using the same filePath in question 2 above)
const fileExtension = path.extname(filePath);
console.log('File Extension:', fileExtension);

// 4. Process id of the current running process
console.log('Process ID:', process.pid);

// 5. The user information of the OS
const userInfo = os.userInfo();
console.log('User Information:', userInfo);

// 6. The platform of an operating system
console.log('Platform:', process.platform);