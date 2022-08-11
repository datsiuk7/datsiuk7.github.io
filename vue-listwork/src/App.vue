<template>
  <v-app>
    <v-main>
      <v-tabs v-model="activeTab" class="bg-blue mb-5"  grow color="white">
        <v-tab v-for="tab of tabs" :key="tab.id" :to="tab.route" >
          {{ tab.name }}
        </v-tab>
      </v-tabs>
      <router-view/>

    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App',

  data: () => ({
    activeTab: '/',
    tabs: [
      {id: 0,name: "Головна",route: '/'},
      {id: 1,name: "Історія",route: '/history'},
      {id: 2,name: "Налаштування",route: '/setting'}
    ]
  }),
}
</script>
<style media="screen">
.router {
  background-color: #3ea2fb;
}
</style>
