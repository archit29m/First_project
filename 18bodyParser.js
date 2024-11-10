const path = require('path');
const express = require('express');
const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const bodyParser = require('body-parser');
app.use(bodyParser.json());
const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');


app.listen(7002, () => {
    console.log('Server is running on port 7002');
});

//Back end data connection
mongoose.connect('mongodb://localhost:27017/myDatabase')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB:', err));

//Variable to store data
const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
});

const Contact = mongoose.model('Contact', contactSchema);

// Middleware
app.set('view engine', 'ejs');
app.use('/assets', express.static('assets'));
const urlencodedParser = bodyParser.urlencoded({ extended: true });

app.use((req, res, next) => {
    const startTime = Date.now(); // Start Time
    res.on('finish', () => {
        const endTime = Date.now(); // Capture the end time when response is sent
        const rtt = endTime - startTime;
        console.log(`RTT for ${req.method} ${req.url}: ${rtt}ms`);
    });
    next();
});

// GET route to render the contact form
app.get('/contact', function(req, res){
    console.log(req.query);
    res.render('contact', { qs: req.query });
    console.log('Requested for Contact page on ' + req.url);
});

// POST route to handle form submission and save data to MongoDB
app.post('/contact', urlencodedParser, async function(req, res) {
    const newContact = new Contact({
        name: req.body.name,
        department: req.body.department,
        email: req.body.email
    });
    try {
        const savedContact = await newContact.save();
        res.render('contact-success', { data: savedContact });
        console.log('Data Input in the form: ', { data: savedContact });
    } catch (err) {
        console.error('Error saving contact:', err);
        res.status(500).send('Error saving contact');
    }
});

    // PUT route to update an existing contact
    app.put('/contact/:id', async (req, res) => {
        try {
            const updatedContact = await Contact.findByIdAndUpdate(
                req.params.id,
                {
                    name: req.body.name,
                    department: req.body.department,
                    email: req.body.email
                },
                { new: true } // Returns the updated document
            );
            if (!updatedContact) return res.status(404).send("Contact not found");
            res.json(updatedContact);
        } catch (err) {
            console.error("Error updating contact:", err);
            res.status(500).send("Error updating contact");
        }
    });    

// DELETE route to delete a contact
app.delete('/contact/:id', async (req, res) => {
    try {
        const deletedContact = await Contact.findByIdAndDelete(req.params.id);
        if (!deletedContact) return res.status(404).send("Contact not found");
        res.json(deletedContact);
    } catch (err) {
        console.error("Error deleting contact:", err);
        res.status(500).send("Error deleting contact");
    }
});


app.get('/', function(req, res){
    res.render('home');
    console.log('Requested for Home page on ' + req.url);
});

app.get('/home', function(req, res){
    res.render('home');
    console.log('Requested for Home page on ' + req.url);
});

// app.get('/profile/:name', function(req, res){
//     const data = { age: 20, job: 'Ninja' };
//     res.render('profile', { person: req.params.name, data: data });
// });
app.get('/kiit', function(req, res){
    res.send('you are connected to KIIT');
})

app.use((req, res) => {
    res.status(404).send('URL doesn\'t exist, Error 404');
});

