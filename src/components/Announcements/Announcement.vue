<template>
  <div class="announcement">
    <div class="announcement-content">
      <p class="meta">Posted
        <span>{{ timeSince(announcement.timestamp) }}</span>
        by
        <span>{{ announcement.username }}</span>
        in
        <span>{{ announcement.groupName }}</span>
      </p>
      <p v-if="!showTextarea" v-html="parseLinks(announcement.text)" />
      <div v-if="showTextarea">
        <textarea v-model.trim='newText' type='text' name='edit announcement'></textarea>
        <button name='edit' v-on:click="editAnnouncement">Edit Announcement</button>
        <button name='cancel' v-on:click="setShowTextarea(false)">Cancel</button>
      </div>
    </div>
    <div class="announcement-actions" v-if="showActions">
      <i class="fas fa-pen" v-on:click="setShowTextarea(true)"></i>
      <i class="fas fa-trash" v-on:click="deleteAnnouncement"></i>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { eventBus } from "../../main";

export default {
  name: "Announcement",

  props: {
    announcement: Object,
    user: Object,
  },

  data() {
    return {
      showTextarea: false,
      newText: this.announcement.text,
    };
  },

  computed: {
    showActions: function () {
      return this.announcement.announcerID === this.user.userID && !this.showTextarea;
    },
  },

  methods: {
    setShowTextarea(value) {
      this.showTextarea = value;
    },
    editAnnouncement: function() {
      const groupID = this.announcement.groupID;
      const announcementID = this.announcement.announcementID;
      const bodyContent = {text: this.newText};
      axios 
        .put(`/api/groups/${groupID}/announcements/${announcementID}`, bodyContent)
        .then(() => {
          this.showTextarea = false;
          eventBus.$emit('reload-announcements');
        })
        .catch(err => {
          eventBus.$emit('new-message', {text: err.response.data, type: 'error'});
        });
    },
    deleteAnnouncement: function() {
      const groupID = this.announcement.groupID;
      const announcementID = this.announcement.announcementID;
      axios
        .delete(`/api/groups/${groupID}/announcements/${announcementID}`)
        .then(() => {
          eventBus.$emit('reload-announcements');
        })
        .catch(err => {
          eventBus.$emit('new-message', {text: err.response.data, type: 'error'});
        });
    },
    parseLinks: function(inputText) {
      // source: https://stackoverflow.com/questions/37684/how-to-replace-plain-urls-with-links
      var replacedText, replacePattern1, replacePattern2, replacePattern3;
      replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
      replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');
      replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
      replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');
      replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
      replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

      return replacedText;
    },
    timeSince: function(date) {
      // source: https://stackoverflow.com/questions/3177836/how-to-format-time-since-xxx-e-g-4-minutes-ago-similar-to-stack-exchange-site
      if (typeof date !== 'object') {
        date = new Date(date);
      }
      var seconds = Math.floor((new Date() - date) / 1000);
      var intervalType;
      var interval = Math.floor(seconds / 31536000);
      if (interval >= 1) {
        intervalType = 'year';
      } else {
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) {
          intervalType = 'month';
        } else {
          interval = Math.floor(seconds / 86400);
          if (interval >= 1) {
            intervalType = 'day';
          } else {
            interval = Math.floor(seconds / 3600);
            if (interval >= 1) {
              intervalType = "hour";
            } else {
              interval = Math.floor(seconds / 60);
              if (interval >= 1) {
                intervalType = "minute";
              } else {
                interval = seconds;
                intervalType = "second";
              }
            }
          }
        }
      }
      if (interval > 1 || interval === 0) {
        intervalType += 's';
      }
      return interval + ' ' + intervalType + ' ago';
    }
  }
};
</script>
<style scoped>
.announcement {
  background-color: white;
  padding: 15px 22px;
  margin: 10px 0;
  border-radius: 5px;
  display: flex;
}
.meta {
  color: rgb(150,150,150);
  font-size: 0.8em;
  margin-bottom: 5px;
}
.meta span {
  font-weight: 700;
}
.announcement-content {
  flex-grow: 1;
}
.announcement-actions {
  cursor: hand;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.announcement-actions i {
  color: lightgray;
  font-size: 14px;
}
.announcement-actions i:hover {
  color: darkgray;
}
.announcement-actions i.fa-pen {
  margin-bottom: 5px;
}
textarea {
  width: 100%;
  border: 1px solid lightgray;
  font-size: 0.9em;
  padding: 10px 16px;
  margin-top: 5px;
  height: 65px;
  resize: none;
  border-radius: 6px;
}
button {
  color: white;
  float: right;
  margin-top: 5px;
}
button[name="edit"]  {
  background-color: var(--primary);
}
button[name="cancel"]  {
  background-color: #AAA;
  margin-right: 10px;
}
</style>