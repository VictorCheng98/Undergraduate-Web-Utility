<template>
  <div id="announcements-page">
    <h2>Announcements</h2>
    <div v-if="noAnnouncements">
      No announcements to display.
    </div>
    <div v-else>
      <Announcement
        v-for="announcement in announcements"
        v-bind:key="announcement.id"
        v-bind:announcement="announcement"
        v-bind:user="user"
      />
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { eventBus } from "../../main";

import Announcement from "./Announcement.vue";

export default {
  name: "AnnouncementsPage",

  props: {
    user: Object,
  },

  components: {
    Announcement
  },

  data() {
    return {
      announcements: null
    };
  },

  computed: {
    noAnnouncements: function () {
      return this.announcements == null || this.announcements.length == 0;
    },
  },

  created: function() {
    this.getAnnouncements();
    eventBus.$on("reload-announcements", () => {
      this.getAnnouncements();
    });
  },

  methods: {
    getAnnouncements: function() {
      axios
        .get('api/users/currentuser/announcements')
        .then((announcements) => {
          this.announcements = announcements.data;
        })
    }
  }
};
</script>