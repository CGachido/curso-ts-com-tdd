export default {
  mongoUrl: process.env.MONGOURL || 'mongodb://localhost:27017/clean-node-api',
  port: process.env.MONGOURL || 5050,
  jwtSecret: process.env.JWT_SECRET || 'c95f990a0d646f06995b81df24b43307'
}
