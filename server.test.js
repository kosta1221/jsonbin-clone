const { TestScheduler } = require("jest");
const supertest = require("supertest");
const { app } = require("./server.js");

describe("Test for GET method", () => {
	const expectedBin = {
		id: "50300526-3650-4c88-bccb-b59ee62a6529",
	};
	const expectedErrorWithId = {
		message: "Invalid bin id format!",
	};
	const expectedErrorWithBin = { message: "Bin not found!" };

	it("Should be able to get a bin by id", async () => {
		const response = await supertest(app).get("/b/50300526-3650-4c88-bccb-b59ee62a6529");
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
