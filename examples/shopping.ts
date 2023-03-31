interface ShoppingCart {
    addItem(item: string): void;
    listItems(): string[];
}

interface PaymentProcessor {
    process(amount: number): void;
}

// implements
class BasicShoppingCart implements ShoppingCart {
    private items: string[] = [];

    addItem(item: string): void {
        this.items.push(item);
    }

    listItems(): string[] {
        return this.items;
    }
}

class CreditCardPaymentProcessor implements PaymentProcessor {
    process(amount: number): void {
        console.log(`Processing credit card payment for amount: ${amount}`);
    }
}


import { Token } from "../src/interfaces/token.ts"

const ShoppingCartToken = Symbol("ShoppingCart") as Token<ShoppingCart>;
const PaymentProcessorToken = Symbol("PaymentProcessor") as Token<PaymentProcessor>;

import { createContainer } from "../src/container.ts"

const container = createContainer();

container.register<ShoppingCart>(ShoppingCartToken, { useClass: BasicShoppingCart })
container.register<PaymentProcessor>(PaymentProcessorToken, { useClass: CreditCardPaymentProcessor })

import { Inject, Injectable } from "../src/decorator.ts"

@Injectable()
class Store {
    constructor(
        @Inject(ShoppingCartToken) private shoppingCart: ShoppingCart,
        @Inject(PaymentProcessorToken) private paymentProcessor: PaymentProcessor,
    ) { }

    purchase(items: string[]): void {
        items.forEach((item) => {
            this.shoppingCart.addItem(item);
        })

        const total = items.length * 10;
        this.paymentProcessor.process(total);

        console.log(`Purchased items: ${this.shoppingCart.listItems()}`);
    }

}


const store = container.resolve(Store);
store.purchase(["apple", "orange", "banana"]);

// Output:
// Processing credit card payment for amount: 30
// Purchased items: apple,orange,banana
