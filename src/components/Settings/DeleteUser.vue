<template>
  <div id="delete-user">
    <h2>Delete User</h2>
    <button v-on:click="showConfirm = true">Delete User</button>
    <div v-if="showConfirm" class="confirm">
      <span>Are you sure?</span>
      <span class="yes" v-on:click="deleteUser">yes</span>
      <span class="no" v-on:click="showConfirm = false">no</span>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { eventBus } from "../../main";

export default {
  name: "DeleteUser",

  data() {
    return {
      showConfirm: false
    }
  },
  
  methods: {
    deleteUser: function() {
      axios.delete('api/users/currentuser').then(() => {
        eventBus.$emit('check-login');
      });
    }
  }
}
</script>
<style scoped>
h2 {
  color: var(--error);
}
button, button:hover {
  background-color: var(--error);
  width: 100%;
  color: white;
  margin-top: 0;
}
.confirm {
  font-size: 0.8em;
  text-align: right;
}
.yes, .no {
  margin-left: 5px;
  cursor: hand;
  cursor: pointer;
  font-weight: 700;
}
.yes {
  color: var(--error);
}
</style>
