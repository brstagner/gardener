/** Auth JWT token, add auth'd user (if any) to req. */

function authenticateJWT (req, res, next) {
    try {
        const tokenFromBody = req.body._token;
        const payload = jwt.verify(tokenFromBody, SECRET_KEY);
        req.user = payload;
        return next();
    } catch (err) {
        // error in this middleware isn't error -- continue on
        return next();
    }
}