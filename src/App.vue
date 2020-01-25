<template>
  <div id="app">
    <main>
      <b-navbar type="dark">
        <b-container>
          <b-navbar-nav>
            <router-link to="/" tag="b-nav-item">Pelaajat</router-link>
            <router-link to="/login" tag="b-nav-item" v-if="!isLogged">Kirjaudu sisään</router-link>
            <router-link to="/users" tag="b-nav-item" v-if="isLogged">Käyttäjät</router-link>
            <b-nav-item v-if="isLogged" v-on:click="logout">Kirjaudu ulos</b-nav-item>
          </b-navbar-nav>
        </b-container>
      </b-navbar>

      <router-view/>
    </main>

    <Footer />
  </div>
</template>

<script>
import Footer from '@/components/Footer.vue';

export default {
  name: 'app',
  components: {
    Footer
  },
  methods: {
    logout() {
      localStorage.removeItem('token');
      window.location.reload();
    }
  },
  created() {
    if (localStorage.token) {
      this.$http.post(`${process.env.VUE_APP_API_ENDPOINT}/api/v1/users/token`, { token: localStorage.token }).then(res => {
        if (res.data.status !== 'success') {
          localStorage.removeItem('token');
          window.location.reload();
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        window.location.reload();
      });
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