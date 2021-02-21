const express = require("express");
const fs = require("fs");
const uuid = require("uuid");
const app = express();
const PORT = process.env.PORT || 3000;

// turning request into JSON
app.use(express.json());

// middleware for waiting 1 second between server requests
app.use(function (req, res, next) {
	console.log("Time:", Date.now());
	console.log("Request Type:", req.method);
	setTimeout(next, 1000);
});

// GET request to /b returns a list of objects
app.get("/b", (req, res) => {
	const files = fs.readdirSync("./todos");
	const todos = [];
	if (files.length === 0) {
		res.send("There are no files.");
	} else {
		try {
			files.forEach((file) => {
				todos.push(JSON.parse(fs.readFileSync(`./todos/${file}`)));
			});
			res.send(todos);
		} catch (err) {
			res.status(500).json({ message: "Internal server error", error: err });
		}
	}
});

// GET request to /b/{id} returns the details of the object
app.get("/b/:id", (req, res) => {
	const { id } = req.params;
	if (!fs.existsSync(`./todos/${id}.json`)) {
		res.status(400).json({ message: "Invalid bin id" });
	} else {
		fs.readFile(`./todos/${id}.json`, (err, data) => {
			if (err) {
				res.status(500).json({ message: "Internal server error", error: err });
			} else res.send(data);
		});
	}
});

// POST request to /b - create new object and return the new object
app.post("/b", (req, res) => {
	const { body } = req;
	const id = uuid.v4();
	if (Object.keys(body).length === 0) {
		body["my-todo"] = [];
		body["completed-todos"] = [];
	}
	body.id = id;
	fs.writeFile(`./todos/${id}.json`, JSON.stringify(body, null, 4), (err) => {
		if (err) {
			res.status(500).json({ message: "Internal server error", error: err });
		} else {
			console.log(`New bin id: ${id}`);
			res.status(201).json(body);
		}
	});
});

// PUT request to /b/{id} get in the body params updated object and return the updated object
app.put("/b/:id", (req, res) => {
	const { id } = req.params;
	const { body } = req;
	if (!fs.existsSync(`./todos/${id}.json`)) {
		res.status(400).json({
			message: "Bin id to update not found",
		});
	} else {
		body.id = id;
		fs.writeFile(`./todos/${id}.json`, JSON.stringify(body, null, 4), (err) => {
			if (err) {
				res.status(500).json({ message: "Internal server error", error: err });
			} else {
				console.log(`Updated bin id: ${id}`);
				res.status(201).json(body);
			}
		});
	}
});

// DELETE request to /b/{id} delete an object
app.delete("/b/:id", (req, res) => {
	const { id } = req.params;
	if (!fs.existsSync(`./todos/${id}.json`)) {
		res.status(400).json({
			message: "Bin id to delete not found",
		});
	} else {
		fs.unlink(`./todos/${id}.json`, (err) => {
			if (err) {
				res.status(500).json({ message: "Internal server error", error: err });
			} else {
				console.log(`Deleted bin id: ${id}`);
				res.status(201).send(`Deleted bin id: ${id}`);
			}
		});
	}
});

app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});
