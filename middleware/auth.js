// module.exports = function (req, res, next) {
//     const username = process.env.LOGIN_USERNAME;
//     const password = process.env.LOGIN_PASSWORD;
//     const user = req.body.name;
//     const pass = req.body.pass;

//     if (user === username && pass === password) {
//         return next()
//     }

//     res.status(401).send("<h1>Unauthorized</h1><br><a href='/'>Try again</a>");
// }

// const auth = require("basic-auth");
// var compare = require("tsscmp");

// function check(name, pass) {
//   var valid = true;

//   // Simple method to prevent short-circut and use timing-safe compare
//   valid = compare(name, "john") && valid;
//   valid = compare(pass, "secret") && valid;

//   return valid;
// }

// module.exports = function(req, res, next) {
//   const credentials = auth(req);

//   if (!credentials || !check(credentials.name, credentials.pass)) {
//     res.statusCode = 401;
//     res.setHeader("WWW-Authenticate", 'Basic realm="example"');
//     res.end("Access denied");
//   } else {
//     res.redirect("/");
//   }
// };


module.exports = function () {

    basicAuth({
        users: {
            username: password
        },
        challenge: false
    })
}