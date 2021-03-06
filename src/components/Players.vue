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

      <template v-slot:cell(name)="player" v-if="modifying">
        <b-form-input type="text" placeholder="Pelaajan nimi" v-model="player.item.name"></b-form-input>
      </template>

      <template v-slot:cell(dkp)="player">
        <b-form-input type="number" placeholder="DKP" v-model="player.item.dkp" v-if="modifying"></b-form-input>
        <div v-if="!modifying">{{ numberWithCommas(player.item.dkp) }}</div>
      </template>

      <template v-slot:cell(race)="player">
        <b-form-select v-model="player.item.race" :options="races" v-if="modifying"></b-form-select>
        <div v-if="!modifying"><b-img :src="getRaceIcon(player.item.race)"/> {{ player.item.race }}</div>
      </template>

      <template v-slot:cell(class)="player">
        <b-form-select v-model="player.item.class" :options="classes" v-if="modifying"></b-form-select>
        <div v-if="!modifying"><b-img :src="getClassIcon(player.item.class)"/> {{ player.item.class }}</div>
      </template>

      <template v-slot:cell(spec)="player" v-if="modifying">
        <b-form-input type="text" placeholder="Spec" v-model="player.item.spec"></b-form-input>
      </template>

      <template v-slot:cell(prof1)="player">
        <b-form-select v-model="player.item.prof1" :options="professions" v-if="modifying"></b-form-select>
        <div v-if="!modifying"><b-img :src="getProfessionIcon(player.item.prof1)"/> {{ player.item.prof1 }}</div>
      </template>

      <template v-slot:cell(prof2)="player">
        <b-form-select v-model="player.item.prof2" :options="professions" v-if="modifying"></b-form-select>
        <div v-if="!modifying"><b-img :src="getProfessionIcon(player.item.prof2)"/> {{ player.item.prof2 }}</div>
      </template>

      <template v-slot:cell(discord)="player" v-if="modifying">
        <b-form-input type="text" placeholder="Discord ID" v-model="player.item.discord"></b-form-input>
      </template>

      <template v-slot:cell(actions)="player" v-if="modifying">
        <b-input-group>
          <b-form-input type="text" placeholder="Syy" v-model="player.item.reason"></b-form-input>
          <b-input-group-append>
            <b-button variant="info" v-on:click="update(player.item)">Tallenna muutokset</b-button>
          </b-input-group-append>
        </b-input-group>
        <b-button variant="danger" v-on:click="remove(player.item)">Poista</b-button>
      </template>
    </b-table>

    <b-pagination v-model="currentPage" :total-rows="rows" :per-page="perPage" aria-controls="players-table" class="d-flex justify-content-center align-items-center"></b-pagination>
    <p class="text-center" v-if="!search">{{ filteredPlayers.length }} hakutulosta</p>
    <p class="text-center" v-if="search">{{ filteredPlayers.length }} hakutulosta hakusanalla {{ search }}</p>

    <b-input-group class="w-25" v-if="isLogged">
      <b-form-input type="text" placeholder="Nimi" v-model="newUser"></b-form-input>
      <b-form-input type="text" placeholder="Discord ID" v-model="newUserDiscordID"></b-form-input>
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
      fields: [
        {
          key: 'name',
          label: 'Nimi',
          sortable: true
        },
        {
          key: 'race',
          label: 'Race',
          sortable: true
        },
        {
          key: 'class',
          label: 'Class',
          sortable: true
        },
        {
          key: 'spec',
          label: 'Spec',
          sortable: true
        },
        {
          key: 'prof1',
          label: 'Profession 1',
          sortable: true
        },
        {
          key: 'prof2',
          label: 'Profession 2',
          sortable: true
        },
        {
          key: 'dkp',
          label: 'DKP',
          variant: 'light',
          sortable: true
        }
      ],
      players: [],
      playersCopy: [],
      options: [],
      search: '',
      error: null,
      newUser: '',
      newUserDiscordID: '',
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
        this.fields = this.fields.filter(field => field.key !== 'discord' && field.key !== 'actions');
        this.$root.$emit('bv::refresh::table', 'players-table');
      }
      else {
        this.fields.push({ key: 'discord', label: 'Discord ID', sortable: false });
        this.fields.push({ key: 'actions', label: 'Actions', sortable: false });
        this.$root.$emit('bv::refresh::table', 'players-table');
      }
    },
    search(newVal) {
      if (history.pushState) {
        let url = `${window.location.protocol}//${window.location.host}${window.location.pathname}?search=${newVal}`;
        window.history.pushState({ path: url }, '', url);
      }
    }
  },
  created() {
    if (this.$route.query.search) this.search = this.$route.query.search;

    this.loading = true;
    this.$http.get(`${process.env.VUE_APP_API_ENDPOINT}/api/v1/players`).then(res => {
      this.players = res.data.data;
      this.playersCopy = JSON.parse(JSON.stringify(res.data.data));
      this.options = res.data.data.map(player => player.name);
      this.options.push(...this.races.slice(1,this.races.length));
      this.options.push(...this.classes.slice(1,this.classes.length));
      this.options.push(...this.professions.slice(1,this.professions.length));
      this.loading = false;
    });
  },
  methods: {
    async refresh() {
      this.loading = true;
      await this.$root.$emit('bv::refresh::table', 'players-table');
      this.loading = false;
    },

    numberWithCommas(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    },
  
    remove(player) {
      if(confirm("Haluatko varmasti poistaa pelaajan?")) {
        this.error = null;
        this.$http.delete(`${process.env.VUE_APP_API_ENDPOINT}/api/v1/players/${player._id}?token=${localStorage.token}`).then(async res => {
          if (res.status === 200) {
            this.players = this.players.filter(player => player._id === player._id);
            this.$root.$emit('bv::refresh::table', 'players-table');
          }
          else {
            this.error = 'Pelaajan poistaminen epäonnistui';
          }
        });
      }
    },

    update(player) {
      this.loading = true;

      this.$http.post(`${process.env.VUE_APP_API_ENDPOINT}/api/v1/users/token`, { token: localStorage.token }).then(res => {
        let copyPlayer = this.playersCopy.find(p => p._id === player._id);

        let content = [];
        content.push(`> **${res.data.data.data.username}** teki muutoksia pelaajaan **${copyPlayer.name}**`);
        if (copyPlayer.name !== player.name) content.push(`> Uusi nimi **${player.name}**`);
        if (copyPlayer.dkp !== player.dkp) content.push(`> DKP muutettiin **${copyPlayer.dkp} ${player.dkp - copyPlayer.dkp > 0 ? '+' : '-'} ${player.dkp - copyPlayer.dkp}** (Nyt ${player.dkp})`);
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
        this.$http.post(`${process.env.VUE_APP_API_ENDPOINT}/api/v1/players`, { name: this.newUser, dkp: 10, discord: this.newUserDiscordID, token: localStorage.token }).then(() => {
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