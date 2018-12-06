const crypto = require('crypto');

function randomId() {
    var id = '';
    var charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (let i = 0; i < 8; i++)
        id += charset.charAt(Math.floor(Math.random() * charset.length));
  
    return id;
}

function randomEmail() {
    var email = '';
    var charset = 'abcdefghijklmnopqrstuvwxyz';
  
    for (let i = 0; i < 5; i++)
        email += charset.charAt(Math.floor(Math.random() * charset.length));
    email += '@';
    for (let i = 0; i < 4; i++)
        email += charset.charAt(Math.floor(Math.random() * charset.length));
    email += '.com'
  
    return email;
}

function randomString(n) {
    var string = '';
    var charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  
    for (let i = 0; i < n; i++)
        string += charset.charAt(Math.floor(Math.random() * charset.length));
  
    return string;
}

function randomName() {
    var name = '';
    var charset = 'abcdefghijklmnopqrstuvwxyz';
  
    for (let i = 0; i < 5; i++) {
        name += charset.charAt(Math.floor(Math.random() * charset.length));
        if (i === 0) {
            name = name.toUpperCase();
        }
    }
  
    return name;
}

function randomSalt() {
    var salt = '';
    var charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (let i = 0; i < 20; i++)
        salt += charset.charAt(Math.floor(Math.random() * charset.length));
  
    return salt;
}

function createPassword(plainTextPassword, salt) {
    const passTheSalt = salt + plainTextPassword;
    const hashedPassword = crypto.createHash('sha256').update(passTheSalt).digest('hex').toString();

    return hashedPassword;
}

function randomStatus() {
    var status = '';
    var charset = '    abcdefghijklmnopqrstuvwxyz';
  
    status = 'status ';
    for (let i = 0; i < 50; i++)
        status += charset.charAt(Math.floor(Math.random() * charset.length));
  
    return status;
}

module.exports = {
    randomId,
    randomEmail,
    randomString,
    randomName,
    randomSalt,
    createPassword,
    randomStatus
}
