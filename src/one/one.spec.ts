import { one } from './one';

describe("one", () => {
    it("passes", (done) => {
        expect(one).toBe(1);
        done();
    });
});

