// This file contains the main entry point for the Motoko application.
// It includes the primary logic for the nimbus.ai project in Motoko.

actor Main {
    public query func greet(name: Text) : async Text {
        return "Hello, " # name # "! Welcome to nimbus.ai!";
    };

    public func run() : async Text {
        let greeting = await greet("User");
        return greeting;
    };
};