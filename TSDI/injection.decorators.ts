/// <reference path="injection.ts" />

module DI {
    var container = new Container();

    export function decoratorContainer() {
        return container.child();
    }

    export function injectable<T>(lifetimeOrType?: Lifetime | T): any {
        if (typeof lifetimeOrType === "function") {
            container.register(lifetimeOrType as T, Lifetime.Transient, []);
        } else {
            return (constructorFunc: T) => {
                container.register(constructorFunc, lifetimeOrType as Lifetime || Lifetime.Transient, []);
            }
        }
    }
}
