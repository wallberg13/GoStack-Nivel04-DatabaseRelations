import { container } from "tsyringe";
import { Request, Response } from "express";

import CreateCustomerService from "@modules/customers/services/CreateCustomerService";

export default class CustomersController {
  public async create(request: Request, response: Response): Promise<Response> {
    try {
      const { name, email } = request.body;

      const createCustomer = container.resolve(CreateCustomerService);

      const customer = await createCustomer.execute({ name, email });

      return response.json(customer);
    } catch (err) {
      return response.status(err.statusCode).json({ error: err.message });
    }
  }
}
