const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/slackbot', { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to DB');
});

const Schema = mongoose.Schema;
const pizzaSchema = new Schema({
  name:  String,
  size: [Number]
});
const Pizza = mongoose.model('Pizza', pizzaSchema);
// const orderSchema = new Schema({
//   user:  String,
//   pizzaName: String,
//   pizzaSize: Number,
//   address: String
// });
// const Order = mongoose.model('Order', orderSchema);

// Add pizzas
Pizza.insertMany([
  {
    name: 'Мясной пир',
    size: [28, 36, 42]
  },
  {
    name: 'Пепперони',
    size: [36, 42]
  },
  {
    name: 'Маргарита',
    size: [28, 36]
  },
  {
    name: '4 сыра',
    size: [28, 36, 42]
  },
  {
    name: 'Барбекю',
    size: [28, 36]
  },
  {
    name: 'Молчание ягнят',
    size: [28, 42]
  },
  {
    name: 'Цезарь',
    size: [28, 36, 42]
  }
], function(err) {
  console.log('Error on inserting pizzas to DB: ', err);
});

// // Delete all pizzas
// Pizza.deleteMany({}, function (err) {
//   if (err) return handleError(err);
//   console.log('Deleted all pizzas');
// });
// // Delete all orders
// Order.deleteMany({}, function (err) {
//   if (err) return handleError(err);
//   console.log('Deleted all orders');
// });