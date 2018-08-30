# SimpleInjection
A very simple dependency injection library in TypeScript leveraging decorators and with support for using from pure Javascript.
Features:
* No external dependencies
* TypeScript decorators
* Instance lifetime: Transient and Container
* Strongly typed factories for specifing additional constructor parameters
* Doesn't require TypeScript metadata information
* Usable from pure Javascript (without decorators)

# Decorator usage
Decorate classes with `@injectable` or `@injectableAs` to specify an interface/symbol the class is provinding
(multiple decorators per class allowed).
You can specify instance lifetime in the decorator.

Decorate constructor parameters with `@inject` and specify class/interface/symbol to inject.
This is a bit of redundancy that can be eliminated using metadata information, but I didn't want to require metadata for now.

    @injectable
    class Test {
        constructor() {}
    }
    
    @injectable
    class TestInject {
        constructor(@inject(Test) private t: Test) {}
    }

# Javascript usage
Register classes with `Container.register` or `Container.registerInterface` to specify an interface/symbol the class is providing.

Specify dependencies as a simple array corresponding to constructor parameters.

    container.register(Test, Lifetime.Transient);
    container.register(TestInject, Lifetime.Transient, [Test]);

# Resolving
Use the `Contrainer.resolve` method to resolve a class/interface/symbol.

    container.resolve(TestInject);

Use the `Container.factory` method to get a factory producing instance of the resolved class.
This can be made strongly typed using an interface extending `IFactory<T>`.

    @injectable
    class ParamTest {
        constructor(@inject(Test) private t: Test, additionalParam: string) {}
    }
    
    interface ParamFactory extends IFactory<ParamTest> {
        create(prefix: string): ParamTest;
    }

    const f = container.factory<ParamFactory>(ParamTest);
    f.create("some additional param");

# Caveats
* If you use decorators or just class/constructor names to register things a simple `toString()` is called instead of trying to just get the classname.
* Typescript doesn't allow to use interface names, so I recommend to declare a simple string value along with the interface with the same name and use this to register interfaces.

# To do
* Proper TS module
* Some name changes and get rid of `DI` namespace
* Validating factory parameter correctness (e.g. number of parameters)
* Metadata support (for validating factory parameters and automatically injecting constructor parameters)
* Waiting for ideas...
