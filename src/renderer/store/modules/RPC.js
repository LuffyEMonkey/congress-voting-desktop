import { remoteRPC } from '@/lib/rpc';

const state = {
  frozenAccountOps: [],
};

class Request {
  constructor({ commit, dispatch }) {
    this.commit = commit;
    this.dispatch = dispatch;
  }

  request(instance) {
    this.instance = instance;
    return this;
  }

  get() {
    this.dispatch('requestStart');
    return this.instance
      .catch(res => this.dispatch('requestError', res.response))
      .finally(() => this.dispatch('requestEnd'));
  }
}

function intercept(opts) {
  return new Request(opts);
}

const actions = {
  sendTx({ commit, dispatch }, tx) {
    return intercept({ commit, dispatch })
      .request(remoteRPC.sendTx(tx))
      .get();
  },

  loadFrozenAccounts({ commit }, address) {
    return remoteRPC.getFrozenAccounts(address)
      .then(res => res._embedded.records) // eslint-disable-line no-underscore-dangle,
      .then(ops => commit('UPDATE_FROZEN_ACCOUNT_OPS', { address, ops }));
  },

  updateAllBalance({ commit, dispatch }, addresses) {
    const requests = [];
    for (let i = 0; i < addresses.length; i += 1) {
      const address = addresses[i];
      const req = remoteRPC.getAccount(address)
        .then((data) => {
          if (data && data.balance) {
            commit('UPDATE_BALANCE', {
              address,
              balance: data.balance,
            });
          } else {
            commit('UPDATE_BALANCE', {
              address,
              balance: '0',
            });
          }
        });
      requests.push(req);
    }

    return intercept({ commit, dispatch }).request(Promise.all(requests)).get();
  },
};

const mutations = {
  UPDATE_FROZEN_ACCOUNT_OPS(state, { ops }) {
    state.frozenAccountOps = ops;
  },
};

const getters = {
  account: () => address => remoteRPC.getAccount(address),

  getProposals: () => () => remoteRPC.getProposals(),
};

export default {
  state,
  actions,
  mutations,
  getters,
};