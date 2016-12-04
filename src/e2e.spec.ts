// Imagine this does some e2e tests, like starting a server, making requests
// and then shutting it down. For the purposes of the template, we'll just
// test 2 === 2.

import { two } from './e2e';

describe("e2e", () => {
    it("passes", (done) => {
        expect(two).toBe(2);
        done();
    });
});

