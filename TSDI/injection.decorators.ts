/// <reference path="injection.ts" />

module DI {
    var lastTypeProcessed: string = "";
    var currentDependencies: DepSpec<any>[] = [];
    export var decoratorContainer = new Container();

    export function injectable<T>(lifetime?: Lifetime): (type: T) => void;
    export function injectable<T>(type: T): void;

    export function injectable<T>(lifetimeOrType?: Lifetime | T) {
        if (typeof lifetimeOrType === "function") {
            register(lifetimeOrType as T, Lifetime.Transient);
        } else {
            return (constructorFunc: T) => {
                register(constructorFunc, lifetimeOrType as Lifetime);
            }
        }
    }

    export function injectableAs<T, TI>(interfaceType: DepSpec<TI>, lifetime?: Lifetime) {
        return (constructorFunc: T) => {
            registerAs(interfaceType.toString(), constructorFunc, lifetime);
        }
    }

    export function inject<T>(depType: DepSpec<T>) {
        return (typeConstructor: T, paramName: string, paramIndex: number) => {
            if (lastTypeProcessed !== typeConstructor.toString()) {
                lastTypeProcessed = typeConstructor.toString();
                currentDependencies = [];
            }
            if (currentDependencies[paramIndex]) {
                throw Error(`Parameter ${paramIndex} of ${typeConstructor.toString()} was already decorated with @inject`);
            }
            currentDependencies[paramIndex] = depType.toString();
        }
    }

    function register<T>(constructorFunc: T, lifetime: Lifetime) {
        validateDependencies();
        decoratorContainer.register(constructorFunc, lifetime || Lifetime.Transient, currentDependencies);
    }

    function registerAs<T>(token: string, constructorFunc: T, lifetime?: Lifetime) {
        validateDependencies();
        decoratorContainer.registerInterface(token, constructorFunc, lifetime || Lifetime.Transient, currentDependencies);
    }

    function validateDependencies() {
        currentDependencies.forEach((dep, i) => {
            if (typeof dep === "undefined") {
                throw Error(`Parameter ${i} of ${lastTypeProcessed} was not decorated with @inject`);
            }
        });
    }
}
