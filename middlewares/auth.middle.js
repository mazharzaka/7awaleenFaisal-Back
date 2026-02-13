const jsonwebtoken = require('jsonwebtoken');
exports.verifyToken = (req, res, next) => { 
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Access denied! Please provide a token" });
    try {
        const decoded = jsonwebtoken.verify(token, process.env.SECRET);
        // console.log(decoded);
        
        req.user = decoded.user;
        next();
    } catch (error) {
        res.status(400).json({ error: "Token is not valid" });
    }
}

exports.isAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Access denied! Please provide a token" });
    try {
        const decoded = jsonwebtoken.verify(token, process.env.SECRET);
        if (decoded.user.userType !== "admin") return res.status(403).json({ error: "Access denied! You are not an admin" });
        req.user = decoded.user;
        next();
    } catch (error) {
        res.status(400).json({ error: "Token is not valid" });
    }
}
