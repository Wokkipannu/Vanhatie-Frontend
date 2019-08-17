<template>
  <div id="login-form">
    <b-row>
      <b-col md="4" offset-md="4">
        <h4>Kirjaudu</h4>
        <hr/>
        <b-alert v-if="error" show variant="warning">
          {{ error }}
        </b-alert>

        <b-form @submit="login">
          <b-form-group id="username-input" label="Käyttäjänimi" label-for="username">
            <b-form-input id="username" v-model="formData.username" type="text" required placeholder="Käyttäjänimi"></b-form-input>
          </b-form-group>
          
          <b-form-group id="password-input" label="Salasana" label-for="password">
            <b-form-input id="password" v-model="formData.password" type="password" required placeholder="Salasana"></b-form-input>
          </b-form-group>

          <b-button type="submit" variant="primary">Kirjaudu</b-button>
        </b-form>
      </b-col>
    </b-row>
  </div>
</template>

<script>
export default {
  name: 'loginform',
  data() {
    return {
      formData: {},
      formErrors: {},
      error: null
    }
  },
  beforeMount() {
    if (localStorage.token) this.$router.push('/');
  },
  methods: {
    login(evt) {
      evt.preventDefault();
      this.$http.post(`${process.env.VUE_APP_API_ENDPOINT}/api/v1/users/login`, { username: this.formData.username, password: this.formData.password }).then(res => {
        if (res.status === 200) {
          localStorage.token = res.data.data;
          window.location.reload();
        }
        else {
          this.error = res;
        }
      })
      .catch(error => {
        this.error = error.response.data.message;
      });
    }
  }
}
</script>