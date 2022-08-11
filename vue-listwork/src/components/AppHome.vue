<template>
<v-form v-model="valid" lazy-validation>
  <v-container class="bg-surface-variant">
    <v-row justify="center">
      <v-col  cols="12" sm="1">
        <v-checkbox v-model="done" @update:modelValue="updateItemLocal" hide-details></v-checkbox>
      </v-col>
      <v-col cols="12" sm="4">
        <v-text-field v-model="textHeader" label="Заголовок"  :rules="textRules"></v-text-field>
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field v-model="textDesc" label="Опис" required :rules="textRules"></v-text-field>
      </v-col>
      <v-col cols="12" sm="1">
        <v-btn color="blue" height="55" @click="add" :disabled="!valid">
          <v-icon size="25">mdi-plus</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</v-form>
<v-snackbar v-model="snackbarAdd" :timeout="2000" color="blue">{{MassageAdd}}</v-snackbar>
<v-snackbar v-model="snackbarRemove" :timeout="2000" color="error">{{MassageRemove}}</v-snackbar>

<!-- {{items}} -->
<v-container>
  <template v-if="items.length">
  <v-card v-for="(item,index) of items" :key="item.index" class="py-2 my-1">
    <v-row justify="center" align="center" :style="[!item.done?{backgroundColor: '#dc3545aa'}:{backgroundColor: '#3ea2fbaa'}]" color="success">
      <v-col sm="1">
        <v-checkbox v-model="item.done" @update:modelValue="updateItemLocal" hide-details></v-checkbox>
      </v-col>
      <v-col cols="12" sm="8">
        <v-card-title>{{item.header}}</v-card-title>
        <v-card-subtitle>{{item.desc}}</v-card-subtitle>
      </v-col>

      <v-col cols="12" sm="1" align="center">
        <v-btn v-if="index > 0" color="success" @click="sort(index,'up')">
          <v-icon size="25">mdi-arrow-up</v-icon>
        </v-btn>
        <v-btn v-if="this.items.length != (index+1)" color="success" @click="sort(index, 'down')">
          <v-icon  size="25">mdi-arrow-down</v-icon>
        </v-btn>
      </v-col>

      <v-col cols="12" sm="1" align="center">
        <v-btn color="orange" @click="edit(index)">
          <v-icon size="25">mdi-pencil</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="12" sm="1" align="center">
        <v-btn color="error" @click="remove(index)">
          <v-icon size="25">mdi-delete</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <!-- <hr> -->
  </v-card>
  </template>
  <template v-else>
    <v-card>
      <v-card-title>
        Нічого немає, додайте нову справу
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
      textHeader: "",
      textDesc: "",
      done: false,
      items: [],
      itemsDelete: [],
      valid: true,
      textRules: [
        v => !!v || 'Поле не може бути пустим',
      ],
      snackbarAdd: false,
      snackbarRemove: false,
      MassageAdd: "",
      MassageRemove: "",
      checkbox: true,
    }
  },
  methods: {
    add() {
      this.items.unshift({
        header: this.textHeader,
        desc: this.textDesc,
        done: this.done,
      })
      this.MassageAdd = "Додано: " + this.textHeader;

      this.textHeader = this.textDesc = "";
      this.done = false;
      this.snackbarAdd = true;
      this.updateItemLocal();
    },
    edit(index) {
      this.textHeader = this.items[index].header;
      this.textDesc = this.items[index].desc;
      this.done = this.items[index].done;
      this.remove(index, true);
    },
    remove(index, notHistory = false) {
      this.snackbarRemove = true;
      if(!notHistory){
        this.itemsDelete.unshift(this.items[index]);
        this.MassageRemove = "Видалено в історію: " + this.items[index].header;
        this.updateItemDeleteLocal();
      }
      else{
        this.MassageRemove = "Редагування: " + this.items[index].header;
      }
      this.items.splice(index, 1);
      this.updateItemLocal();
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
      console.log(index + " - " + direct + " - " + this.items.length);
      if(direct == "up"){
        [this.items[index],this.items[index-1]] = [this.items[index-1],this.items[index]];
      }
      else if(direct == "down"){
        [this.items[index],this.items[index+1]] = [this.items[index+1],this.items[index]];
      }
      this.updateItemLocal();
    }
  },
  mounted() {
    if (localStorage.items) {
      this.items = JSON.parse(localStorage.getItem('items'));
    }
    if (localStorage.itemsDelete) {
      this.itemsDelete = JSON.parse(localStorage.getItem('itemsDelete'));
    }
  },
}
</script>
<style media="screen">
  .card-bgc-secondary{
    background-color: secondary;
  }
  .card-bgc-error{
    background-color: error;
  }
</style>
