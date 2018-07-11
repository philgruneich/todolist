<template>
  <div :class="['weekday', {'is--past': past, 'is--today': today, 'is--future': future}]">
    <div class="weekday__header">
      <div class="weekday__title" v-if="weekday">{{weekday}}</div>
      <div class="weekday__date" v-if="fulldate">{{fulldate}}</div>
    </div>
    <form action="" @submit.prevent="addTask">
      <input type="text" name="task" placeholder="Nova Tarefa" v-model="new_task" autocomplete="off">
    </form>
    <draggable class="weekday__list" @update="updateList" @remove="removedFromList" @add="addedToList" :options=options v-model="localTasks">
      <task v-for="task, index in localTasks" :task=task :key=task.id @update="updateTask"></task>
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
      localTasks: [],
      options: {
        group: 'weekday'
      }
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
    }
  },
  watch: {
    'tasks': {
      immediate: true,
      handler(tasks) {
        this.localTasks = this.tasks;
      }
    }
  },
  methods: {
    addTask(event) {
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

    removedFromList(event) {
      this.$emit('movedFromList', {event, date: this.date});
    },

    addedToList(event) {
      this.$emit('movedToList', {event, date: this.date, task: this.localTasks[event.newIndex]})
    },

    updateList(event) {
      this.localTasks = this.localTasks.map((t, i) => {
        t.order = i;
        return t;
      });
      this.$emit('updateList', this.localTasks);
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
      min-height: 200px;
    }
  }
</style>
