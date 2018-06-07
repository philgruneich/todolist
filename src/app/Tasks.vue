<template>
  <section>
    <aside>
      <button type="button" aria-title="Voltar um dia." @click="daysBack(1)">&lt;</button>
      <button type="button" aria-title="Voltar 5 dias." @click="daysBack(5)">&lt;&lt;</button>
      <button type="button" aria-title="Hoje" @click="setDate()">H</button>
    </aside>
    <div class="container">
      <weekday
        :date=date
        v-for="date, index in rangeOfDates"
        @addTask="addTask($event)"
        :key=index
      ></weekday>
    </div>
    <aside>
      <button type="button" aria-title="Avançar um dia." @click="daysForward(1)">&gt;</button>
      <button type="button" aria-title="Avançar 5 dias." @click="daysForward(5)">&gt;&gt;</button>
    </aside>
  </section>
</template>

<script>
import weekday from './components/Weekday.vue';
import { format, isAfter, isBefore, isValid, isPast, isFuture, differenceInDays, eachDay, isToday, addDays, subDays } from 'date-fns';


export default {
  name: 'Tasks',
  data() {
    return {
      rangeOfDates: [],
      queue: []
    };
  },
  created() {
    const today = new Date();

    this.rangeOfDates = eachDay(
      subDays(today, 2),
      addDays(today, 2)
    );

    const request = window.indexedDB.open("tasks", 1);

    request.onupgradeneeded = (event) => {
      this.database = request.result;

      const schema = [
        {name: "task", keyPath: "id", autoIncrement: true, indexes: [
          ["html", "html", {unique: false}],
          ["rawtext", "rawtext", {unique: false, required: true}],
          ["duedate", "duedate", {unique: false, required: true}],
          ["done", "done", {unique: false, required: true}]
        ]}];

      for (let i = 0; i < schema.length; i++) {
        let params = schema[i];
        let addRequest = this.database.createObjectStore(params.name, {keyPath: params.keyPath, autoIncrement: params.autoIncrement}, );

        (params.indexes || []).forEach((index) => {
          addRequest.createIndex(...index)
        });
      }
    }

    request.onsuccess = (event) => {
      this.database = request.result;
      let taskTransaction = this.database.transaction(['task']);
      let taskObjectStore = taskTransaction.objectStore('task');
      let taskRange = IDBKeyRange.bound(subDays(today, 2), addDays(today, 2));
      let taskIndex = taskObjectStore.index('duedate');
      let taskGet = taskIndex.get(taskRange);

      taskGet.onsuccess = (event) => {
        console.log(taskGet);
      }
    }
  },
  methods: {
    daysBack(n) {
      this.rangeOfDates = this.rangeOfDates.map((date) => {
        return subDays(date, +n);
      });
    },
    daysForward(n) {
      this.rangeOfDates = this.rangeOfDates.map((date) => {
        return addDays(date, +n);
      });
    },
    setDate(date=new Date()) {
      this.rangeOfDates = eachDay(
        subDays(date, 2),
        addDays(date, 2)
      );
    },

    addTask(task) {
      if (this.database) {
        console.log(this.database);
        let taskTransaction = this.database.transaction(["task"], "readwrite");
        let taskObjectStore = taskTransaction.objectStore("task");
        taskObjectStore.add(task);
      }
    },

    loadData(db) {
      this.database = db;
    }
  },
  components: {
    weekday
  }
};
</script>

<style lang="sass" scoped>
  section {
    display: flex;
    max-width: 1024px;
    margin: auto;
  }

  .container {
    flex-grow: 1;
    display: flex;
  }

  aside {
    flex: 0 1 auto;
  }
</style>
