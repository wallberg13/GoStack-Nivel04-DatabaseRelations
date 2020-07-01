import { getRepository, Repository } from "typeorm";

import IProductsRepository from "@modules/products/repositories/IProductsRepository";
import ICreateProductDTO from "@modules/products/dtos/ICreateProductDTO";
import IUpdateProductsQuantityDTO from "@modules/products/dtos/IUpdateProductsQuantityDTO";
import Product from "../entities/Product";

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({ name, price, quantity });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = await this.ormRepository.findOne({ where: { name } });

    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const productsFinded = await this.ormRepository.findByIds(products);
    return productsFinded;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const productsFinded = await this.ormRepository.findByIds(
      products.map(product => product.id),
    );

    const newProducts = productsFinded.map(product => {
      // Não posso fazer atribuição de objeto do parâmetro, então crio uma variável.
      const newProduct = product;
      const productDTO = products.find(o => o.id === newProduct.id);

      if (productDTO) {
        newProduct.quantity = productDTO.quantity;
      }

      return newProduct;
    });

    await this.ormRepository.save(newProducts);
    return newProducts;
  }
}

export default ProductsRepository;
