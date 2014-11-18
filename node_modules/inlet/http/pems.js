var path = require('path'), fs = require('fs')
module.exports = {
    cert: fs.readFileSync(path.join(__dirname, '../t/fixtures/certs/agent1-cert.pem')),
    key: fs.readFileSync(path.join(__dirname, '../t/fixtures/certs/agent1-key.pem')),
    ca: fs.readFileSync(path.join(__dirname, '../t/fixtures/certs/ca1-cert.pem'))
}
