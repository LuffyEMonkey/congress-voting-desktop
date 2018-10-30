<template>
  <div>
    <v-card>
      <v-container fluid grid-list-lg>
        <v-layout row wrap>
          <v-tabs>
            <v-tab>{{$t('frozen-account-list')}}</v-tab>
          </v-tabs>
          <v-card-actions>
            <v-btn @click="openPassphraseDialog()">{{$t('freeze')}}</v-btn>
            <v-btn>{{$t('unfreeze')}}</v-btn>
          </v-card-actions>
          <v-card-text>
            <freeze-account-list-item :item="item" v-for="item in frozenAccounts"/>
          </v-card-text>
        </v-layout>
      </v-container>
    </v-card>
    <passphrase-dialog ref="passphraseDialog" :callback="freeze" showUnit="true"/>
  </div>
</template>

<script>
  import PassphraseDialog from './PassphraseDialog';
  import FreezeAccountListItem from './FreezeAccountListItem';

  export default {
    name: 'wallet-freeze-section',
    props: ['address'],
    components: {
      PassphraseDialog,
      FreezeAccountListItem,
    },
    data() {
      return {
      };
    },
    methods: {
      freeze({ amount, passphrase }) {
        return this.$store.dispatch('freeze', { address: this.address, amount, passphrase })
          .then(() => this.loadOps());
      },
      unfreeze() {
      },
      loadOps() {
        return this.$store.dispatch('loadFrozenAccounts', this.address);
      },
      openPassphraseDialog() {
        this.$refs.passphraseDialog.open();
      },
      tick() {
        this.loadOps();
      },
    },
    created() {
      this.$root.$on('tick', this.tick);
      this.$store.dispatch('clearFrozenAccounts');
      this.loadOps();
    },
    destroyed() {
      this.$root.$off('tick', this.tick);
    },
    computed: {
      frozenAccounts() {
        return this.$store.state.RPC.frozenAccountOps;
      },
    },
  };
</script>