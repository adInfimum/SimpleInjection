module DI {
    export interface IConstructor<T> {
        new(...deps: any[]): T;
    }
    export interface IFactory<T> {
        create(...additionalParameters: any[]): T;
    }


    export type DepSpec<T> = IConstructor<T> | string;

    export enum Lifetime { Transient = 1, Container }

    export class Container {
        private registered: RegisteredType[] = [];

        public register<T>(depType: T, lifetime: Lifetime, dependencies?: DepSpec<any>[]) {
            this.notRegistered(depType.toString());
            this.registered.push(new RegisteredType(depType.toString(), depType, lifetime, dependencies || []));
        }

        public registerInterface<T, IT>(interfaceType: DepSpec<IT>, depType: T, lifetime: Lifetime, dependencies?: DepSpec<any>[]) {
            this.notRegistered(interfaceType.toString());
            this.registered.push(new RegisteredType(interfaceType.toString(), depType, lifetime, dependencies || []));
        }

        public isRegistered(depType: DepSpec<any>) {
            return !!this.findRegistration(depType.toString());
        }

        private notRegistered(token: string) {
            if (this.isRegistered(token)) {
                throw Error(`Type for ${token} was already registered with
                    ${this.findRegistration(token.toString())!.depType.toString()}`);
            }
        }

        public resolve<T>(depToken: DepSpec<T>, ...additionalParameters: any[]): T {
            depToken = depToken.toString();
            const registeredType = this.findRegistration(depToken);
            if (!registeredType) {
                throw new Error("Nothing registered satisfying " + depToken);                
            }
            return registeredType.create<T>(this.resolveDependencies(registeredType).concat(additionalParameters));
        }
        
        public factory<FT extends IFactory<any>>(depToken: DepSpec<any>): FT;
        public factory<T>(depToken: DepSpec<T>): IFactory<T>;

        public factory<FT extends IFactory<any>>(depToken: DepSpec<any>): FT {
            return <FT>{
                create: (...additionalParameters: any[]) => {
                    return this.resolve(depToken, additionalParameters);
                }
            };
        }

        public child() {
            const c = new Container();
            this.registered.forEach(r => c.registered.push(r.clone()));
            return c;
        }

        private resolveDependencies(registeredType: RegisteredType) {
            let deps: any[] = [];
            for (const dep of registeredType.dependencies) {
                deps.push(this.resolve(dep));
            }
            return deps;
        }

        private findRegistration(depToken: string) {
            return this.registered.filter(d => d.token === depToken).shift();
        }
    }

    class RegisteredType {
        private instance: any;

        constructor(public token: string,
            public depType: any,
            public lifetime: Lifetime,
            public dependencies: any[]) {
        }

        create<T>(deps: any[]): T {
            if (this.lifetime === Lifetime.Transient) return RegisteredType.construct(this.depType, deps);
            return this.createInstance<T>(deps);
        }

        private createInstance<T>(deps: any[]): T {
            if (!this.instance) {
                this.instance = RegisteredType.construct(this.depType, deps);
            }
            return this.instance;
        }

        private static construct(depType: any, deps: any[]) {
            function f(deps: any[]): void {
                return depType.apply(this, deps);
            }
            f.prototype = depType.prototype;
            return new (f as any)(deps);
        }

        public clone() {
            return new RegisteredType(this.token, this.depType, this.lifetime, this.dependencies);
        }
    }
}
