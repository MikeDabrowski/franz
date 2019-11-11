import { action, computed, observable } from 'mobx';
import CachedRequest from './lib/CachedRequest';
import Request from './lib/Request';

import Store from './lib/Store';

export default class PaymentStore extends Store {
  @observable plansRequest = new CachedRequest(this.api.payment, 'plans');

  @observable createHostedPageRequest = new Request(this.api.payment, 'getHostedPage');

  constructor(...args) {
    super(...args);

    this.actions.payment.createHostedPage.listen(this._createHostedPage.bind(this));
  }

  @computed get plan() {
    if (this.plansRequest.isError) {
      return {};
    }
    return this.plansRequest.execute().result || {};
  }

  @action _createHostedPage({ planId }) {
    return this.createHostedPageRequest.execute(planId);
  }

  @action _createDashboardUrl() {
    return this.createDashboardUrlRequest.execute();
  }
}
