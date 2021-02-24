const fs = require("fs");
const { TestScheduler } = require("jest");
const supertest = require("supertest");
const { app } = require("./server.js");

const expectedErrorWithId = {
	message: "Invalid bin id format!",
};
const expectedErrorWithBin = { message: "Bin not found!" };
const bodyOfMockBinToCreate = {
	"my-todo": [
		{
			text: "asd",
			priority: "1",
			date: 1613396337714,
		},
		{
			text: "Eat Pizza",
			priority: "2",
			date: 1613396382271,
		},
		{
			text: "asdasd",
			priority: "4",
			date: 1613396744288,
		},
	],
	"completed-todos": [
		{
			text: "asd",
			priority: "1",
			date: 1613333102362,
			dateCompleted: 1613333108824,
		},
		{
			text: "Eat P123145542526",
			priority: "2",
			date: 1613396382271,
			dateCompleted: 1613416672139,
		},
	],
};

describe("Test for GET method", () => {
	it("Should be able to get a bin by id", async () => {
		// const mockBin = createMockBin(bodyOfMockBinToCreate);
		const mockBin = await supertest(app).post("/b").send(bodyOfMockBinToCreate);

		const { id } = mockBin.body;
		const idString = `${id}`;
		console.log(idString);

		const response = await supertest(app).get("/b/" + idString);

		// Is the status code 200
		expect(response.status).toBe(200);
		console.log(response.body);

		// Is the body equal expectedBin
		expect(response.body.id).toEqual(mockBin.body.id);
		console.log(idString);
		await supertest(app).delete("/b/" + idString);
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

		expect(response.status).toBe(201);
		expect(response.body).toEqual(expectedResponse);

		await supertest(app).delete("/b/" + id);
	});

	// it("Should return an error message with status code 400 sending blank bins")
	// I actually want to be able to POST blank bins
});

describe("PUT route", () => {
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
	};

	it("Should update a bin successfully and should not create a new bin while updating", async () => {
		const mockBin = await supertest(app).post("/b").send();

		const { id } = mockBin.body;
		const idStringOfMockbin = `${id}`;

		binToPut.id = idStringOfMockbin;

		const response = await supertest(app)
			.put("/b/" + idStringOfMockbin)
			.send(binToPut);

		const expectedResponse = Object.assign({}, binToPut);

		expect(response.status).toBe(201);
		expect(response.body).toEqual(expectedResponse);

		fs.unlinkSync(`./todos/${idStringOfMockbin}.json`);
		const allBins = fs.readdirSync("./todos");
		expect(allBins.includes(idStringOfMockbin)).toBe(false);
	});

	it("Should return an error message with status code 404 for bin not found", async () => {
		const binIdOf36Chars = "123456789123456789123456789123456789";
		const response = await supertest(app)
			.put("/b/" + binIdOf36Chars)
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
	const binToDelete = {
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

	it("Should delete a bin by a given id", async () => {
		const responsePost = await supertest(app).post("/b").send(binToDelete);
		const { id } = responsePost.body;
		idOfFileToDelete = `${id}`;
		const expectedResponse = `Deleted bin id: ${idOfFileToDelete}`;

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
