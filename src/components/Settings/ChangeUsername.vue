<template>
  <form id="change-username" v-on:submit.prevent="changeUsername">
    <h2>Change Username</h2>
    <input required v-model.trim='username' type='text' name='username' autocomplete="username" placeholder="New Username">
    <button type='submit' value='Change Username'>Change Username</button>
  </form>
</template>

<script>
import axios from "axios";
import { eventBus } from "../../main";

export default {
  name: "ChangeUsername",

  data() {
    return {
      username: ""
    }
  },

  methods: {
    changeUsername: function() {
        axios
          .put("/api/users/", { username: this.username })
          .then(() => {
            eventBus.$emit('new-message', {text: 'Changed username successfully.', type: 'success'});
            eventBus.$emit('check-login');
          })
          .catch(err => {
            eventBus.$emit('new-message', {text: err.response.data, type: 'error'});
          })
          .then(() => {
            this.resetForm();
          });
    },

    resetForm: function() {
      this.username = ""
    }
  }
}
</script>

<style scoped>
form {
  margin-bottom: 25px;
  margin-top: 15px;
}
input {
  width: 250px;
  font-size: 0.9em;
  padding: 9px 9px;
  border: none;
  border-radius: 3px;
  margin: 10px 0;
  display: block;
}
button, button:hover {
  background-color: var(--primary);
  width: 100%;
  color: white;
  margin-top: 0;
}
</style>