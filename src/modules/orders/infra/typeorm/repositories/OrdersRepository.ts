import { getRepository, Repository } from "typeorm";

import IOrdersRepository from "@modules/orders/repositories/IOrdersRepository";
import ICreateOrderDTO from "@modules/orders/dtos/ICreateOrderDTO";
import Order from "../entities/Order";
import OrderProducts from "../entities/OrdersProducts";

class OrdersRepository implements IOrdersRepository {
  private ormRepository: Repository<Order>;

  constructor() {
    this.ormRepository = getRepository(Order);
  }

  public async create({ customer, products }: ICreateOrderDTO): Promise<Order> {
    const orderProducts = products.map(product => {
      const orderProduct = new OrderProducts();
      Object.assign(orderProduct, product);
      return orderProduct;
    });

    const order = this.ormRepository.create({
      customer,
      order_products: orderProducts,
    });

    await this.ormRepository.save(order);

    return order;
  }

  public async findById(id: string): Promise<Order | undefined> {
    const order = await this.ormRepository.findOne(id);
    return order;
  }
}

export default OrdersRepository;
