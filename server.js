const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// heroku
// Example route
app.get('/api/data', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});


// MongoDB connection
mongoose.connect('mongodb+srv://obaida9094:ADNq2M8v7SQGEVdv@cluster0.taluv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Customer schema and model
const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: Number, required: true },
  details: { type: String, required: true }
});

const Customer = mongoose.model('Customer', customerSchema);

// Appointment schema and model
const appointmentSchema = new mongoose.Schema({
  schedule: [[String]], // 2D array for appointments
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

// Get all customers
app.get('/customers', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (error) {
    res.status(500).send('Error fetching customers');
  }
});

// Add a new customer
app.post('/customers', async (req, res) => {
  const { name, phone, details } = req.body;
  const newCustomer = new Customer({ name, phone, details });
  
  try {
    await newCustomer.save();
    res.json(newCustomer);
  } catch (error) {
    res.status(500).send('Error adding customer');
  }
});

// Update a customer
app.put('/customers/:id', async (req, res) => {
  const { id } = req.params;
  const { name, phone, details } = req.body;

  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(id, { name, phone, details }, { new: true });
    res.json(updatedCustomer);
  } catch (error) {
    res.status(500).send('Error updating customer');
  }
});

// Delete a customer
app.delete('/customers/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await Customer.findByIdAndDelete(id);
    res.sendStatus(204); // No content
  } catch (error) {
    res.status(500).send('Error deleting customer');
  }
});

// Get appointment schedule
app.get('/appointments', async (req, res) => {
  try {
    const appointment = await Appointment.findOne();
    res.json(appointment || { schedule: Array.from({ length: 10 }, () => Array(7).fill('')) });
  } catch (error) {
    res.status(500).send('Error fetching appointments');
  }
});

// Save appointment schedule
app.post('/appointments', async (req, res) => {
  const { schedule } = req.body;

  try {
    const existingAppointment = await Appointment.findOne();

    if (existingAppointment) {
      existingAppointment.schedule = schedule;
      await existingAppointment.save();
    } else {
      const newAppointment = new Appointment({ schedule });
      await newAppointment.save();
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).send('Error saving appointments');
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
