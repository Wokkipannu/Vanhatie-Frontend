<template>
  <div id="app">
    <b-navbar type="dark">
      <b-container>
        <b-navbar-nav>
          <router-link to="/" tag="b-nav-item">Pelaajat</router-link>
          <router-link to="/login" tag="b-nav-item" v-if="!isLogged">Kirjaudu sisään</router-link>
          <b-nav-item v-if="isLogged" v-on:click="logout">Kirjaudu ulos</b-nav-item>
        </b-navbar-nav>
      </b-container>
    </b-navbar>

    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'app',
  methods: {
    logout() {
      localStorage.removeItem('token');
      window.location.reload();
    }
  },
  computed: {
    isLogged() {
      if (localStorage.token) return true;
      else return false;
    }
  }
}
</script>