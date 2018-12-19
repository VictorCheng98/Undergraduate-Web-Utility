<template>
  <div id="teams-page">
    <div class="team-section">
      <h2>Groups You're In</h2>
      <div class="block" v-for="group in groupsIn" v-bind:key="group.groupID" v-on:click="viewGroup(group)">
        {{ formatgroupName(group) }}
      </div>
      <div class="block" v-on:click="showNewGroup()">
        <i class="fas fa-plus"></i>
      </div>
    </div>
    <div class="team-section" v-if="!noTeamsOwn">
      <h2>Teams You Manage</h2>
      <div class="block" v-for="team in teamsOwn" v-bind:key="team.teamID" v-on:click="viewTeam(team)">
        {{ formatTeamName(team) }}
      </div>
    </div>
    <div class="team-section" v-if="!noTeamsIn">
      <h2>Teams You're In</h2>
      <div class="block" v-for="team in teamsIn" v-bind:key="team.teamID" v-on:click="viewTeam(team)">
        {{ formatTeamName(team) }}
      </div>
    </div>
    <div class="team-section" v-for="group in groupsIn" v-bind:key="group.groupID" v-if="showPreferences(group)">
      <h2>Submit Team Preferences for {{ group.groupName }}</h2>
      <Preferences v-bind:user="user" v-bind:group="group" />
    </div>
    <div class="team-section" v-for="team in teamsOwn" v-bind:key="team.teamID" v-if="true">
      <h2>Submit Member Preferences for {{ formatTeamName(team) }}</h2>
      <Preferences v-bind:user="user" v-bind:team="team" />
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { eventBus } from "../../main";

import Preferences from "./Preferences.vue";

export default {
  name: "TeamsPage",

  props: {
    user: Object,
  },

  components: {
    Preferences
  },

  data() {
    return {
      groupsIn: null,
      teamsOwn: null,
      teamsIn: null,
    };
  },

  computed: {
    inMultipleGroups: function() {
      return this.groupsIn != null && this.groupsIn.length > 1;
    },
    noTeamsOwn: function () {
      return this.teamsOwn == null || this.teamsOwn.length == 0;
    },
    noTeamsIn: function () {
      return this.teamsIn == null || this.teamsIn.length == 0;
    },
  },

  created: function() {
    this.getAllData();
    eventBus.$on("reload-teams", () => {
      this.getAllData();
    });
  },

  methods: {
    getAllData: function() {
      axios
        .get('/api/users/currentuser/groups')
        .then((groups) => {
          this.groupsIn = groups.data;
        })
      axios
        .get('/api/users/currentuser/teams')
        .then((teams) => {
          this.teamsIn = teams.data;
        })
      
      axios
        .get('/api/teams/teamsOwned')
        .then((teamsOwned) => {
          this.teamsOwn = teamsOwned.data;
        })
    },
    formatgroupName: function(group) {
      if (group.groupShort == null) {
        return group.groupName
      } else {
        return group.groupName + " (" + group.groupShort + ")"
      }
    },
    formatTeamName: function(team) {
      if (this.inMultipleGroups) {
        if (team.groupShort == null) {
          return team.teamName + " (" + team.groupName + ")"
        } else {
          return team.teamName + " (" + team.groupShort + ")"
        }
      } else {
        return team.teamName
      }
    },
    showPreferences: function(group) {
      return group.inSignupPhase
    },
    viewTeam: function(team) {
      eventBus.$emit('view-team', team);
    },
    viewGroup: function(group) {
      eventBus.$emit('view-group', group);
    },
    showNewGroup: function() {
      eventBus.$emit('new-group');
    }
  }
};
</script>

<style scoped>
.team-section {
  margin-bottom: 20px;
}
.block {
  display: inline-block;
  padding: 10px 15px;
  margin-right: 8px;
  margin-bottom: 8px;
  background-color: var(--blue);
  color: white;
  border-radius: 3px;
  font-weight: 600;
  cursor: hand;
  cursor: pointer;
}
</style>