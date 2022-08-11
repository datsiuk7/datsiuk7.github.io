<template>
<v-snackbar v-model="snackbarRemove" :timeout="2000" color="error">{{MassageRemove}}</v-snackbar>
<v-snackbar v-model="snackbarRestore" :timeout="2000" color="success">{{MassageRestore}}</v-snackbar>

<v-container>
  <template v-if="itemsDelete.length">
    <v-card v-for="(item,index) of itemsDelete" :key="item.index">
      <v-row justify="center" align="center" :style="[!item.done?{backgroundColor: '#dc3545'}:{backgroundColor: '#3ea2fb'}]" color="success">
        <v-col sm="1">
          <v-checkbox disabled v-model="item.done" @update:modelValue="updateItemLocal" hide-details></v-checkbox>
        </v-col>
        <v-col cols="12" sm="8">
          <v-card-title>{{item.header}}</v-card-title>
          <v-card-subtitle>{{item.desc}}</v-card-subtitle>
        </v-col>

        <v-col cols="12" sm="1" align="center">
          <v-btn v-if="index > 0" color="success" @click="sort(index,'up')">
            <v-icon size="25">mdi-arrow-up</v-icon>
          </v-btn>
          <v-btn v-if="this.itemsDelete.length != (index+1)" color="success" @click="sort(index, 'down')">
            <v-icon  size="25">mdi-arrow-down</v-icon>
          </v-btn>
        </v-col>

        <v-col cols="12" sm="1" align="center">
          <v-btn color="success" @click="restore(index)">
            <v-icon size="25">mdi-arrow-left</v-icon>
          </v-btn>
        </v-col>

        <v-col cols="12" sm="1" align="center">
          <v-btn color="error" @click="remove(index)">
            <v-icon size="25">mdi-delete</v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <hr>
    </v-card>
  </template>
  <template v-else>
    <v-card>
      <v-card-title>
        Нічого немає, видаліть одну із справ
      </v-card-title>
    </v-card>
  </template>
</v-container>
</template>

<script>
export default {
  name: 'HelloWorld',

  data() {
    return {
      itemsDelete: [],
      items: [],
      snackbarRemove: false,
      snackbarRestore: false,
      MassageRemove: "",
      MassageRestore: "",
      checkbox: true,
    }
  },
  methods: {
    remove(index) {
      this.MassageRemove = "Видалено назавжди: " + this.itemsDelete[index].header;
      this.snackbarRemove = true;
      this.itemsDelete.splice(index, 1);
      this.updateItemDeleteLocal();
    },
    restore(index) {
      this.MassageRestore = "Відновлено на головну: " + this.itemsDelete[index].header;
      this.snackbarRestore = true;
      this.items.unshift(this.itemsDelete[index]);
      this.itemsDelete.splice(index, 1);
      this.updateItemLocal();
      this.updateItemDeleteLocal();
    },
    updateItemLocal() {
      console.log("updateLocalStorage");
      let items = JSON.stringify(this.items);
      localStorage.setItem('items', items);
    },
    updateItemDeleteLocal() {
      console.log("updateItemDeleteLocal");
      let itemsDelete = JSON.stringify(this.itemsDelete);
      localStorage.setItem('itemsDelete', itemsDelete);
    },
    sort(index, direct){
      console.log(index + " - " + direct + " - " + this.itemsDelete.length);
      if(direct == "up"){
        [this.itemsDelete[index],this.itemsDelete[index-1]] = [this.itemsDelete[index-1],this.itemsDelete[index]];
      }
      else if(direct == "down"){
        [this.itemsDelete[index],this.itemsDelete[index+1]] = [this.itemsDelete[index+1],this.itemsDelete[index]];
      }
      this.updateItemDeleteLocal();
    }
  },
  mounted() {
    if (localStorage.itemsDelete) {
      this.itemsDelete = JSON.parse(localStorage.getItem('itemsDelete'));
    }
    if (localStorage.items) {
      this.items = JSON.parse(localStorage.getItem('items'));
    }
  },
}
</script>
<style media="screen">

</style>
