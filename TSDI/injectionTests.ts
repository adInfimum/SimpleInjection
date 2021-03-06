﻿/// <reference path="injection.ts" />
/// <reference path="injection.decorators.ts" />

namespace InjectionTest {
    interface ITest {
        test: string;
    }

    var ITest = "ITest";

    class Test implements ITest {
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

    class ParamTest implements ITest {
        public test: string;

        constructor(private t: Test, valuePrefix: string) {
            this.test = valuePrefix + " is " + this.t.test;
        }
    }

    interface ParamFactory extends DI.IFactory<ParamTest> {
        create(prefix: string): ParamTest;
    }



    describe("Container", () => {
        it("should register custom transient classes", () => {
            const c = new DI.Container();
            c.register(Test, DI.Lifetime.Transient);
            expect(c.isRegistered(Test)).toBeTruthy();
        });

        it("should be able to resolve registered transient class", () => {
            const c = new DI.Container();
            c.register(Test, DI.Lifetime.Transient);
            const t = c.resolve(Test);
            expect(t.test).toBe("OK");
        });

        it("should be able to resolve registered transient class into a different instance every time", () => {
            const c = new DI.Container();
            c.register(Test, DI.Lifetime.Transient);
            const t = c.resolve(Test);
            expect(t.test).toBe("OK");
            const t2 = c.resolve(Test);
            expect(t2.test).toBe("OK");
            expect(t === t2).toBeFalsy();
        });

        it("should be able to resolve class dependencies", () => {
            const c = new DI.Container();
            c.register(Test, DI.Lifetime.Transient);
            c.register(TestInject, DI.Lifetime.Transient, [Test]);
            const t = c.resolve(TestInject);
            expect(t.test).toBe("Still OK");
        });

        it("should be able to resolve registered interfaces", () => {
            const c = new DI.Container();
            c.registerInterface(ITest, Test, DI.Lifetime.Transient);
            const t = c.resolve<ITest>(ITest);
            expect(t.test).toBe("OK");
        });

        it("should be able to resolve class interface dependencies", () => {
            const c = new DI.Container();
            c.registerInterface(ITest, Test, DI.Lifetime.Transient);
            c.register(TestInject, DI.Lifetime.Transient, [ITest]);
            const t = c.resolve(TestInject);
            expect(t.test).toBe("Still OK");
        });

        it("should register custom non-transient classes", () => {
            const c = new DI.Container();
            c.register(Test, DI.Lifetime.Container);
            expect(c.isRegistered(Test)).toBeTruthy();
        });

        it("should be able to resolve registered non-transient class", () => {
            const c = new DI.Container();
            c.register(Test, DI.Lifetime.Container);
            const t = c.resolve(Test);
            expect(t.test).toBe("OK");
        });

        it("should be able to resolve registered non-transient class into the same instance every time", () => {
            const c = new DI.Container();
            c.register(Test, DI.Lifetime.Container);
            const t = c.resolve(Test);
            expect(t.test).toBe("OK");
            const t2 = c.resolve(Test);
            expect(t2.test).toBe("OK");
            expect(t === t2).toBeTruthy();
        });

        it("should be able to create factories with additional parameters for registered classes", () => {
            const c = new DI.Container();
            c.registerInterface(ITest, Test, DI.Lifetime.Transient);
            const f = c.factory<ITest>(ITest);
            const t = f.create("ignore", "additional", "params", "if", "factory", "is", "not", "strongly", "typed");
            expect(t.test).toBe("OK");
        });

        it("should be able to create factories with additional parameters for registered classes", () => {
            const c = new DI.Container();
            c.registerInterface(ITest, Test, DI.Lifetime.Transient);
            c.register(ParamTest, DI.Lifetime.Transient, [ITest]);
            const f = c.factory<ParamFactory>(ParamTest);
            const t = f.create("Everything");
            expect(t.test).toBe("Everything is OK");
        });

    });
}