<template>
  <div id="settings-page">
    <ChangeUsername/>
    <ChangePassword/>
    <DeleteUser/>
  </div>
</template>

<script>
import ChangeUsername from "./ChangeUsername.vue";
import ChangePassword from "./ChangePassword.vue";
import DeleteUser from "./DeleteUser.vue";

export default {
  name: "SettingsPage",

  props: {
    user: Object,
  },

  components: {
    ChangeUsername,
    ChangePassword,
    DeleteUser,
  },
};
</script>

<style scoped>
#settings-page {
  margin: 0 auto;
  width: fit-content;
}
</style>