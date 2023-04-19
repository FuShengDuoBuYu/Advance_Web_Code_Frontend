describe('1st tests', () => {
    it('true is true', () => expect(true).toBe(true));
    const addSum = (a: number, b: number) => a + b;
    it('1 + 2 = 3', () => expect(addSum(1, 2)).toBe(3));
});