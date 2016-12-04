import { one } from './one';

describe("one", () => {
    it("passes", (done) => {
        expect(one).toBe(2);
        done();
    });
});

