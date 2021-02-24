const fs = require("fs");
const { TestScheduler } = require("jest");
const supertest = require("supertest");
const { app } = require("./server.js");

const expectedErrorWithId = {
	message: "Invalid bin id format!",
};
const expectedErrorWithBin = { message: "Bin not found!" };

let idOfFileToDelete;

describe("Test for GET method", () => {
	const expectedBin = {
		id: "3254bd50-ca62-450d-9f23-b5df1e11e88e",
	};

	it("Should be able to get a bin by id", async () => {
		const response = await supertest(app).get("/b/3254bd50-ca62-450d-9f23-b5df1e11e88e");
		// supertest(app).get("/b:id").expect(200);
		// Is the status code 200
		expect(response.status).toBe(200);
		console.log(response.body);

		// Is the body equal expectedBin
		expect(response.body.id).toEqual(expectedBin.id);
	});

	it("Should return an error message with status code 400 for invalid id", async () => {
		const invalidIdFormat = "50300526-3650-4c88";
		const response = await supertest(app).get("/b/" + invalidIdFormat);

		// Is the status code 400
		expect(response.status).toBe(400);

		// Is the body equal expectedErrorWithId
		expect(response.body).toEqual(expectedErrorWithId);
	});

	it("Should return an error message with status code 404 for bin not found", async () => {
		const noSuchBinCorrectFormatId = "50300526-3650-4c88-bccb-b59ee62a6528";
		const response = await supertest(app).get("/b/" + noSuchBinCorrectFormatId);

		// Is the status code 404
		expect(response.status).toBe(404);

		// Is the body equal expectedErrorWithBin
		expect(response.body).toEqual(expectedErrorWithBin);
	});
});

describe("POST route", () => {
	const binToPost = {
		"my-todo": [
			{
				text: "Get shredded",
				priority: "3",
				date: 1613869413218,
			},
		],
		"completed-todos": [
			{
				text: "Eat Pizza",
				priority: "5",
				date: 1613869400385,
				dateCompleted: 1613869419824,
			},
		],
	};

	it("Should post a new bin successfully", async () => {
		const response = await supertest(app).post("/b").send(binToPost);
		const { id } = response.body;
		idOfFileToDelete = `${id}`;
		console.log(idOfFileToDelete);

		const expectedResponse = {
			"my-todo": [
				{
					text: "Get shredded",
					priority: "3",
					date: 1613869413218,
				},
			],
			"completed-todos": [
				{
					text: "Eat Pizza",
					priority: "5",
					date: 1613869400385,
					dateCompleted: 1613869419824,
				},
			],
		};
		expectedResponse.id = id;
		console.log(expectedResponse);

		expect(response.status).toBe(201);
		expect(response.body).toEqual(expectedResponse);
	});

	// it("Should return an error message with status code 400 sending blank bins")
	// I actually want to be able to POST blank bins
});

describe("PUT route", () => {
	let idOfFileToDelete = "39dfcac2-a743-4c54-8810-01cc9193988f";
	const binToPut = {
		"my-todo": [
			{
				text: "I'm so fucking tired",
				priority: "1",
				date: 1613869419824,
			},
		],
		"completed-todos": [
			{
				text: "Man this sucks",
				priority: "5",
				date: 1613869400385,
				dateCompleted: 1613869401116,
			},
		],
		id: idOfFileToDelete,
	};

	it("Should update a bin successfully", async () => {
		const response = await supertest(app)
			.put("/b/" + idOfFileToDelete)
			.send(binToPut);

		const expectedResponse = Object.assign({}, binToPut);

		expect(response.status).toBe(201);
		expect(response.body).toEqual(expectedResponse);
	});

	it("Should not create a new bin while updating", async () => {
		fs.unlinkSync(`./todos/${idOfFileToDelete}.json`);
		const allBins = fs.readdirSync("./todos");
		expect(allBins.includes(idOfFileToDelete)).toBe(false);
	});

	it("Should return an error message with status code 404 for bin not found", async () => {
		const response = await supertest(app)
			.put("/b/" + idOfFileToDelete)
			.send(binToPut);

		// Is the status code 404
		expect(response.status).toBe(404);

		// Is the body equal expectedBinError
		expect(response.body).toEqual(expectedErrorWithBin);
	});

	it("Should return an error message with status code 400 invalid id format", async () => {
		const response = await supertest(app)
			.put("/b/" + "12ds-3hg2-s1f2-31s5")
			.send(binToPut);

		// Is the status code 400
		expect(response.status).toBe(400);

		// Is the body equal expectedIdError
		expect(response.body).toEqual(expectedErrorWithId);
	});
});

describe("DELETE route", () => {
	const idOfFileToDelete = "98396c07-e194-4a86-b2c8-93bb0f69f4bb";
	const expectedResponse = `Deleted bin id: ${idOfFileToDelete}`;

	it("Should delete a bin by a given id", async () => {
		const response = await supertest(app).delete("/b/" + idOfFileToDelete);

		// Is the status code 201
		expect(response.status).toBe(201);

		// Is the body the same as the expected response
		expect(response.text).toEqual(expectedResponse);
	});

	it("Should return an error message with status code 400 for invalid id", async () => {
		const response = await supertest(app).delete("/b/12ds-3hg2-s1f2-31s5");

		// Is the status code 400
		expect(response.status).toBe(400);

		// Is the body equal expectedIdError
		expect(response.body).toEqual(expectedErrorWithId);
	});

	it("Should return an error message with status code 404 for bin not found", async () => {
		const response = await supertest(app).delete("/b/45e94d13-55c4-470b-b658-8bd01dfd9d24");

		// Is the status code 404
		expect(response.status).toBe(404);

		// Is the body equal expectedBinError
		expect(response.body).toEqual(expectedErrorWithBin);
	});
});
