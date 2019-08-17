<template>
  <div>
    <b-row>
      <b-col>
        <h4>Pelaajat</h4>
      </b-col>
      <b-col>
        <label for="search-for-player">Hae</label>
        <b-form-input list="input-list" id="search-for-player" v-model.lazy="search" placeholder="Pelaajan nimi"></b-form-input>
        <b-form-datalist id="input-list" :options="options"></b-form-datalist>
      </b-col>
    </b-row>
    <hr/>
    <b-alert v-if="error" show variant="warning">
      {{ error }}
    </b-alert>
    <b-table :items="filteredPlayers" :busy="loading" :fields="fields">
      <div slot="table-busy" class="text-center text-primary my-2">
        <b-spinner class="align-middle"></b-spinner>
        <strong class="ml-2">Loading...</strong>
      </div>
      <template slot="[actions]" slot-scope="player">
        <b-input-group>
          <b-form-input type="number" placeholder="Määrä" v-model="player.item.amount"></b-form-input>
          <b-form-input type="text" placeholder="Syy" v-model="player.item.reason"></b-form-input>
          <b-input-group-append>
            <b-button variant="info" v-on:click="update(player.item)" :disabled="player.item.amount ? false : true">Give/Take</b-button>
          </b-input-group-append>
        </b-input-group>
      </template>
    </b-table>

    <b-input-group class="w-25" v-if="isLogged">
      <b-form-input type="text" placeholder="Nimi" v-model="newUser"></b-form-input>
      <b-input-group-append>
        <b-button variant="success" v-on:click="addPlayer">Lisää</b-button>
      </b-input-group-append>
    </b-input-group>
  </div>
</template>

<script>
export default {
  name: 'players',
  data () {
    return {
      loading: true,
      fields: {
        name: {
          label: 'Nimi',
          sortable: true
        },
        dkp: {
          label: 'DKP',
          sortable: true
        }
      },
      players: [],
      options: [],
      search: '',
      error: null,
      newUser: ''
    }
  },
  sockets: {
    newPlayer(player) {
      this.players.push(player);
    },
    updatePlayer(player) {
      this.players.find(p => p._id === player._id).dkp = player.dkp;
    }
  },
  beforeMount() {
    if (localStorage.token) {
      this.fields.actions = { label: 'Actions', sortable: false }
    }
  },
  created() {
    this.loading = true;
    this.$http.get(`${process.env.VUE_APP_API_ENDPOINT}/api/v1/players`).then(res => {
      this.players = res.data.data;
      this.options = res.data.data.map(player => player.name);
      this.loading = false;
    });
  },
  methods: {
    update(player) {
      if (!player.amount) return this.error = 'DKP arvo ei voi olla tyhjä';

      this.loading = true;
      player.dkp = parseInt(player.dkp);
      player.dkp += parseInt(player.amount);

      const payload = {
        content: `**${player.amount}** DKP pelaajalle **${player.name}** (Nyt: ${player.dkp} DKP). **Syy:** ${player.reason}`
      };

      delete player.amount;
      delete player.reason;

      this.$http.put(`${process.env.VUE_APP_API_ENDPOINT}/api/v1/players/${player._id}?token=${localStorage.token}`, player).then(() => {
        this.$http.post(`${process.env.VUE_APP_WEBHOOK}`, JSON.stringify(payload));
        this.loading = false;
      })
      .catch(error => {
        this.error = error.response.data.message;
      });
    },

    addPlayer() {
      if (this.newUser) {
        this.loading = true;
        this.$http.post(`${process.env.VUE_APP_API_ENDPOINT}/api/v1/players`, { name: this.newUser, dkp: 10, token: localStorage.token }).then(() => {
          this.loading = false;
        })
        .catch(error => {
          this.error = error.response.data.message;
        })
      }
      else {
        this.error = 'Uuden käyttäjän nimi tulee olla vähintään ';
      }
    }
  },
  computed: {
    filteredPlayers() {
      return this.players.filter(player => player.name.toLowerCase().includes(this.search.toLowerCase()));
    },
    isLogged() {
      if (localStorage.token) return true;
      else return false;
    }
  }
}
</script>