module.exports = function (req, res, next) {
    const username = process.env.LOGIN_USERNAME;
    const password = process.env.LOGIN_PASSWORD;
    const user = req.body.name;
    const pass = req.body.pass;

    console.log(req.body, username, password);

    if (user === username && pass === password) {
        console.log('success')
        return next()
    }

    res.status(401).send("<h1>Unauthorized</h1><br><a href='/'>Try again</a>");
}