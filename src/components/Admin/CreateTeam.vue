<template>
  <form id="create-team" v-on:submit.prevent="createTeam">
    <h2>Create Team</h2>
    <input required v-model.trim='name' type='text' name='name' autocomplete="name" placeholder="Team Name">
    <input required v-model.trim='lead' type='text' name='lead' placeholder="Team Lead Username">
    <input required v-model.trim='quota' type='text' name='quota' placeholder="Team Quota">
    <button type='submit' value='Create Team'>Create Team</button>
  </form>
</template>

<script>
import axios from "axios";
import { eventBus } from "../../main";

export default {
  name: "CreateTeam",

  props: {
    group: Object,
  },

  data() {
    return {
      name: "",
      lead: "",
      quota: "",
    }
  },

  methods: {
    createTeam: function() {
      const groupID = this.group.groupID;
      const bodyContent = { teamName: this.name, groupID: groupID, quota: this.quota, teamLead: this.lead };
      axios
        .post("/api/teams/", bodyContent)
        .then(() => {
          eventBus.$emit('reload-admin');
          eventBus.$emit('reload-teams');
        })
        .catch(err => {
          eventBus.$emit('new-message', {text: err.response.data, type: 'error'});
          this.resetForm();
        });
    },

    resetForm: function() {
      this.name = "";
      this.lead = "";
      this.quota = "";
    }
  }
}
</script>

<style scoped>
#create-team {
  margin-bottom: 25px;
  margin-top: 10px;
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