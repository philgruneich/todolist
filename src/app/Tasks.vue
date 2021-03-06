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
        :tasks=tasks[index]
        v-for="date, index in rangeOfDates"
        @addTask="addTask($event)"
        @updateTask="updateTask($event)"
        @updateList="updateList($event)"
        @movedToList="movedToList($event)"
        :key=date.toString()
      ></weekday>
      <div v-if="!rangeOfDates.length">You're looking for tasks in a date that doesn't exists. Sounds really hard, doesn't it?</div>
    </div>
    <aside>
      <button type="button" aria-title="Avançar um dia." @click="daysForward(1)">&gt;</button>
      <button type="button" aria-title="Avançar 5 dias." @click="daysForward(5)">&gt;&gt;</button>
      <input type="date" @change="setDate($event.target.value)" @blur="$event.target.value = ''">
    </aside>
    <upcoming :tasks="upcomingTasks" @goto="setDate($event)"></upcoming>

  </section>
</template>

<script>
import weekday from './components/Weekday.vue';
import upcoming from './components/Upcoming.vue';
import { format, isAfter, isBefore, isValid, isPast, isFuture, differenceInDays, eachDay, isToday, addDays, subDays, isSameDay } from 'date-fns';

export default {
  name: 'Tasks',
  data() {
    return {
      rangeOfDates: [],
      upcomingTasks: [],
      queue: Promise.resolve(),
      cachedData: []
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
          ["done", "done", {unique: false, required: true}],
          ["order", "order", {unique: false, required: true}]
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
      this.loadData();

    }
  },
  computed: {
    tasks() {
      return this.rangeOfDates.map((date) => {
        let lookup = this.cachedData.find((cache) => {
          return isSameDay(cache.day, date);
        });

        if (lookup) return lookup.tasks.sort((a, b) => +a.order - +b.order);

        return [];
      });
    }
  },
  methods: {
    daysBack(n) {
      this.rangeOfDates = this.rangeOfDates.map((date) => {
        return subDays(date, +n);
      });

      this.loadData();
    },
    daysForward(n) {
      this.rangeOfDates = this.rangeOfDates.map((date) => {
        return addDays(date, +n);
      });

      this.loadData();
    },
    setDate(date=new Date()) {
      this.rangeOfDates = eachDay(
        subDays(date, 2),
        addDays(date, 2)
      );

      this.loadData();
    },

    addTask(task) {
      if (this.database) {
        let cacheIndex = this.cachedData.findIndex((cache) => {
          return isSameDay(cache.day, task.duedate);
        });

        task.order = (cacheIndex > -1) ? (this.cachedData[cacheIndex].tasks.length || 0) : 0;

        let taskTransaction = this.database.transaction(["task"], "readwrite");
        let taskObjectStore = taskTransaction.objectStore("task");
        let taskAdd = taskObjectStore.add(task);

        taskAdd.onsuccess = (event) => {
          task.id = event.target.result;
          this.addTaskToCache(task);
        }
      }
    },

    updateList(tasks) {
      (tasks || []).forEach((t, i, a) => {
        t.order = i;
        let p = this.updateTask(t);
        (a.length - 1) === i && p.then(this.loadUpcomingEvents);
      });

    },

    movedToList(data) {
      const event = data.event;
      const newdate = data.date;
      let task = data.task;
      const olddate = task.duedate;

      // Looks for old cache
      let oldCacheIndex = this.cachedData.findIndex((cache) => {
        return isSameDay(cache.day, olddate);
      });

      if (oldCacheIndex > -1) {
        let taskIndex  = this.cachedData[oldCacheIndex].tasks.findIndex((cache) => {
          return cache.id == task.id;
        });

        if (taskIndex > -1) {
          // Removes from previous cache
          this.cachedData[oldCacheIndex].tasks.splice(taskIndex, 1);

          // Updates order from the previous tasks
          this.updateList(this.cachedData[oldCacheIndex].tasks);

          // Looks for new cache
          let newCacheIndex = this.cachedData.findIndex((cache) => {
            return isSameDay(cache.day, newdate);
          });

          task.duedate = newdate;
          task.order = +event.newIndex;

          if (newCacheIndex > -1) {
            this.cachedData[newCacheIndex].tasks.splice(+task.order, 0, task);
            this.updateList(this.cachedData[newCacheIndex].tasks)
          } else {
            let nn = this.cachedData.push({
              day: newdate,
              tasks: [task]
            });
            this.updateTask(task).then(this.loadUpcomingEvents)
          }
        }
      }
    },

    updateTask(task) {
      return this.queue.then(() => {
        return new Promise((resolve, reject) => {
          if (this.database) {
            let taskTransaction = this.database.transaction(["task"], "readwrite");
            let taskObjectStore = taskTransaction.objectStore("task");
            let taskPut = task.rawtext.length ? taskObjectStore.put(task) : taskObjectStore.delete(task.id);

            taskPut.onsuccess = (event) => {
              let cacheIndex = this.cachedData.findIndex((cache) => {
                return isSameDay(cache.day, task.duedate);
              });

              if (cacheIndex > -1) {
                let taskIndex  = this.cachedData[cacheIndex].tasks.findIndex((cache) => {
                  return cache.id == task.id;
                });

                if (taskIndex > -1) {
                  if (task.rawtext.length) {
                    this.cachedData[cacheIndex].tasks[taskIndex] = task;
                  } else {
                    this.cachedData[cacheIndex].tasks.splice(taskIndex, 1);
                  }
                }
              }

              return resolve(task);
            }

            taskPut.onerror = (error) => {
              console.error(error);
              return reject(task);
            }
          }
        });
      })
    },

    addTaskToCache(task) {
      let cacheIndex = this.cachedData.findIndex((cache) => {
        return isSameDay(cache.day, task.duedate);
      });

      if (cacheIndex > -1) {

        if (!this.cachedData[cacheIndex].tasks.some((cache) => {
          return cache.id == task.id;
        })) this.cachedData[cacheIndex].tasks.push(task);
      } else {
        this.cachedData.push({
          day: task.duedate,
          tasks: [ task ]
        });
      }
    },

    loadUpcomingEvents() {
      const N_EVENTS = 20;
      let taskTransaction = this.database.transaction('task', 'readonly');
      let taskObjectStore = taskTransaction.objectStore('task');
      let taskRange = IDBKeyRange.lowerBound(new Date());
      let taskIndex = taskObjectStore.index('duedate');
      // let taskGet = taskIndex.getAll(taskRange);
      let taskCursor = taskIndex.openCursor();
      let i = 0;
      let tasks = [];

      taskCursor.onsuccess = (event) => {
        let cursor = event.target.result;
        if(cursor && i < N_EVENTS) {
          tasks.push(cursor.value);
          i++;
          cursor.continue();
        } else {
          this.upcomingTasks = tasks.sort((a, b) => {
            let n = a.duedate - b.duedate;
            if (n !== 0) return n;
            return a.order - b.order;
          });
        }
      }
    },

    loadData() {
      if (!this.rangeOfDates.length) return false;
      let taskTransaction = this.database.transaction('task');
      let taskObjectStore = taskTransaction.objectStore('task');
      let taskRange = IDBKeyRange.bound(this.rangeOfDates[0], this.rangeOfDates[4]);
      let taskIndex = taskObjectStore.index('duedate');
      let taskGet = taskIndex.getAll(taskRange);

      taskGet.onsuccess = (event) => {
        taskGet.result.forEach(this.addTaskToCache.bind(this));
        this.loadUpcomingEvents();
      }
    }
  },
  components: {
    weekday,
    upcoming
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
