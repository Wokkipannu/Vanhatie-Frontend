<template>
  <div>
    <b-alert v-if="error" show variant="warning">
      {{ error }}
    </b-alert>
    <b-table :items="users" :fields="fields"></b-table>
  </div>
</template>

<script>
export default {
  name: 'users-table',
  data () {
    return {
      error: null,
      users: [],
      fields: {
        _id: {
          label: 'ID',
          sortable: true
        },
        username: {
          label: 'Käyttäjänimi',
          sortable: true
        }
      }
    }
  },
  created() {
    this.$http.get(`${process.env.VUE_APP_API_ENDPOINT}/api/v1/users?token=${localStorage.token}`).then(res => {
      this.users = res.data.data;
    })
    .catch(error => {
      this.error = error.response.data.message;
    });
  }
}
</script>