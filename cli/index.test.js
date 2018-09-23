const expect = require("chai").expect;
const app = require("./index");

describe("Invest-Report App", function() {
    it("report1 should display two sales reps", function() {
        expect(app.report1().length).to.equal(2);
    });
});
