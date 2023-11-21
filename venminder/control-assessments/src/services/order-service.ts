import { inject } from "aurelia-dependency-injection";
import { ControlAssessmentsEndpoints } from "shared/control-assessment-endpoints";
import type { IApiService } from "shared/interfaces/IApiService";
import { GetJsonRequest } from "shared/models/api-service-model";
import { ApiService } from "shared/services/apiService";
import { OrderItem } from "./models/service-orders/order-item";

export class OrderService {
  constructor(@inject(ApiService) private readonly apiService: IApiService) {}

  public getOrderDetails(orderItemID: string): Promise<OrderItem> {
    return new Promise<OrderItem>((resolve, reject) => {
      this.apiService
        .getJson(
          new GetJsonRequest(
            ControlAssessmentsEndpoints.Api.Orders.GET_ORDER_DETAILS,
            `/${orderItemID}`,
            null,
            true
          )
        )
        .then((u: OrderItem) => {
          resolve(u);
        }, reject);
    });
  }
}
