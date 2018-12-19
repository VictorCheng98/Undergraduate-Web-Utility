<template>
  <div class="new-group">
    <form id="join-group" v-on:submit.prevent="joinGroup">
      <h2>Join a new student group</h2>
      <input required v-model.trim='joinName' type='text' name='name' autocomplete="name" placeholder="Group Name">
      <button type='submit' value='Create Group'>Join Group</button>
    </form>

    <form id="create-group" v-on:submit.prevent="createGroup">
      <h2>Create a new student group</h2>
      <input required v-model.trim='createName' type='text' name='name' autocomplete="name" placeholder="Group Name">
      <button type='submit' value='Create Group'>Create Group</button>
    </form>
  </div>
</template>

<script>
import axios from "axios";
import { eventBus } from "../../main";

export default {
  name: "NewGroup",

  data() {
    return {
      joinName: "",
      createName: "",
    }
  },
  methods: {
    joinGroup: function() {
      const bodyContent = { name: this.joinName };
      eventBus.$emit('view-teams-page');
      axios
        .post("/api/users/currentuser/groups", bodyContent)
        .then(() => {
          eventBus.$emit('new-message', {text: 'Group joined successfully.', type: 'success'});
          eventBus.$emit('view-teams-page');
        })
        .catch(err => {
          eventBus.$emit('new-message', {text: err.response.data, type: 'error'});
          this.resetForm();
        });
    },
    createGroup: function() {
      const bodyContent = { name: this.createName };
      eventBus.$emit('view-teams-page');
      axios
        .post("/api/groups/", bodyContent)
        .then(() => {
          eventBus.$emit('new-message', {text: 'Group created succesfully.', type: 'success'});
          eventBus.$emit('view-teams-page');
          eventBus.$emit('reload-teams');
        })
        .catch(err => {
          eventBus.$emit('new-message', {text: err.response.data, type: 'error'});
          this.resetForm();
        });
 
      // axios
      //   .post("/api/teams/", bodyContent)
      //   .then(() => {
      //     eventBus.$emit('view-teams-page');
      //   })
      //   .catch(err => {
      //     eventBus.$emit('new-message', {text: err.response.data, type: 'error'});
      //     this.resetForm();
      //   });
    },
    resetForm: function() {
      this.joinName = ''
      this.createName = ''
    }
  }
}
</script>

<style scoped>
#new-group {
  margin-bottom: 25px;
  margin-top: 10px;
}
form {
  margin-bottom: 30px;
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
  background-color: var(--success);
  width: 250px;
  color: white;
  margin: 0;
}
</style>