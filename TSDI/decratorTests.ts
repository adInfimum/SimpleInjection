/// <reference path="injection.decorators.ts" />

namespace DecoratorTest {
    interface ITest {
        test: string;
    }
    var ITest = "ITest";
    var ITest2 = "ITest2";


    @DI.injectable()
    class Test implements ITest {
        public test: string;

        constructor() {
            this.test = "OK";
        }
    }

    @DI.injectable
    @DI.injectableAs(ITest)
    class Test2 implements ITest {
        public test: string;

        constructor() {
            this.test = "OK2";
        }
    }

    class TestNotRegistered {
    }

    @DI.injectable
    class TestInject implements ITest {
        public test: string;

        constructor(@DI.inject(Test) private t: Test) {
            this.test = "Still " + this.t.test;
        }
    }

    @DI.injectable
    @DI.injectableAs(ITest2)
    class TestInject2 implements ITest {
        public test: string;

        constructor(@DI.inject(ITest) private t: ITest) {
            this.test = "Still2 " + this.t.test;
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
            expect(c.isRegistered(TestNotRegistered)).toBeFalsy();
        });

        it("should be able to resolve class dependencies", () => {
            const c = DI.decoratorContainer();
            const t = c.resolve(TestInject);
            expect(t.test).toBe("Still OK");
        });

        it("should be able to resolve class interface dependencies", () => {
            const c = DI.decoratorContainer();
            const t = c.resolve(TestInject2);
            expect(t.test).toBe("Still2 OK2");
        });

        it("should be able to resolve interface dependencies", () => {
            const c = DI.decoratorContainer();
            const t = c.resolve<ITest>(ITest2);
            expect(t.test).toBe("Still2 OK2");
        });
    });
}
