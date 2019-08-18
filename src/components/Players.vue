<template>
  <b-container :fluid="modifying" class="mt-5">
    <b-row>
      <b-col md="2">
        <h4 v-on:click="reset" id="reset-search-button" class="d-inline">Pelaajat</h4>
      </b-col>
      <b-col v-if="isLogged" md="2">
        <b-form-checkbox v-model="modifying" name="check-button" switch>
          Muokkaus tila
        </b-form-checkbox>
      </b-col>
      <b-col :md="isLogged ? '8' : '10'">
        <b-row>
          <b-col>
            <label for="search-for-player">Hae</label>
            <b-form-input list="input-list" id="search-for-player" v-model.lazy="search" placeholder="Pelaaja/Race/Class/Spec/Profession"></b-form-input>
            <b-form-datalist id="input-list" :options="options"></b-form-datalist>
          </b-col>
          <b-col>
            <label for="players-per-page">Pelaajaa per sivu</label>
            <b-form-select id="players-per-page" v-model="perPage" :options="perPageOptions"/>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
    <hr/>
    <b-alert v-if="error" show variant="warning">
      {{ error }}
    </b-alert>
    <b-table :items="filteredPlayers" :busy="loading" :fields="fields" striped id="players-table" :per-page="perPage" :current-page="currentPage">
      <div slot="table-busy" class="text-center text-primary my-2">
        <b-spinner class="align-middle"></b-spinner>
        <strong class="ml-2">Loading...</strong>
      </div>

      <template slot="[name]" slot-scope="player" v-if="modifying">
        <b-form-input type="text" placeholder="Pelaajan nimi" v-model="player.item.name"></b-form-input>
      </template>

      <template slot="[dkp]" slot-scope="player" v-if="modifying">
        <b-form-input type="number" placeholder="DKP" v-model="player.item.dkp"></b-form-input>
      </template>

      <template slot="[race]" slot-scope="player">
        <b-form-select v-model="player.item.race" :options="races" v-if="modifying"></b-form-select>
        <div v-if="!modifying"><b-img :src="getRaceIcon(player.item.race)"/> {{ player.item.race }}</div>
      </template>

      <template slot="[class]" slot-scope="player">
        <b-form-select v-model="player.item.class" :options="classes" v-if="modifying"></b-form-select>
        <div v-if="!modifying"><b-img :src="getClassIcon(player.item.class)"/> {{ player.item.class }}</div>
      </template>

      <template slot="[spec]" slot-scope="player" v-if="modifying">
        <b-form-input type="text" placeholder="Spec" v-model="player.item.spec"></b-form-input>
      </template>

      <template slot="[prof1]" slot-scope="player">
        <b-form-select v-model="player.item.prof1" :options="professions" v-if="modifying"></b-form-select>
        <div v-if="!modifying"><b-img :src="getProfessionIcon(player.item.prof1)"/> {{ player.item.prof1 }}</div>
      </template>

      <template slot="[prof2]" slot-scope="player">
        <b-form-select v-model="player.item.prof2" :options="professions" v-if="modifying"></b-form-select>
        <div v-if="!modifying"><b-img :src="getProfessionIcon(player.item.prof2)"/> {{ player.item.prof2 }}</div>
      </template>

      <template slot="[actions]" slot-scope="player" v-if="modifying">
        <b-input-group>
          <b-form-input type="text" placeholder="Syy" v-model="player.item.reason"></b-form-input>
          <b-input-group-append>
            <b-button variant="info" v-on:click="update(player.item)">Tallenna muutokset</b-button>
          </b-input-group-append>
        </b-input-group>
      </template>
    </b-table>

    <b-pagination v-model="currentPage" :total-rows="rows" :per-page="perPage" aria-controls="players-table" class="d-flex justify-content-center align-items-center"></b-pagination>

    <b-input-group class="w-25" v-if="isLogged">
      <b-form-input type="text" placeholder="Nimi" v-model="newUser"></b-form-input>
      <b-input-group-append>
        <b-button variant="success" v-on:click="addPlayer">Lisää</b-button>
      </b-input-group-append>
    </b-input-group>
  </b-container>
</template>

<style>
.table-light {
  background-color: #c52d00;
  color: #FFF;
}
#reset-search-button {
  cursor: pointer;
}
</style>

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
        spec: {
          label: 'Spec',
          sortable: true
        },
        prof1: {
          label: 'Profession 1',
          sortable: true
        },
        prof2: {
          label: 'Profession 2',
          sortable: true
        },
        dkp: {
          label: 'DKP',
          variant: 'light',
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
      classes: ['N/A', 'Druid', 'Hunter', 'Mage', 'Priest', 'Rogue', 'Shaman', 'Warlock', 'Warrior'],
      professions: ['N/A', 'Blacksmithing', 'Engineering', 'Herbalism', 'Mining', 'Leatherworking', 'Tailoring', 'Enchanting', 'Alchemy', 'Skinning'],
      modifying: false,
      perPage: 10,
      currentPage: 1,
      perPageOptions: [10,20,30,40,50,60,70,80,90,100]
    }
  },
  sockets: {
    newPlayer(player) {
      this.players.push(player);
      this.playersCopy.push(JSON.parse(JSON.stringify(player)));
      this.options.push(player.name);
    },
    updatePlayer(player) {
      let p = this.players.find(p => p._id === player._id);
      Object.keys(player).forEach(key => {
        p[key] = player[key];
      });
      this.$root.$emit('bv::refresh::table', 'players-table');
    }
  },
  watch: {
    modifying(newVal) {
      if (!newVal) {
        delete this.fields.actions;
        this.$root.$emit('bv::refresh::table', 'players-table');
      }
      else {
        this.fields.actions = { label: 'Actions', sortable: false };
        this.$root.$emit('bv::refresh::table', 'players-table');
      }
    }
  },
  created() {
    this.loading = true;
    this.$http.get(`${process.env.VUE_APP_API_ENDPOINT}/api/v1/players`).then(res => {
      this.players = res.data.data;
      this.playersCopy = JSON.parse(JSON.stringify(res.data.data));
      this.options = res.data.data.map(player => player.name);
      this.options.push(...this.races);
      this.options.push(...this.classes);
      this.options.push(...this.professions);
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
        if (copyPlayer.race !== player.race) content.push(`> ${copyPlayer.race} -> **${player.race}**`);
        if (copyPlayer.class !== player.class) content.push(`> ${copyPlayer.class} -> **${player.class}**`);
        if (copyPlayer.spec !== player.spec) content.push(`> ${copyPlayer.spec} -> **${player.spec}**`);
        if (copyPlayer.prof1 !== player.prof1) content.push(`> ${copyPlayer.prof1} -> **${player.prof1}**`);
        if (copyPlayer.prof2 !== player.prof2) content.push(`> ${copyPlayer.prof2} -> **${player.prof2}**`);
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
    },

    getProfessionIcon(val) {
      if (this.professions.includes(val) && val !== 'N/A') return require(`../assets/profession_${val.toLowerCase()}.png`);
      else return require('../assets/na.png');
    },

    reset() {
      this.search = '';
    }
  },
  computed: {
    filteredPlayers() {
      return this.players.filter(player => {
        return player.name && player.name.toLowerCase().includes(this.search.toLowerCase()) ||
               player.race && player.race.toLowerCase().includes(this.search.toLowerCase()) ||
               player.class && player.class.toLowerCase().includes(this.search.toLowerCase()) ||
               player.prof1 && player.prof1.toLowerCase().includes(this.search.toLowerCase()) ||
               player.prof2 && player.prof2.toLowerCase().includes(this.search.toLowerCase()) ||
               player.spec && player.spec.toLowerCase().includes(this.search.toLowerCase());
      });
    },
    isLogged() {
      if (localStorage.token) return true;
      else return false;
    },
    rows() {
      return this.filteredPlayers.length;
    }
  }
}
</script>