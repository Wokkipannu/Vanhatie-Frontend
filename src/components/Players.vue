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

      <template slot="[name]" slot-scope="player" v-if="isLogged">
        <b-form-input type="text" placeholder="Pelaajan nimi" v-model="player.item.name"></b-form-input>
      </template>

      <template slot="[dkp]" slot-scope="player" v-if="isLogged">
        <b-form-input type="number" placeholder="DKP" v-model="player.item.dkp"></b-form-input>
      </template>

      <template slot="[race]" slot-scope="player">
        <b-form-select v-model="player.item.race" :options="races" v-if="isLogged"></b-form-select>
        <div v-if="!isLogged"><b-img :src="getRaceIcon(player.item.race)"/> {{ player.item.race }}</div>
      </template>

      <template slot="[class]" slot-scope="player">
        <b-form-select v-model="player.item.class" :options="classes" v-if="isLogged"></b-form-select>
        <div v-if="!isLogged"><b-img :src="getClassIcon(player.item.class)"/> {{ player.item.class }}</div>
      </template>

      <template slot="[actions]" slot-scope="player">
        <b-input-group>
          <b-form-input type="text" placeholder="Syy" v-model="player.item.reason"></b-form-input>
          <b-input-group-append>
            <b-button variant="info" v-on:click="update(player.item)">Tallenna muutokset</b-button>
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
        race: {
          label: 'Race',
          sortable: true
        },
        class: {
          label: 'Class',
          sortable: true
        },
        dkp: {
          label: 'DKP',
          sortable: true
        }
      },
      players: [],
      playersCopy: [],
      options: [],
      search: '',
      error: null,
      newUser: '',
      races: ['N/A', 'Orc', 'Tauren', 'Troll', 'Undead'],
      classes: ['N/A', 'Druid', 'Hunter', 'Mage', 'Priest', 'Rogue', 'Shaman', 'Warlock', 'Warrior']
    }
  },
  sockets: {
    newPlayer(player) {
      this.players.push(player);
      this.playersCopy.push(JSON.parse(JSON.stringify(player)));
    },
    updatePlayer(player) {
      let p = this.players.find(p => p._id === player._id);
      Object.keys(player).forEach(key => {
        p[key] = player[key];
      });
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
      this.playersCopy = JSON.parse(JSON.stringify(res.data.data));
      this.options = res.data.data.map(player => player.name);
      this.loading = false;
    });
  },
  methods: {
    update(player) {
      this.loading = true;

      this.$http.post(`${process.env.VUE_APP_API_ENDPOINT}/api/v1/users/token`, { token: localStorage.token }).then(res => {
        let copyPlayer = this.playersCopy.find(p => p._id === player._id);

        let content = [];
        content.push(`> **${res.data.data.data.username}** teki muutoksia pelaajaan **${copyPlayer.name}**`);
        if (copyPlayer.name !== player.name) content.push(`> Uusi nimi **${player.name}**`);
        if (copyPlayer.dkp !== player.dkp) content.push(`> DKP muutettiin **${player.dkp - copyPlayer.dkp}** (Nyt ${player.dkp})`);
        if (copyPlayer.race !== player.race) content.push(`> Uusi race **${player.race}**`);
        if (copyPlayer.class !== player.class) content.push(`> Uusi class **${player.class}**`);
        if (player.reason) content.push(`> **Syy:** ${player.reason}`);
        
        const payload = {
          content: content.join('\n')
        };

        delete player.reason;

        this.$http.put(`${process.env.VUE_APP_API_ENDPOINT}/api/v1/players/${player._id}?token=${localStorage.token}`, player).then(() => {
          this.$http.post(`${process.env.VUE_APP_WEBHOOK}`, JSON.stringify(payload));
          Object.keys(player).forEach(key => copyPlayer[key] = player[key]);
          this.loading = false;
        })
        .catch(error => {
          this.error = error.response.data.message;
        });
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
    },

    getRaceIcon(val) {
      if (this.races.includes(val) && val !== 'N/A') return require(`../assets/race_${val.toLowerCase()}.jpg`);
      else return require('../assets/na.png');
    },

    getClassIcon(val) {
      if (this.classes.includes(val) && val !== 'N/A') return require(`../assets/class_${val.toLowerCase()}.jpg`);
      else return require('../assets/na.png');
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