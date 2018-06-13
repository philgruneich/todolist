<template>
  <div :class="['weekday', {'is--past': past, 'is--today': today, 'is--future': future}]">
    <div class="weekday__header">
      <div class="weekday__title" v-if="weekday">{{weekday}}</div>
      <div class="weekday__date" v-if="fulldate">{{fulldate}}</div>
    </div>
    <form action="" @submit.prevent="addTask($event)">
      <input type="text" name="task" placeholder="Nova Tarefa" v-model="new_task" autocomplete="off">
    </form>
    <draggable class="weekday__list" @update="updateList($event)">
      <task v-for="task, index in sorteredTasks" :task=task :key=task.id @update="updateTask($event)"></task>
    </draggable>
  </div>
</template>

<script>
import task from './Task.vue';
import { format, isPast, isFuture, isToday } from 'date-fns';
import marked from 'marked';
import draggable from 'vuedraggable';

export default {
  name: 'weekday',
  data() {
    return {
      new_task: "",
      localTasks: []
    };
  },
  computed: {
    weekday() {
      return format(this.date, 'dddd');
    },

    fulldate() {
      return format(this.date, 'DD MMMM, YYYY');
    },

    past() {
      return isPast(this.date);
    },

    today() {
      return isToday(this.date);
    },

    future() {
      return isFuture(this.date);
    },

    sorteredTasks() {
      return this.localTasks.sort((a, b) => +a.order - +b.order) || [];
    }
  },
  watch: {
    'tasks': {
      handler(tasks) {
        this.localTasks = this.tasks;
      }
    }
  },
  methods: {
    array_move(arr, old_index, new_index) {
      if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;
        while (k--) {
          arr.push(undefined);
        }
      }
      arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
      return arr; // for testing
    },
    addTask(event) {
      // event.preventDefault();
      var markedRenderer = new marked.Renderer() ;
      markedRenderer.paragraph = function(text) {
        return text + '\n';
      };

      let t = {
        html: marked(this.new_task, {renderer: markedRenderer, gfm: true}),
        rawtext: this.new_task,
        duedate: this.date,
        done: false
      }

      this.new_task = '';

      this.$emit('addTask', t);
    },

    updateTask(task) {
      this.$emit('updateTask', task);
    },

    updateList(event) {
      let tasks = this.array_move(this.localTasks, event.oldIndex, event.newIndex);
      let list = tasks.map((t, i) => {
        t.order = i;
        return t;
      });
      this.localTasks = list;
      this.$emit('updateList', list);
    }
  },
  components: {
    task,
    draggable
  },
  props: {
    date: {required: true},
    tasks: {
      type: Array,
      default: () => []
    }
  }
};
</script>

<style lang="sass" scoped>
  .weekday {
    flex: 1 0 20%;
    padding: 1em;
    font-family: sans-serif;

    + .weekday {
      border-left: 1px solid #000;
    }

    &.is--past {
      color: #778ca3;
    }

    &.is--today {
      color: #eb3b5a;
    }

    &__header {
      text-align: center;
      margin-bottom: 1em;
    }

    &__title {
      text-transform: uppercase;
      font-weight: 700;
    }

    &__date {
      font-size: .75em;
    }

    &__list {
      padding: 0;
      list-style: none;
      margin: 0;
    }
  }
</style>
