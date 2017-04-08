/// <reference path="injection.decorators.ts" />

namespace DecoratorTest {
    interface ITest {
        test: string;
    }
    var ITest = "ITest";

    @DI.injectable()
    class Test implements ITest {
        public test: string;

        constructor() {
            this.test = "OK";
        }
    }

    @DI.injectable
    class Test2 implements ITest {
        public test: string;

        constructor() {
            this.test = "OK";
        }
    }

    class TestInject implements ITest {
        public test: string;

        constructor(private t: Test) {
            this.test = "Still " + this.t.test;
        }
    }

    describe("Decorated container", () => {
        it("should register decorated transient classes", () => {
            const c = DI.decoratorContainer();
            expect(c.isRegistered(Test)).toBeTruthy();
        });

        it("should register decorated transient classes without decorator factory", () => {
            const c = DI.decoratorContainer();
            expect(c.isRegistered(Test2)).toBeTruthy();
        });

        it("should not register not decorated classes", () => {
            const c = DI.decoratorContainer();
            expect(c.isRegistered(TestInject)).toBeFalsy();
        });
    });
}