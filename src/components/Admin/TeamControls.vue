<template>
  <div class="team">
    <div class="team-content" v-if="!showEdit">
      <p class="team-name">Team Name: {{ team.teamName }}</p>
      <p class="team-name">Team Lead: {{ team.teamLeadUsername }}</p>
      <p class="team-name">Team Quota: {{ team.quota }}</p>
    </div>
    <div class="team-content" v-if="showEdit">
      <p>Team Name: <input v-model.trim='name' type='text' name='name'></p>
      <p>Team Lead: <input v-model.trim='lead' type='text' name='lead'></p>
      <p>Team Quota: <input v-model.trim='quota' type='text' name='quota'></p>
      <button name='cancel' v-on:click="setShowEdit(false)">Cancel</button>
      <button name='edit' v-on:click="editTeam">Edit Team</button>
    </div>
    <div class="actions" v-if="!this.showEdit">
      <i class="fas fa-pen" v-on:click="setShowEdit(true)"></i>
      <i class="fas fa-trash" v-on:click="deleteTeam"></i>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { eventBus } from "../../main";

export default {
  name: "TeamControls",

  props: {
    team: Object
  },

  data() {
    return {
      showEdit: false,
      name: this.team.teamName,
      lead: this.team.teamLeadUsername,
      quota: this.team.quota
    }
  },

  methods: {
    setShowEdit(value) {
      this.showEdit = value;
    },
    editTeam: function() {
      const teamID = this.team.teamID;
      const bodyContent = {name: this.name, lead: this.lead, quota: this.quota};
      axios
        .put('/api/teams/' + teamID, bodyContent)
        .then(() => {
            eventBus.$emit('reload-admin');
            this.showEdit = false;
        })
    },
    deleteTeam: function() {
      const teamID = this.team.teamID;
      axios
        .delete(`/api/teams/${teamID}`)
        .then(() => {
          eventBus.$emit('reload-admin');
          eventBus.$emit('reload-teams');
          this.showEdit = false;
        })
    },
  }
}
</script>

<style scoped>
.team {
  background-color: white;
  padding: 15px 22px;
  margin: 10px 0;
  border-radius: 5px;
  display: flex;
}
.team-content {
  flex-grow: 1;
}
.actions {
  cursor: hand;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.actions i {
  color: lightgray;
  font-size: 14px;
}
.actions i:hover {
  color: darkgray;
}
.actions i.fa-pen {
  margin-bottom: 5px;
}
input {
  width: 250px;
  font-size: 0.9em;
  padding: 9px 9px;
  border: none;
  border-radius: 3px;
  margin: 5px 0;
  display: inline-block;
  background-color: #EEE;
}
button, button:hover {
  background-color: var(--success);
  width: 250px;
  color: white;
  margin-top: 5px;
}
button[name="cancel"]  {
  background-color: #AAA;
  margin-right: 10px;
}
</style>