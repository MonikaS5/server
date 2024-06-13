//server.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 5000;


const app = express();


//bodyparser used for parsing request body

app.use(bodyParser.json());
app.use(cors());

// Multer setup for file uploads
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/');
	},
	filename: function (req, file, cb) {
		cb(null,  Date.now() + '_'+ file.originalname);
	}
});
const upload = multer({ storage: storage });

// MongoDB connection
const uri = process.env.DB_CONNECT;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log('MongoDB connected'))
	.catch(err => console.log(err));


//schema


const addressSchema = new mongoose.Schema({
	name: String,
	email: String,
	Telephone: String,
	mobile: Number,
	address: String,
	image: {
		filename: String,
		path: String,
		originalname: String,
		createdAt: {type: Date, default: Date.now}
	}
	
});
const Address = mongoose.model('myaddress', addressSchema);

//Get route for fetching addresses from database
app.get('/api/addresses', async (req, res) => {
	try {
		const addresses = await Address.find();
		res.json(addresses);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});



app.post('/api/addresses', upload.single('image'), (req, res) => {

	const newAddress = new Address({

		name: req.body.name,
		email: req.body.email,
		Telephone: req.body.Telephone,
		mobile: req.body.mobile,
		address: req.body.address,
		image: req.file ? 
		{
			filename: req.file.filename,
			path: req.file.path,
			originalname: req.file.originalname
		} : null
	});
	newAddress.save()
		.then(addresses => res.json(addresses))
		.catch(err => res.status(400).json(err));
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//Put route for updating address with new data
app.put('/api/addresses/:id', async (req, res) => {
	try {
		const updatedAddress = await Address.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true }
		);
		res.json(updatedAddress);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

//Delete route for deleting address with specified id
app.delete('/api/addresses/:id', async (req, res) => {
	try {
		await Address.findByIdAndDelete(req.params.id);
		res.json({ message: 'Address deleted' });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});


app.listen(PORT, () => {
	console.log(`Server is started on port ${PORT}`);
});
