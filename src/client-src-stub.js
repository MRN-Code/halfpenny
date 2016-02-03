(function() {
    return function getAdder() {
        return function adder(a) {
            return a + a;
        };
    };
})();
