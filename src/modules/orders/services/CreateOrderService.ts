import { inject, injectable } from "tsyringe";

import AppError from "@shared/errors/AppError";

import IProductsRepository from "@modules/products/repositories/IProductsRepository";
import ICustomersRepository from "@modules/customers/repositories/ICustomersRepository";
import Product from "@modules/products/infra/typeorm/entities/Product";
import Order from "../infra/typeorm/entities/Order";
import IOrdersRepository from "../repositories/IOrdersRepository";

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject("OrdersRepository")
    private ordersRepository: IOrdersRepository,
    @inject("ProductsRepository")
    private productsRepository: IProductsRepository,
    @inject("CustomersRepository")
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    // Garantindo que exista o customer
    if (!customer) {
      throw new AppError("Don't create a order to unexists customer.");
    }

    const productsFinded = await this.productsRepository.findAllById(
      products.map(o => ({ id: o.id })),
    );

    // Garantindo que os produtos existem
    if (productsFinded.length !== products.length) {
      throw new AppError("Don't create a order with invalid products.");
    }

    // Garantindo que exista produto em estoque
    productsFinded.forEach(product => {
      const findProduct = products.find(
        prod => prod.id === product.id,
      ) as IProduct;

      if (product.quantity < findProduct.quantity) {
        throw new AppError("Don't create a order with a product without sock");
      }
    });

    // Criando array de produtos e preco
    const productsWithPrice = products.map(product => {
      const productDB = productsFinded.find(
        prodDB => prodDB.id === product.id,
      ) as Product;
      const { id: product_id, quantity } = product;
      const { price } = productDB;

      return { product_id, quantity, price };
    });

    // Criando o pedido
    const order = await this.ordersRepository.create({
      customer,
      products: productsWithPrice,
    });

    // Atualizando o estoque
    const prodNewQuantity = products.map(product => {
      const { quantity } = productsFinded.find(
        prod => prod.id === product.id,
      ) as Product;
      const newQuantity = quantity - product.quantity;
      return { id: product.id, quantity: newQuantity };
    });
    await this.productsRepository.updateQuantity(prodNewQuantity);

    return order;
  }
}

export default CreateOrderService;
