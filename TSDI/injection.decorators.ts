/// <reference path="injection.ts" />

module DI {
    var lastTypeProcessed: string = "";
    var currentDependencies: DepSpec<any>[] = [];
    var container = new Container();

    export function decoratorContainer() {
        return container.child();
    }

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
                currentDependencies = [];
            }
            currentDependencies.push(depType.toString());
        }
    }

    function register<T>(constructorFunc: T, lifetime: Lifetime) {
        container.register(constructorFunc, lifetime || Lifetime.Transient, currentDependencies);
    }

    function registerAs<T>(token: string, constructorFunc: T, lifetime?: Lifetime) {
        container.registerInterface(token, constructorFunc, lifetime || Lifetime.Transient, currentDependencies);
    }
}
