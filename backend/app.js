var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var http = require('http'); // Dodano za ustvarjanje HTTP strežnika
var socketIo = require('socket.io'); // Dodano za Socket.IO

// vključimo mongoose in ga povežemo z MongoDB
var mongoose = require('mongoose');
var mongoDB = "mongodb://127.0.0.1/strinder";
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// vključimo routerje
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/userRoutes');
var photosRouter = require('./routes/photoRoutes');
var friendsRouter = require('./routes/friendsRoutes');
var chatRouter = require('./routes/chatRoutes');
var workoutRouter = require('./routes/workoutRoutes');
var testRoutes = require('./routes/testRoutes');

// Uvozimo model za sporočila
var Message = require('./models/chatModel');

var app = express();
var server = http.createServer(app); // Ustvarimo HTTP strežnik
var io = socketIo(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:19006', 'http://10.0.2.2:3000'], 
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

var cors = require('cors');
var allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:19006'];
app.use(cors({
  credentials: true,
  origin: function(origin, callback){
    // Allow requests with no origin (mobile apps, curl)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin)===-1){
      var msg = "The CORS policy does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Vključimo session in connect-mongo.
 * Connect-mongo skrbi, da se session hrani v bazi.
 * Posledično ostanemo prijavljeni, tudi ko spremenimo kodo (restartamo strežnik)
 */
var session = require('express-session');
var MongoStore = require('connect-mongo');
app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  store: MongoStore.create({mongoUrl: mongoDB})
}));
//Shranimo sejne spremenljivke v locals
//Tako lahko do njih dostopamo v vseh view-ih (glej layout.hbs)
app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/photos', photosRouter);
app.use('/friends', friendsRouter);
app.use('/chat', chatRouter);
app.use('/workouts', workoutRouter)
app.use('/test', testRoutes);

// Dodamo Socket.IO instanco v Express app, da jo lahko uporabljajo kontrolerji
app.set('io', io);

// Socket.IO logika
io.on('connection', (socket) => {
  console.log('Uporabnik povezan:', socket.id);

  // Poslušaj, ko se uporabnik pridruži chatu
  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
    console.log(`Uporabnik se je pridružil chatu: ${chatId}`);
  });

  // Poslušaj sporočila
  socket.on('sendMessage', async (data) => {
    console.log('Novo sporočilo:', data);

    try {
      // Shrani sporočilo v bazo
      const newMessage = new Message({
        content: data.content,
        sentAt: new Date(),
        sentBy: data.sentBy, // Prepričaj se, da frontend pošilja ID uporabnika
        belongsTo: data.chatId,
      });

      await newMessage.save();

      // Pošlji sporočilo vsem uporabnikom v istem chatu
      io.to(data.chatId).emit('receiveMessage', newMessage);
    } catch (err) {
      console.error('Napaka pri shranjevanju sporočila:', err);
    }
  });

  // Poslušaj odklop
  socket.on('disconnect', () => {
    console.log('Uporabnik odklopljen:', socket.id);
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json(err);
});

module.exports = { app, server }; // Izvozi tako app kot server