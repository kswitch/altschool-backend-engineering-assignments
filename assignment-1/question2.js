const fs = require('fs');
const path = require('path');

// 1. Create a folder named “Students” in the Current Working Directory
fs.mkdirSync('Students');

// 2. Create a file named user.js in the Students folder
fs.writeFileSync(path.join('Students', 'user.js'), '');

// 3. Rename/Update the Students folder to “Names”
fs.renameSync('Students', 'Names');

// 4. Adding my name as content to the file user.js
const myName = 'Kingsley Osuagwu-Chidiadi';
fs.writeFileSync('Names/user.js', myName);

// 5. Update the file and add my age, sex, nationality, phone number and any other information about myself
const myInfo = {
    name: myName,
    age: "I'll never tell",
    sex: 'Male',
    nationality: 'Nigeria',
    phoneNumber: 234812322943,
    currentSchool: 'AltSchool Africa',
    currentDepartment: "Backend Engineering (NodeJS)"
}

fs.writeFileSync('Names/user.js', JSON.stringify(myInfo, null, 2));

// 6. Rename/Update the file user.js to {my_name}.js
const newName = 'kingsley_osuagwuChidiadi.js';
fs.renameSync('Names/user.js', `Names/${newName}`)

// 7. Read the contents from {your_name}.js. Use fs.open or fs.readFile
fs.readFile(`Names/${newName}`, 'utf-8', (err, data) => {
  if (err) {
    console.error('Error:', err);
    throw new err
  } else {
    console.log('Contents of the file:', data);
  }
});

// 8. Delete the {my_name}.js file
fs.unlinkSync(`Names/${newName}`);

// 9. Delete the “Names” folder
fs.rmdirSync('Names');