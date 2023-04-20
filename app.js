const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { Sequelize, DataTypes } = require('sequelize');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

// Connect to Postgres using Sequelize
const sequelize = new Sequelize('postgres://postgres:root@localhost:5432/postgres');

// Define a Vehicle model using Sequelize
const Vehicle = sequelize.define('vehicle', {
  make: DataTypes.STRING,
  model: DataTypes.STRING,
  year: DataTypes.INTEGER,
  price: DataTypes.FLOAT,
  isSold: DataTypes.BOOLEAN,
});

// Sync the model with the database
Vehicle.sync({ force: true })
  .then(() => {
    console.log('Vehicle table created!');
  })
  .catch((err) => {
    console.error(err);
  });

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// GET all vehicles
app.get('/vehicles', async (req, res) => {
  const vehicles = await Vehicle.findAll();
  res.json(vehicles);
});

// GET a single vehicle by ID
app.get('/vehicles/:id', async (req, res) => {
  const vehicle = await Vehicle.findByPk(req.params.id);
  if (vehicle) {
    res.json(vehicle);
  } else {
    res.status(404).send('Vehicle not found');
  }
});

// POST a new vehicle
app.post('/vehicles', async (req, res) => {
  const vehicle = await Vehicle.create(req.body);
  res.json(vehicle);
});

// PUT (update) an existing vehicle
app.put('/vehicles/:id', async (req, res) => {
  const vehicle = await Vehicle.findByPk(req.params.id);
  if (vehicle) {
    vehicle.make = req.body.make;
    vehicle.model = req.body.model;
    vehicle.year = req.body.year;
    vehicle.price = req.body.price;
    vehicle.isSold = req.body.isSold;
    await vehicle.save();
    res.json(vehicle);
  } else {
    res.status(404).send('Vehicle not found');
  }
});

// DELETE a vehicle
app.delete('/vehicles/:id', async (req, res) => {
  const vehicle = await Vehicle.findByPk(req.params.id);
  if (vehicle) {
    await vehicle.destroy();
    res.json({ message: 'Vehicle deleted' });
  } else {
    res.status(404).send('Vehicle not found');
  }
});

module.exports=app;
