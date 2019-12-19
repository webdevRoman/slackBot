const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { RTMClient } = require('@slack/rtm-api');
const { WebClient } = require('@slack/web-api');

const token = 'xoxb-************-************-************************';

const rtm = new RTMClient(token);
const web = new WebClient(token);

const app = express();
app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// DB
mongoose.connect('mongodb://localhost/slackbot', { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Connected to DB');
});
const Schema = mongoose.Schema;
const pizzaSchema = new Schema({
  name: String,
  size: [Number]
});
const Pizza = mongoose.model('Pizza', pizzaSchema);
const orderSchema = new Schema({
  user: String,
  pizzaName: String,
  pizzaSize: Number,
  address: String,
  status: String
});
const Order = mongoose.model('Order', orderSchema);

// Server
const PORT = 4390;
app.listen(PORT, function () {
  console.log("Server listening on: http://localhost:%s", PORT);
});

app.get('/', function (req, res) {
  // console.log('Ngrok is working! Path Hit: ' + req.url);
  let orderQuery = Order.find({});
  orderQuery.exec().then(
    result => res.render('index', { orders: result }),
    error => console.log("Rejected: " + error)
  );
});

app.post('/', function (req, res) {
  let orderQuery = Order.findOne({ user: req.body.user });
  let conversationId, status;
  switch (req.body.body) {
    case 'submit':
      orderQuery.exec(function (err, order) {
        if (err) return console.log('Error on changing status: ' + err);
        order.status = 'подтверждён';
        order.save(function (err) {
          if (err) throw err;
          console.log('Order status changed for ' + order.user + '\'s order');
        });
      });
      status = { status: 'подтверждён' };
      web.im.open({token: token, user: req.body.user}).then(
        result => {
          (async () => {
            conversationId = result.channel.id;
            const reply1 = await web.chat.postMessage({
              text: `<@${req.body.user}>, статус вашего заказа изменён на "подтверждён"`,
              channel: conversationId,
            });
            console.log(`Successfully send message ${reply1.ts} in conversation ${conversationId}`);
          })();
        },
        error => console.log("Rejected: " + error)
      );
      break;

    case 'deny':
      orderQuery.exec(function (err, order) {
        if (err) return console.log('Error on changing status: ' + err);
        order.status = 'отклонён';
        order.save(function (err) {
          if (err) throw err;
          console.log('Order status changed for ' + order.user + '\'s order');
        });
      });
      status = { status: 'отклонён' };
      web.im.open({token: token, user: req.body.user}).then(
        result => {
          (async () => {
            conversationId = result.channel.id;
            const reply1 = await web.chat.postMessage({
              text: `<@${req.body.user}>, статус вашего заказа изменён на "отклонён"`,
              channel: conversationId,
            });
            console.log(`Successfully send message ${reply1.ts} in conversation ${conversationId}`);
          })();
        },
        error => console.log("Rejected: " + error)
      );
      break;

    case 'done':
      orderQuery.exec(function (err, order) {
        if (err) return console.log('Error on changing status: ' + err);
        order.status = 'доставлен';
        order.save(function (err) {
          if (err) throw err;
          console.log('Order status changed for ' + order.user + '\'s order');
        });
      });
      status = { status: 'доставлен' };
      web.im.open({token: token, user: req.body.user}).then(
        result => {
          (async () => {
            conversationId = result.channel.id;
            const reply1 = await web.chat.postMessage({
              text: `<@${req.body.user}>, статус вашего заказа изменён на "доставлен"`,
              channel: conversationId,
            });
            console.log(`Successfully send message ${reply1.ts} in conversation ${conversationId}`);
          })();
        },
        error => console.log("Rejected: " + error)
      );
      break;

    default:
      console.log('Status wasn\'t changed');
      break;
  }

  orderQuery.exec().then(
    result => res.json(status),
    error => console.log("Rejected: " + error)
  );
});


// Bot
const toInitCap = (string) => { return string.replace(string.substr(0, 1), string.substr(0, 1).toUpperCase()); }

(async () => {
  const pizzas = await Pizza.find({});

  const { self, team } = await rtm.start();
  const botId = self.id;

  rtm.on('member_joined_channel', async (event) => {
    const welcomeMessage = await rtm.sendMessage(`Добро пожаловать на канал, <@${event.user}>, если вы хотите заказать пиццу, напишите: "<@${botId}> заказ`, event.channel);
    console.log('Welcoming message sent successfully', welcomeMessage.ts);
  });

  rtm.on('message', async (event) => {
    // console.log(event);
    const message = event.text.split(' ');
    if (message[0] === `<@${botId}>`) {
      let user = event.user;

      let reply, messageText, orderQuery, pizzaName = '', pizzaSize, address = '', flagName, flagSize;

      switch (message[1].toLowerCase()) {
        case 'заказ':
          Order.create({
            user: user
          }, function (err, order) {
            if (err) return handleError(err);
            console.log(order.user + '\'s order is added to DB');
          });
          messageText = 'Выберите пиццу из списка:';
          for (let i = 0; i < pizzas.length; i++) {
            messageText += '\n- ' + pizzas[i].name;
          }
          messageText += `\nЗатем напишите: "<@${botId}> пицца (Название пиццы)"`;
          reply = await rtm.sendMessage(messageText, event.channel);
          console.log('Order message sent successfully', reply.ts);
          break;

        case 'пицца':
          flagName = false;
          for (let i = 2; i < message.length; i++)
            pizzaName += message[i].toLowerCase() + ' ';
          pizzaName = pizzaName.substring(0, pizzaName.length - 1);
          pizzas.forEach(async (pizza) => {
            if (pizzaName === pizza.name.toLowerCase()) {
              flagName = true;
              await Order.findOne({
                user: user
              }).exec(function (err, order) {
                if (err) return handleError(err);
                order.pizzaName = pizzaName;
                order.save(function (err) {
                  if (err) throw err;
                  console.log('Pizza name added to ' + order.user + '\'s order');
                });
              });
              messageText = 'Выберите размер пиццы из списка:';
              for (let i = 0; i < pizza.size.length; i++)
                messageText += '\n- ' + pizza.size[i] + 'см';
              messageText += `\nЗатем напишите: "<@${botId}> размер (Размер пиццы числом, без "см")"`;
              reply = await rtm.sendMessage(messageText, event.channel);
              console.log('Pizza name message sent successfully', reply.ts);
            }
          });
          if (!flagName) {
            reply = await rtm.sendMessage('Введено неверное название пиццы', event.channel);
            console.log('Wrong pizza name message sent successfully', reply.ts);
          }
          break;

        case 'размер':
          pizzaSize = message[2];
          orderQuery = await Order.findOne({ user: user });
          let pizzaQuery = await Pizza.findOne({ name: toInitCap(orderQuery.pizzaName) });
          let sizes = pizzaQuery.size;
          flagSize = false;
          sizes.forEach(size => {
            if (pizzaSize == size)
              flagSize = true;
          });
          if (!flagSize) {
            reply = await rtm.sendMessage('Введен неверный размер пиццы', event.channel);
            console.log('Wrong pizza size message sent successfully', reply.ts);
            break;
          } else {
            await Order.findOne({
              user: user
            }).exec(function (err, order) {
              if (err) return handleError(err);
              order.pizzaSize = pizzaSize;
              order.save(function (err) {
                if (err) throw err;
                console.log('Pizza size added to ' + order.user + '\'s order');
              });
            });
            reply = await rtm.sendMessage(`Введите адрес следующим образом: "<@${botId}> адрес (Ваш адрес)"`, event.channel);
            console.log('Pizza size message sent successfully', reply.ts);
          }
          break;

        case 'адрес':
          for (let i = 2; i < message.length; i++)
            address += message[i] + ' ';
          address = address.substring(0, address.length - 1);
          await Order.findOne({ user: user }).
          exec(function (err, order) {
            if (err) return handleError(err);
            order.address = address;
            order.status = 'новый';
            order.save(function (err) {
              if (err) throw err;
              console.log('Address and status added to ' + order.user + '\'s order');
            });
          });
          reply = await rtm.sendMessage('Ваш заказ принят в обработку', event.channel);
          console.log('Confirm message sent successfully', reply.ts);
          break;

        case 'статус':
          orderQuery = await Order.findOne({ user: user });
          if (orderQuery === null || orderQuery.status == undefined) {
            reply = await rtm.sendMessage('Статус вашего заказа: Заказ не создан', event.channel);
            console.log('Status message sent successfully', reply.ts);
          } else {
            reply = await rtm.sendMessage('Статус вашего заказа: ' + toInitCap(orderQuery.status), event.channel);
            console.log('Status message sent successfully', reply.ts);
          }
          break;

        case 'помощь':
          reply = await rtm.sendMessage(`Список возможных команд:\n<@${botId}> заказ - начало оформления заказа\n<@${botId}> помощь - список возможных команд\n<@${botId}> статус - статус вашего заказа`, event.channel);
          console.log('Help message sent successfully', reply.ts);
          break;

        default:
          reply = await rtm.sendMessage(`<@${event.user}>, кажется, вы ввели неверную команду. Список возможных команд:\n<@${botId}> заказ - начало оформления заказа\n<@${botId}> помощь - список возможных команд\n<@${botId}> статус - статус вашего заказа`, event.channel);
          console.log('Default message sent successfully', reply.ts);
          break;
      }

    }
  });

})();