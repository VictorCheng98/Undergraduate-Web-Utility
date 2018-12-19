<template>
  <div id="admin-page">
    <div class="tab-buttons" v-if="ownsMultipleGroups">
      <button v-for="(group, index) in groups" v-bind:key="group.groupID" v-bind:class="{ active: index == currentGroupIndex }" v-on:click="setGroupIndex(index)">{{ formatGroupShort(group) }}</button>
    </div>
    <div v-if="dataLoaded">
      <h2>Group name: {{ formatCurrentgroupName }}</h2>
      <CreateTeam v-bind:group="currentGroup" />
      <h2>Edit Teams</h2>
      <TeamControls v-for="team in currentTeams" v-bind:key="team.teamID" v-bind:team="team" />
      <p v-if="noTeams">No teams to display.</p>
      <PhaseControls v-bind:group="currentGroup" />
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { eventBus } from "../../main";

import CreateTeam from "./CreateTeam.vue";
import TeamControls from "./TeamControls.vue";
import PhaseControls from "./PhaseControls.vue";

export default {
  name: "AdminPage",

  props: {
    user: Object,
  },

  components: {
    CreateTeam,
    TeamControls,
    PhaseControls,
  },

  data() {
    return {
      groups: [],
      currentGroupIndex: 0,
    };
  },

  computed: {
    dataLoaded: function() {
      return this.groups.length >= 1;
    },
    ownsMultipleGroups: function () {
      return this.groups.length > 1;
    },
    formatCurrentgroupName: function() {
      if (this.currentGroup.groupShort == null) {
        return this.currentGroup.groupName
      } else {
        return this.currentGroup.groupName + " (" + this.currentGroup.groupShort + ")"
      }
    },
    currentGroup: function() {
      return this.groups[this.currentGroupIndex];
    },
    currentTeams: function() {
      return this.currentGroup.teams;
    },
    noTeams: function() {
      return this.currentTeams.length == 0;
    }
  },

  created: function() {
    this.getAllData();

    eventBus.$on("reload-admin", () => {
      this.getAllData();
    });
  },

  methods: {
    getAllData: function() {
      const adminID = this.user.userID;
      axios
        .get(`/api/groups/${adminID}`)
        .then((groups) => {
          this.groups = groups.data;
        })
    },
    setGroupIndex: function(index) {
      this.currentGroupIndex = index;
    },
    formatGroupShort: function(group) {
      if (group.groupShort == null) {
        return group.groupName
      } else {
        return group.groupShort
      }
    },
  }
};
</script>

<style scoped>
.tab-buttons {
  display: flex;
  justify-content: space-around;
  background-color: #ddd;
  margin-bottom: 10px;
  border-radius: 10px;
}

.tab-buttons button.active {
  background-color: rgba(110,110,110);
  color: white;
}
</style>