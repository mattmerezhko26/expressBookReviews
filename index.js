const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
      return res.status(403).json({ message: "No token provided" });
  }

  // Remove "Bearer " from the token (if present)
  const tokenWithoutBearer = token.startsWith("Bearer ") ? token.slice(7, token.length) : token;

  jwt.verify(tokenWithoutBearer, 'your_jwt_secret_key', function(err, decoded) {
      if (err) {
          return res.status(401).json({ message: "Unauthorized access" });
      }

      // If the token is valid, store the user info in session
      req.session.user = decoded;

      // Continue to the next middleware or route handler
      next();
  });
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
