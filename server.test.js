const { TestScheduler } = require("jest");
const supertest = require("supertest");
const { app } = require("./server.js");

describe("Test for GET method", () => {
	const expectedBin = {
		id: "50300526-3650-4c88-bccb-b59ee62a6529",
	};
	const expectedErrorWithId = {
		message: "Invalid bin id",
	};
	const expectedErrorWithBin = { message: "Bin not found" };

	it("Should be able to get a bin by id", async () => {
		const response = await supertest(app).get("/b/50300526-3650-4c88-bccb-b59ee62a6529");
		// supertest(app).get("/b:id").expect(200);
		// Is the status code 200
		expect(response.status).toBe(200);
		console.log(response.body);

		// Is the body equal expectedBin
		expect(response.body.id).toEqual(expectedBin.id);
	});
});
