export class User {
    private id?: number;
    private email: string;
    private name: string;
    private password: string;
    constructor(props: { id?: number; name: string; email: string; password: string }) {
        this.id = props.id ?? undefined;
        this.name = props.name;
        this.email = props.email;
        this.password = props.password;
    }

    public getId(): number | undefined {
        return this.id
    }

    // public setId(id: number): void {
    //     this.id = id
    // }

    // public getName(): string {
    //     return this.name
    // }

    // public getEmail(): string {
    //     return this.email
    // }

    public getPassword(): string {
        return this.password
    }

}
